/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

export function Composer({
  onSend,
  onStop,
  onRetry,
  isGenerating,
  hasError,
  disabled = false,
}) {
  const [input, setInput] = useState('')

  const generating = !!getVal(isGenerating)
  const errorActive = !!getVal(hasError)
  const isDisabled = !!getVal(disabled)
  const inputValue = getVal(input) || ''
  const hasText = inputValue.trim().length > 0

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
    <div className="p-4 bg-[#0B0D12] border-t border-[#252B38] flex flex-col gap-2">
      <div className="relative rounded-xl border border-[#252B38] bg-[#11151D] focus-within:border-[#8B5CF6] transition flex flex-col p-2.5">
        <textarea
          className="w-full bg-transparent text-[#F5F5F5] placeholder-[#9299A8] text-sm resize-none outline-none leading-relaxed min-h-[56px] max-h-[140px]"
          placeholder="Message Sarvam 105B... (Enter to send, Shift + Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#252B38]/40 mt-1">
          <div className="text-[11px] text-[#9299A8] flex items-center gap-2">
            <span>Shift + Enter: newline</span>
            <span>·</span>
            <span>Enter: send</span>
          </div>

          <div className="flex items-center gap-2">
            {generating ? (
              <button
                className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-medium cursor-pointer transition flex items-center gap-1.5"
                onClick={onStop}
              >
                <span>■</span>
                <span>Stop</span>
              </button>
            ) : errorActive ? (
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg bg-[#374151] hover:bg-[#4B5563] text-white text-xs font-medium cursor-pointer transition"
                  onClick={onRetry}
                >
                  ↻ Retry
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    hasText
                      ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer'
                      : 'bg-[#252B38] text-[#9299A8] cursor-not-allowed'
                  }`}
                  disabled={!hasText}
                  onClick={submit}
                >
                  Send
                </button>
              </div>
            ) : (
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  hasText
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer'
                    : 'bg-[#252B38] text-[#9299A8] cursor-not-allowed'
                }`}
                disabled={!hasText}
                onClick={submit}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
