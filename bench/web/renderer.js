const fixture = Array.from({ length: 500 }, (_, index) => ({
  role: index % 2 === 0 ? 'user' : 'assistant',
  text: index % 2 === 0
    ? `User prompt ${index}: explain how a native retained-mode UI updates only damaged regions.`
    : `Assistant response ${index}: signals update the affected node while the renderer preserves the rest of the retained tree.`,
}))

const startedAt = performance.now()
const app = document.querySelector('#app')
app.innerHTML = `<header><div class="brand"><div class="badge">B</div><span>Runtime Benchmark</span></div><span class="status">same fixture · 500 messages · 10,000 streamed tokens</span></header><main><div id="messages"></div><div class="composer"><textarea placeholder="Streaming benchmark input…"></textarea><div class="footer"><span>deterministic workload</span><button>Send ↑</button></div></div></main>`

const messages = document.querySelector('#messages')
for (const item of fixture) {
  const node = document.createElement('div')
  node.className = `message ${item.role}`
  node.innerHTML = `<div class="meta">${item.role === 'user' ? 'You' : 'BUI Assistant'}</div><div>${item.text}</div>`
  messages.appendChild(node)
}
messages.scrollTop = messages.scrollHeight

const readyAt = performance.now()
let streamed = 0
let chunk = 0
const streamStart = performance.now()
const timer = setInterval(() => {
  const nodes = messages.querySelectorAll('.assistant')
  const target = nodes[nodes.length - 1]
  if (target) target.lastElementChild.textContent += ' token'
  streamed = Math.min(10000, streamed + 20)
  chunk += 1
  if (streamed >= 10000) {
    clearInterval(timer)
    window.__benchmark = {
      startupMs: readyAt - startedAt,
      streamMs: performance.now() - streamStart,
      streamedTokens: streamed,
      streamChunks: chunk,
      fixtureMessages: fixture.length,
    }
    if (window.__TAURI_INTERNALS__) {
      window.__TAURI_INTERNALS__.invoke('benchmark_complete', { payload: JSON.stringify(window.__benchmark) })
    }
    window.dispatchEvent(new Event('benchmark-complete'))
  }
}, 16)
