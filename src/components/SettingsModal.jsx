/** @jsxImportSource @blender-ui/react */
import React, { useState } from 'react'
import { testApiKey } from '../api/sarvam.js'
import { getStorageDir } from '../services/storage.js'

export function SettingsModal({
  settings,
  onSave,
  onClose,
}) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl || 'https://api.sarvam.ai/v2')
  const [model, setModel] = useState(settings.model || 'sarvam-105b')
  const [mockMode, setMockMode] = useState(!!settings.mockMode)
  const [gpu, setGpu] = useState(!!settings.gpu)
  const [testStatus, setTestStatus] = useState(null)
  const [isTesting, setIsTesting] = useState(false)

  const handleTestKey = async () => {
    setIsTesting(true)
    setTestStatus({ checking: true, message: 'Validating key with Sarvam 105B...' })
    const keyToTest = apiKey.value || ''
    const urlToTest = baseUrl.value || 'https://api.sarvam.ai/v2'

    const res = await testApiKey(keyToTest, urlToTest)
    setIsTesting(false)
    setTestStatus(res)
  }

  const handleSave = () => {
    onSave({
      apiKey: apiKey.value?.trim?.() ?? '',
      baseUrl: baseUrl.value?.trim?.() || 'https://api.sarvam.ai/v2',
      model: model.value?.trim?.() || 'sarvam-105b',
      mockMode: !!mockMode.value,
      gpu: !!gpu.value,
    })
    onClose()
  }

  const storageDir = getStorageDir()

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-[#11151D] border border-[#252B38] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252B38] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#F5F5F5]">Configuration & Settings</span>
            <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] text-[10px] font-mono">
              Sarvam 105B
            </span>
          </div>
          <button
            className="text-[#9299A8] hover:text-[#F5F5F5] text-sm px-1 cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* API Key Section */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-[#F5F5F5]">
            Sarvam API Key (<code className="text-[#8B5CF6]">api-subscription-key</code>)
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 bg-[#0B0D12] border border-[#252B38] rounded-lg text-[#F5F5F5] placeholder-[#9299A8] outline-none focus:border-[#8B5CF6]"
            placeholder="Paste your Sarvam API subscription key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#9299A8]">
              Get your key from{' '}
              <span className="text-[#8B5CF6] font-mono">docs.sarvam.ai</span>
            </span>
            <button
              className="px-2.5 py-1 rounded bg-[#1C2230] hover:bg-[#252B38] text-[#F5F5F5] font-medium transition cursor-pointer"
              disabled={isTesting.value}
              onClick={handleTestKey}
            >
              {isTesting.value ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* Test connection feedback */}
          {testStatus.value && (
            <div className={`p-2.5 rounded-lg border mt-1 ${
              testStatus.value.ok
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : testStatus.value.checking
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <span>{testStatus.value.ok ? '✓' : testStatus.value.checking ? '●' : '⚠'}</span>
                <span>{testStatus.value.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Base URL and Model */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-[#F5F5F5]">Base URL</label>
            <input
              className="px-3 py-2 bg-[#0B0D12] border border-[#252B38] rounded-lg text-[#F5F5F5] outline-none focus:border-[#8B5CF6]"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-[#F5F5F5]">Model Name</label>
            <input
              className="px-3 py-2 bg-[#0B0D12] border border-[#252B38] rounded-lg text-[#F5F5F5] outline-none focus:border-[#8B5CF6]"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252B38]">
          <div
            className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0D12] border border-[#252B38] cursor-pointer"
            onClick={() => setMockMode(v => !v)}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[#F5F5F5]">Optional Mock Mode</span>
              <span className="text-[11px] text-[#9299A8]">
                Simulate streaming responses offline for UI development
              </span>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition ${
              mockMode.value ? 'bg-[#8B5CF6]' : 'bg-[#252B38]'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition ${
                mockMode.value ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>

          <div
            className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0D12] border border-[#252B38] cursor-pointer"
            onClick={() => setGpu(v => !v)}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[#F5F5F5]">Direct3D 11 GPU Renderer</span>
              <span className="text-[11px] text-[#9299A8]">
                Hardware accelerated widget rendering (defaults to CPU software raster)
              </span>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition ${
              gpu.value ? 'bg-[#8B5CF6]' : 'bg-[#252B38]'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition ${
                gpu.value ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </div>

        {/* Persistence Info */}
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-[#0B0D12] border border-[#252B38] text-[11px] text-[#9299A8]">
          <span className="font-semibold text-[#F5F5F5]">Local Persistence Storage</span>
          <span className="font-mono text-[#8B5CF6] truncate">{storageDir}</span>
          <span>Conversations and settings are stored locally outside project source.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252B38]">
          <button
            className="px-4 py-2 rounded-lg bg-[#1C2230] hover:bg-[#252B38] text-[#F5F5F5] font-medium transition cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium transition cursor-pointer shadow"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
