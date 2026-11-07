/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

const CHIPS = [
  'Explain BUI native architecture',
  'Help me debug some code',
  'Design a software architecture',
  'Review this code for performance',
]

export function MinimalHero({
  onSend,
  onOpenSettings,
  onOpenHistory,
  historyCount = 0,
  apiKeyConfigured = true,
}) {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const textVal = getVal(prompt) || ''
  const hasText = textVal.trim().length > 0
  const focused = !!getVal(isFocused)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault?.()
      submit()
    }
  }

  const submit = () => {
    const text = textVal.trim()
    if (!text) return
    onSend(text)
    setPrompt('')
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-6">
      {/* Top minimal control bar */}
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#8B5CF6] flex items-center justify-center font-bold text-white text-xs shadow-md">
            B
          </div>
          <span className="font-semibold text-xs tracking-wide text-[#F5F5F5]">BUI Chat</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1C1F2E] text-[#A78BFA] border border-[#8B5CF6]/25">
            sarvam-105b
          </span>
        </div>

        <div className="flex items-center gap-2">
          {historyCount > 0 && (
            <button
              className="px-3 py-1.5 rounded-full bg-[#111420]/80 hover:bg-[#1A1F30] border border-[#252B3E] text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition flex items-center gap-1.5"
              onClick={onOpenHistory}
            >
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#252B3E] text-[#F5F5F5]">
                {historyCount}
              </span>
            </button>
          )}

          <button
            className="w-8 h-8 rounded-full bg-[#111420]/80 hover:bg-[#1A1F30] border border-[#252B3E] text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition flex items-center justify-center"
            onClick={onOpenSettings}
            title="Settings & API Key"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Center Spotlight Card */}
      <div className="flex flex-col items-center justify-center max-w-2xl w-full mx-auto my-auto -mt-6">
        {/* Glow Halo Badge */}
        <div className="mb-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#C4B5FD] text-xs shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
          <span className="font-medium">Direct Native Renderer · Zero Browser</span>
        </div>

        <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2 text-center tracking-tight">
          What are we building today?
        </h1>
        <p className="text-xs text-[#9299A8] mb-8 text-center max-w-md">
          Streaming frontier intelligence from Sarvam 105B into Blender's native UI engine.
        </p>

        {/* Floating Input Box */}
        <div className={`w-full rounded-2xl border transition p-3 shadow-2xl flex flex-col ${
          focused
            ? 'border-[#8B5CF6] bg-[#10131F]/90 ring-1 ring-[#8B5CF6]/40'
            : 'border-[#252B3E] bg-[#10131F]/70 hover:border-[#38405A]'
        }`}>
          <textarea
            className="w-full bg-transparent text-[#F5F5F5] placeholder-[#6B7280] text-sm resize-none outline-none leading-relaxed min-h-[72px] max-h-[160px] p-1 font-sans"
            placeholder="Ask Sarvam 105B anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <div className="flex items-center justify-between pt-2 border-t border-[#252B3E]/50 mt-1">
            <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5 pl-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1C2030] text-[#9CA3AF] text-[10px] font-mono border border-[#2A3149]">
                Enter ↵
              </kbd>
              <span>to send</span>
            </div>

            <button
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm ${
                hasText
                  ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer'
                  : 'bg-[#1C2030] text-[#6B7280] cursor-not-allowed border border-[#252B3E]'
              }`}
              disabled={!hasText}
              onClick={submit}
            >
              <span>Send</span>
              <span>↑</span>
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 w-full">
          {CHIPS.map((chip, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 rounded-full bg-[#111420]/60 hover:bg-[#1A1F30] border border-[#252B3E] hover:border-[#8B5CF6]/40 text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition"
              onClick={() => onSend(chip)}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full text-center text-[11px] text-[#6B7280]/60 pb-1">
        BUI Native Win32 · React 19 Signals · Sarvam AI
      </footer>
    </div>
  )
}
