/**
 * Optional Mock Mode provider for UI development and offline demonstrations.
 * Simulates genuine token-by-token streaming with realistic delays.
 */

const SAMPLE_RESPONSES = [
  (prompt) => `Here is an architectural breakdown for: **${prompt}**

BUI (Blender User Interface) delivers a decoupled, native retained-mode UI toolkit extracted from Blender's core architecture.

### Key Architectural Strengths:
1. **Zero Browser Overhead**: No Chromium, no Electron, no WebView. UI renders directly into a Win32 surface via software raster or Direct3D 11.
2. **Signal-Backed React Reconciler**: Components map state to signals. Discrete updates update dirty nodes without triggering full virtual DOM reconciliations.
3. **Damage-Driven Rendering**: An idle desktop window sleeps at 0% CPU. Only modified tiles (64x32) are repainted upon user interaction.

\`\`\`javascript
// Example: Creating a native BUI window with React
import { render, useState } from '@blender-ui/react'

function DesktopDashboard() {
  const [active, setActive] = useState(true)
  return (
    <main className="p-6 bg-[#0B0D12] text-[#F5F5F5] flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#8B5CF6]">BUI Native App</h1>
      <button onClick={() => setActive(v => !v)}>Toggle State</button>
    </main>
  )
}

render(<DesktopDashboard />, { title: 'BUI Dashboard', width: 800, height: 600, gpu: true })
\`\`\`

Let me know if you would like me to detail the layout engine (Taffy) or how Sarvam 105B streams tokens through Server-Sent Events!`,

  (prompt) => `I have analyzed your request regarding: "${prompt}".

### Overview
Sarvam 105B is a frontier language model tailored for enterprise, multilingual, and technical workflows. Integrating it natively with BUI provides instant time-to-first-token and native desktop responsiveness.

\`\`\`python
# Sarvam 105B Streaming Request Schema
import requests

url = "https://api.sarvam.ai/v2/chat/completions"
headers = {
    "api-subscription-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "x-session-affinity": "session_opaque_id_123"
}
payload = {
    "model": "sarvam-105b",
    "messages": [{"role": "user", "content": "${prompt}"}],
    "stream": True,
    "max_tokens": 2048
}
\`\`\`

The response stream arrives via Server-Sent Events (\`data: {"choices": [{"delta": ...}]}\`) and is incrementally rendered into this BUI desktop window!`,
]

let responseIndex = 0

async function streamMockCompletion({
  messages,
  signal = null,
  onDelta,
  onComplete,
  onError,
}) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || 'Hello'
  const template = SAMPLE_RESPONSES[responseIndex % SAMPLE_RESPONSES.length]
  responseIndex++
  const fullText = template(lastUserMsg)

  // Split into natural token chunks (words or small character groups)
  const tokens = fullText.match(/\S+|\s+/g) || [fullText]
  let accumulated = ''

  for (let i = 0; i < tokens.length; i++) {
    if (signal?.aborted) {
      if (onComplete) onComplete(accumulated)
      return
    }

    const token = tokens[i]
    accumulated += token
    if (onDelta) onDelta(token)

    // Realistic typing delay: 15ms - 35ms
    await new Promise(r => setTimeout(r, 20))
  }

  if (onComplete) onComplete(accumulated)
}

module.exports = {
  streamMockCompletion,
}
