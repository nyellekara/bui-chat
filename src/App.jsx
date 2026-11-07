/** @jsxImportSource @blender-ui/react */
import React, { useState, useEffect, useRef } from 'react'
import crypto from 'node:crypto'
import {
  loadConversations,
  saveConversations,
  loadSettings,
  saveSettings,
} from './services/storage.js'
import { generateTitle } from './services/title.js'
import { streamChatCompletion } from './api/sarvam.js'
import { streamMockCompletion } from './api/mock.js'
import { parseMessageContent } from './services/markdown.js'
import { copyToClipboard } from './services/clipboard.js'
import { SettingsModal } from './components/SettingsModal.jsx'
import { HistoryDrawer } from './components/HistoryDrawer.jsx'
import { CSS } from './styles.js'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

function createEmptyConversation() {
  return {
    id: crypto.randomUUID(),
    title: 'New Conversation',
    sessionId: crypto.randomUUID(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

const CHIPS = [
  'Explain BUI native architecture',
  'Help me debug some code',
  'Design a software architecture',
  'Review this code for performance',
]

export function App() {
  const initialConvs = loadConversations()
  const defaultConv = (initialConvs && initialConvs.length > 0) ? initialConvs : [createEmptyConversation()]

  const [conversations, setConversations] = useState(defaultConv)
  const [activeId, setActiveId] = useState(defaultConv[0].id)
  const [settings, setSettings] = useState(() => loadSettings())
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')

  const abortControllerRef = useRef(null)

  useEffect(() => {
    const list = getVal(conversations)
    if (Array.isArray(list) && list.length > 0) {
      saveConversations(list)
    }
  }, [conversations])

  const convList = getVal(conversations) || []
  const currentActiveId = getVal(activeId)
  const activeConversation = convList.find(c => c.id === currentActiveId) || convList[0] || null
  const currentSettings = getVal(settings) || {}
  const hasKey = !!(currentSettings.apiKey && currentSettings.apiKey.trim().length > 0)
  const isMock = !!currentSettings.mockMode
  const messages = activeConversation?.messages || []
  const hasStartedChatting = messages.length > 0
  const generating = !!getVal(isGenerating)
  const currentInput = getVal(inputPrompt) || ''
  const hasText = currentInput.trim().length > 0

  const handleNewConversation = () => {
    if (generating) handleStop()
    const newConv = createEmptyConversation()
    setConversations(prev => [newConv, ...(getVal(prev) || [])])
    setActiveId(newConv.id)
    setErrorMessage(null)
    setInputPrompt('')
  }

  const handleDeleteConversation = (id) => {
    if (generating && activeConversation?.id === id) {
      handleStop()
    }
    const filtered = convList.filter(c => c.id !== id)
    if (filtered.length === 0) {
      const fresh = createEmptyConversation()
      setConversations([fresh])
      setActiveId(fresh.id)
    } else {
      setConversations(filtered)
      if (currentActiveId === id) {
        setActiveId(filtered[0].id)
      }
    }
    setErrorMessage(null)
  }

  const handleSelectConversation = (id) => {
    if (id === currentActiveId) return
    if (generating) handleStop()
    setActiveId(id)
    setErrorMessage(null)
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
  }

  const handleSendMessage = async (rawText) => {
    const text = (rawText || currentInput).trim()
    if (!text || generating || !activeConversation) return

    setInputPrompt('')
    setErrorMessage(null)

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    const isFirst = (activeConversation.messages || []).length === 0
    const newTitle = isFirst ? generateTitle(text) : activeConversation.title
    const updatedMessages = [...(activeConversation.messages || []), userMsg, assistantMsg]

    setConversations(prevList => {
      const list = getVal(prevList) || []
      return list.map(c => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: Date.now(),
          }
        }
        return c
      })
    })

    setIsGenerating(true)
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const onDelta = (chunk) => {
      setConversations(prevList => {
        const list = getVal(prevList) || []
        return list.map(c => {
          if (c.id === activeConversation.id) {
            const msgs = [...c.messages]
            const last = msgs[msgs.length - 1]
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...last,
                content: last.content + chunk,
              }
            }
            return { ...c, messages: msgs, updatedAt: Date.now() }
          }
          return c
        })
      })
    }

    const onComplete = (finalText) => {
      setIsGenerating(false)
      abortControllerRef.current = null
      setConversations(prevList => {
        const list = getVal(prevList) || []
        return list.map(c => {
          if (c.id === activeConversation.id) {
            const msgs = [...c.messages]
            const last = msgs[msgs.length - 1]
            if (last && last.role === 'assistant') {
              msgs[msgs.length - 1] = {
                ...last,
                content: finalText || last.content,
              }
            }
            return { ...c, messages: msgs, updatedAt: Date.now() }
          }
          return c
        })
      })
    }

    const onError = (err, partialText) => {
      setIsGenerating(false)
      abortControllerRef.current = null
      setErrorMessage(err.message || 'Request failed.')
      if (partialText) {
        setConversations(prevList => {
          const list = getVal(prevList) || []
          return list.map(c => {
            if (c.id === activeConversation.id) {
              const msgs = [...c.messages]
              const last = msgs[msgs.length - 1]
              if (last && last.role === 'assistant') {
                msgs[msgs.length - 1] = { ...last, content: partialText }
              }
              return { ...c, messages: msgs }
            }
            return c
          })
        })
      }
    }

    if (currentSettings.mockMode) {
      await streamMockCompletion({
        messages: updatedMessages.slice(0, -1),
        signal: abortController.signal,
        onDelta,
        onComplete,
        onError,
      })
    } else {
      await streamChatCompletion({
        messages: updatedMessages.slice(0, -1),
        apiKey: currentSettings.apiKey,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        maxTokens: currentSettings.maxTokens,
        sessionId: activeConversation.sessionId,
        signal: abortController.signal,
        onDelta,
        onComplete,
        onError,
      })
    }
  }

  const handleRetry = () => {
    if (!activeConversation || generating) return
    const msgs = activeConversation.messages || []
    if (msgs.length === 0) return

    let lastUserIndex = -1
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }

    if (lastUserIndex === -1) return
    const prompt = msgs[lastUserIndex].content
    const rollback = msgs.slice(0, lastUserIndex)

    setConversations(prevList => {
      const list = getVal(prevList) || []
      return list.map(c => {
        if (c.id === activeConversation.id) {
          return { ...c, messages: rollback }
        }
        return c
      })
    })

    setErrorMessage(null)
    setTimeout(() => handleSendMessage(prompt), 50)
  }

  const handleRegenerate = (assistantIndex) => {
    if (!activeConversation || generating) return
    const msgs = activeConversation.messages || []
    const userMsg = msgs[assistantIndex - 1]
    if (!userMsg || userMsg.role !== 'user') return

    const rollback = msgs.slice(0, assistantIndex - 1)
    setConversations(prevList => {
      const list = getVal(prevList) || []
      return list.map(c => {
        if (c.id === activeConversation.id) {
          return { ...c, messages: rollback }
        }
        return c
      })
    })

    setErrorMessage(null)
    setTimeout(() => handleSendMessage(userMsg.content), 50)
  }

  const handleSaveSettings = (newSettings) => {
    saveSettings(newSettings)
    setSettings(newSettings)
  }

  const totalSavedChats = convList.filter(c => (c.messages || []).length > 0).length
  const errText = getVal(errorMessage)

  return (
    <div className="app-root">
      <style>{CSS}</style>

      {/* Top Bar */}
      <header className="top-bar">
        <div className="brand">
          <div className="logo-badge">B</div>
          <span className="brand-title">BUI Chat</span>
          <div className="model-pill">
            <span className="dot-green" />
            <span>{isMock ? 'Mock Mode' : (currentSettings.model || 'sarvam-105b')}</span>
          </div>
        </div>

        <div className="top-actions">
          {hasStartedChatting && (
            <button className="icon-btn primary-action" onClick={handleNewConversation}>
              <span className="button-symbol">+</span> New Chat
            </button>
          )}
          {totalSavedChats > 0 && (
            <button className="icon-btn" onClick={() => setShowHistory(true)}>
              History <span className="count-badge">{totalSavedChats}</span>
            </button>
          )}
            <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            Settings
          </button>
        </div>
      </header>

      {/* 1. INITIAL SPOTLIGHT VIEW (When conversation is empty) */}
      {!hasStartedChatting ? (
        <div className="hero-container">
          <div className="hero-kicker">
            <span className="pulse-dot" />
            <span>Private, native, and built for focus</span>
          </div>

          <h1 className="hero-title">What are we building today?</h1>
          <p className="hero-sub">Ask anything. Keep the thinking here.</p>

          <div className="input-card">
            <textarea
              className="prompt-area"
              placeholder="Ask Sarvam 105B anything..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault?.()
                  handleSendMessage()
                }
              }}
            />

            <div className="card-footer">
              <span className="key-hint">Press Enter ↵ to send</span>
              <button
                className="send-btn"
                disabled={!hasText}
                onClick={() => handleSendMessage()}
              >
                Send ↑
              </button>
            </div>
          </div>

          <div className="chips-row">
            {CHIPS.map((chip, idx) => (
              <div
                key={idx}
                className="chip"
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 2. CHAT VIEW (Once chatting begins) */
        <div className="chat-container">
          <div className="messages-scroll">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user'
              const parts = parseMessageContent(msg.content)
              const isLast = idx === messages.length - 1

              return (
                <div key={msg.id || idx} className={isUser ? 'msg msg-user' : 'msg msg-assistant'}>
                  <div className="msg-header">
                    <span className="msg-sender">
                      {isUser ? 'You' : 'Sarvam 105B'}
                    </span>
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div>
                    {parts.map((p, pIdx) => {
                      if (p.type === 'code') {
                        return (
                          <div key={pIdx} className="code-box">
                            <div className="code-bar">
                              <span>{p.language || 'code'}</span>
                              <button
                                className="code-copy"
                                onClick={() => copyToClipboard(p.content)}
                              >
                                Copy Code
                              </button>
                            </div>
                            <div className="code-content">{p.content}</div>
                          </div>
                        )
                      }
                      return <div key={pIdx} style={{ whiteSpace: 'pre-wrap' }}>{p.content}</div>
                    })}

                    {!isUser && !msg.content && generating && (
                      <div className="generating-state">
                        <span className="generating-dot" /> Thinking…
                      </div>
                    )}
                  </div>

                  {!isUser && msg.content && (
                    <div className="message-actions">
                      <button
                        className="text-btn"
                        onClick={() => copyToClipboard(msg.content)}
                      >
                        Copy
                      </button>
                      {isLast && !generating && (
                        <button
                          className="text-btn"
                          onClick={() => handleRegenerate(idx)}
                        >
                          ↻ Regenerate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {errText && (
              <div className="error-card">
                <div className="error-title">Request Error</div>
                <div>{errText}</div>
                <button
                  className="error-retry"
                  onClick={handleRetry}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Floating Composer */}
          <div className="composer-wrap">
            <div className="input-card">
              <textarea
                className="prompt-area"
                style={{ minHeight: 48 }}
                placeholder="Message Sarvam 105B..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault?.()
                    handleSendMessage()
                  }
                }}
              />

              <div className="card-footer">
                <span className="key-hint">Shift + Enter for newline</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {generating ? (
                    <button
                      className="send-btn stop-btn"
                      onClick={handleStop}
                    >
                      ■ Stop
                    </button>
                  ) : (
                    <button
                      className="send-btn"
                      disabled={!hasText}
                      onClick={() => handleSendMessage()}
                    >
                      Send ↑
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={!!getVal(showHistory)}
        conversations={convList}
        activeId={currentActiveId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onClose={() => setShowHistory(false)}
      />

      {/* Settings Modal */}
      {!!getVal(showSettings) && (
        <SettingsModal
          settings={currentSettings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
