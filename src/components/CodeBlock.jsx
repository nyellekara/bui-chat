/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'
import { copyToClipboard } from '../services/clipboard.js'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

export function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)
  const isCopied = !!getVal(copied)

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="my-2 rounded-xl border border-[#22273D] bg-[#070910] overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0F121E] border-b border-[#22273D] text-xs">
        <span className="font-mono text-[11px] font-semibold text-[#A78BFA] uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          className="px-2 py-0.5 rounded-md bg-[#191D30] hover:bg-[#252B44] text-[#E5E7EB] cursor-pointer text-[11px] font-medium transition"
          onClick={handleCopy}
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-3.5 font-mono text-xs text-[#E2E8F0] whitespace-pre overflow-x-auto leading-relaxed">
        {code}
      </div>
    </div>
  )
}
