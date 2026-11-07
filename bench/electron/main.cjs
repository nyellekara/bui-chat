const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const out = process.env.BENCH_OUT || path.join(process.cwd(), 'electron-result.json')
const startedAt = process.hrtime.bigint()
let baselineMetrics = null
let cpuSamples = []
let cpuSampler = null

function sampleElectronCpu() {
  const total = app.getAppMetrics().reduce((sum, metric) => sum + ((metric.cpu && metric.cpu.percent) || 0), 0)
  cpuSamples.push(total)
}
fs.writeFileSync(path.join(process.cwd(), 'electron-started.txt'), `started ${process.pid}\n`)
app.disableHardwareAcceleration()

function writeResult(extra = {}) {
  if (cpuSampler) clearInterval(cpuSampler)
  const appMetrics = app.getAppMetrics()
  const aggregate = appMetrics.reduce((total, metric) => ({
    rssBytes: total.rssBytes + ((metric.memory && metric.memory.workingSetSize) || 0) * 1024,
    cpuPercent: total.cpuPercent + ((metric.cpu && metric.cpu.percent) || 0),
    processCount: total.processCount + 1,
  }), { rssBytes: 0, cpuPercent: 0, processCount: 0 })
  const result = {
    runtime: 'electron',
    pid: process.pid,
    startupMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
    rssBytes: process.memoryUsage().rss,
    heapUsedBytes: process.memoryUsage().heapUsed,
    cpu: process.cpuUsage(),
    metrics: {
      totalRssBytes: aggregate.rssBytes,
      memoryDeltaBytes: baselineMetrics !== null ? aggregate.rssBytes - baselineMetrics : aggregate.rssBytes,
      averageCpuPercent: cpuSamples.length ? cpuSamples.reduce((sum, value) => sum + value, 0) / cpuSamples.length : aggregate.cpuPercent,
      peakCpuPercent: cpuSamples.length ? Math.max(...cpuSamples) : aggregate.cpuPercent,
      processCount: aggregate.processCount,
    },
    ...extra,
  }
  fs.writeFileSync(out, JSON.stringify(result, null, 2))
}

app.whenReady().then(() => {
  cpuSampler = setInterval(sampleElectronCpu, 100)
  fs.appendFileSync(path.join(process.cwd(), 'electron-started.txt'), 'ready\n')
  const win = new BrowserWindow({ width: 1080, height: 720, show: true, backgroundColor: '#0f1012', webPreferences: { sandbox: true } })
  win.loadFile(path.join(__dirname, '..', 'web', 'index.html'))
  win.webContents.on('did-fail-load', (_event, code, description) => fs.appendFileSync(path.join(process.cwd(), 'electron-started.txt'), `load-failed ${code} ${description}\n`))
  win.webContents.on('did-finish-load', () => {
    const loadedMetrics = app.getAppMetrics()
    baselineMetrics = loadedMetrics.reduce((total, metric) => total + (((metric.memory && metric.memory.workingSetSize) || 0) * 1024), 0)
    win.webContents.executeJavaScript(`new Promise(resolve => { if (window.__benchmark) resolve(window.__benchmark); else window.addEventListener('benchmark-complete', () => resolve(window.__benchmark), { once: true }) })`).then((result) => {
      writeResult(result)
      setTimeout(() => app.quit(), 250)
    })
  })
})
