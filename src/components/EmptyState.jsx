/** @jsxImportSource @blender-ui/react */
import React from 'react'

const SUGGESTIONS = [
  {
    title: 'Explain a complex concept',
    desc: 'How does Blender UI rasterize anti-aliased SDF primitives without Chromium?',
    prompt: 'Explain how BUI (Blender UI) decoupled from Blender renders anti-aliased signed-distance field primitives natively without any browser or webview.',
  },
  {
    title: 'Help me debug some code',
    desc: 'Analyze streaming Server-Sent Events with choice deltas in Node.js',
    prompt: 'Help me debug a streaming SSE parser in Node.js that processes choice deltas and terminal [DONE] events.',
  },
  {
    title: 'Design a software architecture',
    desc: 'Native desktop AI chat client with local persistence and session affinity',
    prompt: 'Design a low-latency native desktop AI client architecture connecting to Sarvam 105B with session affinity and atomic local persistence.',
  },
  {
    title: 'Review this code',
    desc: 'Review React reconciler signal integration and discrete update handling',
    prompt: 'Review this React custom reconciler implementation that maps host elements to native Win32 windows and uses signal bindings.',
  },
]

export function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto my-auto">
      <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center mb-4">
        <span className="text-xl text-[#8B5CF6] font-bold">B</span>
      </div>

      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2 tracking-tight">
        What are we building today?
      </h2>
      <p className="text-sm text-[#9299A8] mb-8 max-w-md">
        BUI Chat runs directly on Blender's native UI engine, streaming frontier intelligence from Sarvam 105B.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-[#252B38] bg-[#11151D] hover:bg-[#161B26] hover:border-[#8B5CF6]/50 cursor-pointer transition flex flex-col gap-1"
            onClick={() => onSelectSuggestion(item.prompt)}
          >
            <span className="text-sm font-semibold text-[#F5F5F5]">
              {item.title}
            </span>
            <span className="text-xs text-[#9299A8] line-clamp-2 leading-relaxed">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
