/** @jsxImportSource @blender-ui/react */
const React = require('react')
const fs = require('node:fs')
const path = require('node:path')
const { render, useState, useEffect } = require('@blender-ui/react')

const OUT = process.env.BENCH_OUT || path.join(process.cwd(), 'bui-result.json')
const startedAt = performance.now()
const cpuStartedAt = process.cpuUsage()
const cpuSamples = []
let previousCpu = process.cpuUsage()
let previousCpuAt = performance.now()
const cpuSampler = setInterval(() => {
  const now = performance.now()
  const delta = process.cpuUsage(previousCpu)
  previousCpu = process.cpuUsage()
  cpuSamples.push(((delta.user + delta.system) / 1000) / Math.max(1, now - previousCpuAt) * 100)
  previousCpuAt = now
}, 100)
const fixture = Array.from({ length: 500 }, (_, index) => ({
  role: index % 2 === 0 ? 'user' : 'assistant',
  text: index % 2 === 0
    ? `User prompt ${index}: explain how a native retained-mode UI updates only damaged regions.`
    : `Assistant response ${index}: signals update the affected node while the renderer preserves the rest of the retained tree.`,
}))

function App() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0f1012', color: '#f2f2f4', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI' }}>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', background: '#111214' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 650 }}><div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#e6e6e8', color: '#17181b', fontWeight: 800 }}>B</div><span>Runtime Benchmark</span></div>
        <span style={{ color: '#8f929b', fontSize: 11 }}>same fixture · 500 messages · 10,000 streamed tokens</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, maxWidth: 820, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fixture.map((item, index) => index === fixture.length - 1
            ? <StreamingAssistant key={item.text} item={item} />
            : <div key={item.text} style={{ maxWidth: '86%', alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', padding: '12px 15px', borderRadius: 15, background: item.role === 'user' ? '#e9e9eb' : '#1d1e22', color: item.role === 'user' ? '#1c1d20' : '#f2f2f4' }}>{item.text}</div>)}
        </div>
        <div style={{ margin: '10px 24px 22px', padding: 14, borderRadius: 18, background: '#1d1e22' }}><textarea style={{ width: '100%', minHeight: 48, background: 'transparent', color: '#fff', border: 0 }} placeholder="Streaming benchmark input…" /></div>
      </div>
    </div>
  )
}

function StreamingAssistant({ item }) {
  const [text, setText] = useState(item.text)
  const [streamed, setStreamed] = useState(0)
  const [chunks, setChunks] = useState(0)
  const streamStarted = React.useRef(null)
  const readyAt = React.useRef(null)
  const baselineRss = React.useRef(0)

  useEffect(() => {
    readyAt.current = performance.now()
    baselineRss.current = process.memoryUsage().rss
    streamStarted.current = performance.now()
    const timer = setInterval(() => {
      setText((value) => `${value} token`)
      setStreamed((value) => Math.min(10000, value + 20))
      setChunks((value) => value + 1)
    }, 16)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (streamed.value < 10000) return
    clearInterval(cpuSampler)
    const cpu = process.cpuUsage(cpuStartedAt)
    const result = {
      runtime: 'bui',
      pid: process.pid,
      startupMs: readyAt.current - startedAt,
      streamMs: performance.now() - streamStarted.current,
      streamedTokens: streamed.value,
      streamChunks: chunks.value,
      fixtureMessages: fixture.length,
      rssBytes: process.memoryUsage().rss,
      heapUsedBytes: process.memoryUsage().heapUsed,
      cpu: process.cpuUsage(),
      metrics: {
        totalRssBytes: process.memoryUsage().rss,
        memoryDeltaBytes: process.memoryUsage().rss - baselineRss.current,
        averageCpuPercent: cpuSamples.length ? cpuSamples.reduce((sum, value) => sum + value, 0) / cpuSamples.length : 0,
        peakCpuPercent: cpuSamples.length ? Math.max(...cpuSamples) : 0,
        processCount: 1,
      },
    }
    fs.writeFileSync(OUT, JSON.stringify(result, null, 2))
    setTimeout(() => runtime.app.quit(), 250)
  }, [streamed])

  return (
    <>
      <div style={{ maxWidth: '86%', alignSelf: 'flex-start', padding: '12px 15px', borderRadius: 15, background: '#1d1e22', color: '#f2f2f4' }}>{text}</div>
      <div style={{ color: '#8f929b', fontSize: 12 }}>Streaming tokens: {streamed}</div>
    </>
  )
}

const runtime = render(React.createElement(App), { title: 'BUI Runtime Benchmark', width: 1080, height: 720, resizable: false, gpu: process.env.BUI_GPU === '1' })
