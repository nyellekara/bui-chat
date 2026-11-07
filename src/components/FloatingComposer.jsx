/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

export function FloatingComposer({
  onSend,
  onStop,
  onRetry,
  isGenerating,
  hasError,
  disabled = false,
}) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const generating = !!getVal(isGenerating)
  const errorActive = !!getVal(hasError)
  const isDisabled = !!getVal(disabled)
  const inputValue = getVal(input) || ''
  const hasText = inputValue.trim().length > 0
  const focused = !!getVal(isFocused)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault?.()
      submit()
    }
  }

  const submit = () => {
    const text = inputValue.trim()
    if (!text || generating || isDisabled) return
    onSend(text)
    setInput('')
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      <div className={`rounded-2xl border transition p-3 shadow-2xl flex flex-col ${
        focused
          ? 'border-[#8B5CF6] bg-[#101320]/95 ring-1 ring-[#8B5CF6]/40'
          : 'border-[#22273B] bg-[#101320]/80 hover:border-[#333B56]'
      }`}>
        <textarea
          className="w-full bg-transparent text-[#F5F5F5] placeholder-[#6B7280] text-sm resize-none outline-none leading-relaxed min-h-[52px] max-h-[140px] p-1 font-sans"
          placeholder="Message Sarvam 105B..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#22273B]/50 mt-1">
          <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5 pl-1">
            <span>Shift + Enter: newline</span>
            <span>·</span>
            <span>Enter: send</span>
          </div>

          <div className="flex items-center gap-2">
            {generating ? (
              <button
                className="px-3 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow"
                onClick={onStop}
              >
                <span>■</span>
                <span>Stop</span>
              </button>
            ) : errorActive ? (
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-xl bg-[#2A3149] hover:bg-[#394263] text-white text-xs font-medium cursor-pointer transition"
                  onClick={onRetry}
                >
                  ↻ Retry
                </button>
                <button
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    hasText
                      ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer shadow'
                      : 'bg-[#1C2030] text-[#6B7280] cursor-not-allowed border border-[#22273B]'
                  }`}
                  disabled={!hasText}
                  onClick={submit}
                >
                  Send ↑
                </button>
              </div>
            ) : (
              <button
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow ${
                  hasText
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer'
                    : 'bg-[#1C2030] text-[#6B7280] cursor-not-allowed border border-[#22273B]'
                }`}
                disabled={!hasText}
                onClick={submit}
              >
                <span>Send</span>
                <span>↑</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
