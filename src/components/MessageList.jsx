/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'
import { parseMessageContent } from '../services/markdown.js'
import { CodeBlock } from './CodeBlock.jsx'
import { copyToClipboard } from '../services/clipboard.js'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessageItem({
  message,
  onRegenerate,
  isLast,
  isGenerating,
}) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isCopied = !!getVal(copied)
  const generating = !!getVal(isGenerating)

  const handleCopyMessage = async () => {
    const ok = await copyToClipboard(message.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const parts = parseMessageContent(message.content)

  return (
    <div className={`flex flex-col gap-2 p-4 rounded-2xl transition max-w-[85%] ${
      isUser
        ? 'ml-auto bg-[#171B2D] border border-[#2D3452] text-[#F5F5F5] shadow-sm'
        : 'mr-auto bg-[#0E111C]/90 border border-[#202538] text-[#F5F5F5] shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[#9299A8] pb-1 border-b border-[#242A40]/40">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isUser ? 'bg-[#3B82F6] text-white' : 'bg-[#8B5CF6] text-white'
          }`}>
            {isUser ? 'U' : 'S'}
          </div>
          <span className="font-semibold text-xs text-[#F5F5F5]">
            {isUser ? 'You' : 'Sarvam 105B'}
          </span>
          {!isUser && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#8B5CF6]/15 text-[#C4B5FD] font-mono border border-[#8B5CF6]/25">
              105b
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#6B7280]">{formatTimestamp(message.timestamp)}</span>
      </div>

      {/* Message content */}
      <div className="text-sm text-[#F3F4F6] leading-relaxed flex flex-col gap-2.5 pt-1">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return <CodeBlock key={idx} language={p.language} code={p.content} />
          }
          return (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {p.content}
            </div>
          )
        })}

        {/* Streaming pulse indicator */}
        {!isUser && !message.content && generating && (
          <div className="flex items-center gap-2 text-xs text-[#A78BFA] italic py-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span>Generating response from Sarvam 105B...</span>
          </div>
        )}
      </div>

      {/* Action footer */}
      {!isUser && message.content && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#202538]/50 text-xs">
          <button
            className="px-2.5 py-1 rounded-lg bg-[#141826] hover:bg-[#1E2338] text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition text-xs font-medium"
            onClick={handleCopyMessage}
          >
            {isCopied ? '✓ Copied' : 'Copy'}
          </button>
          {isLast && !generating && onRegenerate && (
            <button
              className="px-2.5 py-1 rounded-lg bg-[#141826] hover:bg-[#1E2338] text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition text-xs font-medium"
              onClick={onRegenerate}
            >
              ↻ Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function MessageList({
  messages,
  isGenerating,
  error,
  onRetry,
  onRegenerate,
}) {
  const errText = getVal(error)

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-5">
        {messages.map((msg, idx) => (
          <MessageItem
            key={msg.id || idx}
            message={msg}
            isLast={idx === messages.length - 1}
            isGenerating={isGenerating}
            onRegenerate={() => onRegenerate(idx)}
          />
        ))}

        {/* Error notification card */}
        {errText && (
          <div className="p-4 rounded-2xl bg-[#251014] border border-[#EF4444]/50 text-xs text-[#FCA5A5] flex flex-col gap-2 max-w-[85%] mr-auto shadow-lg">
            <div className="flex items-center gap-1.5 font-semibold text-[#EF4444]">
              <span>⚠</span>
              <span>Request Error</span>
            </div>
            <p className="leading-relaxed text-[#F5F5F5]">{errText}</p>
            <div className="pt-1">
              <button
                className="px-3.5 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold cursor-pointer transition text-xs shadow"
                onClick={onRetry}
              >
                Retry Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
