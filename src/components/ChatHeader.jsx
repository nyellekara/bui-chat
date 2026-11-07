/** @jsxImportSource @blender-ui/react */
import React from 'react'

export function ChatHeader({
  title,
  model,
  onNewChat,
  onOpenHistory,
  onOpenSettings,
  historyCount = 0,
}) {
  return (
    <header className="h-14 px-6 border-b border-[#1E2336]/60 bg-[#07080C]/80 backdrop-blur-md flex items-center justify-between shrink-0">
      {/* Left controls */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-full bg-[#111422] hover:bg-[#1A1F32] border border-[#23293D] text-xs text-[#F5F5F5] cursor-pointer transition flex items-center gap-1.5 shadow-sm"
          onClick={onNewChat}
          title="New conversation"
        >
          <span className="text-sm leading-none">+</span>
          <span className="font-medium">New</span>
        </button>

        {historyCount > 0 && (
          <button
            className="px-3 py-1.5 rounded-full bg-[#111422] hover:bg-[#1A1F32] border border-[#23293D] text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition flex items-center gap-1.5"
            onClick={onOpenHistory}
            title="Open conversation history"
          >
            <span>History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1E2338] text-[#D1D5DB]">
              {historyCount}
            </span>
          </button>
        )}
      </div>

      {/* Center title & model */}
      <div className="flex items-center gap-2.5 overflow-hidden max-w-[480px]">
        <span className="text-xs font-semibold text-[#F5F5F5] truncate">
          {title || 'Conversation'}
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-[#121524] border border-[#252B42] text-[#A78BFA] shrink-0 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{model || 'sarvam-105b'}</span>
        </div>
      </div>

      {/* Right settings button */}
      <button
        className="w-8 h-8 rounded-full bg-[#111422] hover:bg-[#1A1F32] border border-[#23293D] text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition flex items-center justify-center shadow-sm"
        onClick={onOpenSettings}
        title="Settings & API Key"
      >
        ⚙
      </button>
    </header>
  )
}
