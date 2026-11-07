/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'

export function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings,
  apiKeyConfigured,
  isMock,
}) {
  const [search, setSearch] = useState('')

  const searchVal = search.value?.toLowerCase?.() ?? ''
  const filtered = conversations.filter(c => {
    if (!searchVal) return true
    return (c.title || '').toLowerCase().includes(searchVal)
  })

  return (
    <aside className="w-64 bg-[#0B0D12] border-r border-[#252B38] flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#252B38] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6] flex items-center justify-center font-bold text-white text-sm shadow">
            B
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#F5F5F5] tracking-tight">BUI Chat</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#252B38] text-[#9299A8]">v1.0</span>
            </div>
            <span className="text-[10px] text-[#8B5CF6]">Native Blender UI</span>
          </div>
        </div>
      </div>

      {/* Action: New Chat */}
      <div className="p-3">
        <button
          className="w-full py-2 px-3 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-2 shadow"
          onClick={onNewConversation}
        >
          <span className="text-sm">+</span>
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="rounded-lg border border-[#252B38] bg-[#11151D] px-2.5 py-1.5 flex items-center gap-2">
          <span className="text-xs text-[#9299A8]">🔍</span>
          <input
            className="w-full bg-transparent text-xs text-[#F5F5F5] placeholder-[#9299A8] outline-none"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9299A8]">
          Recent Chats
        </div>

        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#9299A8] italic">
            {conversations.length === 0 ? 'No conversations yet' : 'No matching chats'}
          </div>
        ) : (
          filtered.map(c => {
            const isActive = c.id === activeId
            return (
              <div
                key={c.id}
                className={`group px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                  isActive
                    ? 'bg-[#161B26] border border-[#8B5CF6]/40 text-[#F5F5F5]'
                    : 'text-[#9299A8] hover:bg-[#11151D] hover:text-[#F5F5F5]'
                }`}
                onClick={() => onSelectConversation(c.id)}
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="truncate font-medium">{c.title || 'Untitled'}</span>
                  <span className="text-[10px] text-[#9299A8]/70">
                    {c.messages?.length || 0} messages
                  </span>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 hover:text-[#EF4444] text-[#9299A8] px-1 transition text-xs"
                  onClick={(e) => {
                    e.stopPropagation?.()
                    onDeleteConversation(c.id)
                  }}
                  title="Delete conversation"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom Settings Bar */}
      <div className="p-3 border-t border-[#252B38] bg-[#0B0D12]">
        <div
          className="p-2.5 rounded-lg bg-[#11151D] border border-[#252B38] hover:border-[#8B5CF6]/50 cursor-pointer transition flex items-center justify-between text-xs"
          onClick={onOpenSettings}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              apiKeyConfigured ? 'bg-emerald-400' : isMock ? 'bg-amber-400' : 'bg-red-500'
            }`} />
            <div className="flex flex-col">
              <span className="font-medium text-[#F5F5F5]">Settings & Key</span>
              <span className="text-[10px] text-[#9299A8]">
                {apiKeyConfigured ? 'Sarvam API Active' : isMock ? 'Mock Mode Enabled' : 'Key Needed'}
              </span>
            </div>
          </div>
          <span className="text-xs text-[#9299A8]">⚙</span>
        </div>
      </div>
    </aside>
  )
}
