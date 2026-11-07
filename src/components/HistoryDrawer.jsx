/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'

function getVal(v) {
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return v
}

export function HistoryDrawer({
  isOpen,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
}) {
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const searchVal = (getVal(search) || '').toLowerCase()
  const filtered = conversations.filter(c => {
    if (!searchVal) return true
    return (c.title || '').toLowerCase().includes(searchVal)
  })

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative z-50 w-80 max-w-full h-full bg-[#0D101A] border-r border-[#22283A] shadow-2xl flex flex-col p-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22283A]">
          <span className="font-bold text-sm text-[#F5F5F5]">Conversations</span>
          <div className="flex items-center gap-2">
            <button
              className="px-2.5 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium cursor-pointer transition flex items-center gap-1"
              onClick={() => {
                onNew()
                onClose()
              }}
            >
              <span>+</span>
              <span>New</span>
            </button>
            <button
              className="text-[#9299A8] hover:text-[#F5F5F5] text-sm px-1 cursor-pointer"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="my-3">
          <div className="rounded-xl border border-[#22283A] bg-[#131726] px-3 py-1.5 flex items-center gap-2">
            <span className="text-[#6B7280]">🔍</span>
            <input
              className="w-full bg-transparent text-xs text-[#F5F5F5] placeholder-[#6B7280] outline-none"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7280] italic">
              No conversations found
            </div>
          ) : (
            filtered.map(c => {
              const isActive = c.id === activeId
              return (
                <div
                  key={c.id}
                  className={`group px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition ${
                    isActive
                      ? 'bg-[#1C2138] border border-[#8B5CF6]/50 text-[#F5F5F5]'
                      : 'text-[#9299A8] hover:bg-[#15192A] hover:text-[#F5F5F5]'
                  }`}
                  onClick={() => {
                    onSelect(c.id)
                    onClose()
                  }}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate font-medium">{c.title || 'Untitled'}</span>
                    <span className="text-[10px] text-[#6B7280]">
                      {c.messages?.length || 0} messages
                    </span>
                  </div>

                  <button
                    className="opacity-0 group-hover:opacity-100 hover:text-[#EF4444] text-[#6B7280] px-1 transition text-xs"
                    onClick={(e) => {
                      e.stopPropagation?.()
                      onDelete(c.id)
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
