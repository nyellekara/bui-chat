/** @jsxImportSource @blender-ui/react */
import React from 'react'

export function TopNav({
  title,
  model,
  isMock,
  onOpenSettings,
  onNewChat,
}) {
  return (
    <header className="h-14 px-5 border-b border-[#252B38] bg-[#0B0D12] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <h1 className="text-sm font-semibold text-[#F5F5F5] truncate max-w-[320px]">
          {title || 'New Conversation'}
        </h1>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#11151D] border border-[#252B38]">
          <span className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-amber-400' : 'bg-[#8B5CF6]'}`} />
          <span className="font-mono text-[#F5F5F5]">
            {isMock ? 'Mock Mode' : (model || 'sarvam-105b')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-lg bg-[#11151D] hover:bg-[#161B26] border border-[#252B38] text-xs text-[#F5F5F5] cursor-pointer transition flex items-center gap-1.5"
          onClick={onNewChat}
          title="Start new conversation"
        >
          <span>+</span>
          <span>New Chat</span>
        </button>

        <button
          className="px-3 py-1.5 rounded-lg bg-[#11151D] hover:bg-[#161B26] border border-[#252B38] text-xs text-[#9299A8] hover:text-[#F5F5F5] cursor-pointer transition flex items-center gap-1.5"
          onClick={onOpenSettings}
          title="Configure API key and preferences"
        >
          <span>⚙</span>
          <span>Settings</span>
        </button>
      </div>
    </header>
  )
}
