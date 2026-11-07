const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const out = process.env.BENCH_OUT || path.join(process.cwd(), 'electron-result.json')
const startedAt = process.hrtime.bigint()
fs.writeFileSync(path.join(process.cwd(), 'electron-started.txt'), `started ${process.pid}\n`)
app.disableHardwareAcceleration()

function writeResult(extra = {}) {
  const result = { runtime: 'electron', pid: process.pid, startupMs: Number(process.hrtime.bigint() - startedAt) / 1e6, rssBytes: process.memoryUsage().rss, heapUsedBytes: process.memoryUsage().heapUsed, cpu: process.cpuUsage(), ...extra }
  fs.writeFileSync(out, JSON.stringify(result, null, 2))
}

app.whenReady().then(() => {
  fs.appendFileSync(path.join(process.cwd(), 'electron-started.txt'), 'ready\n')
  const win = new BrowserWindow({ width: 1080, height: 720, show: true, backgroundColor: '#0f1012', webPreferences: { sandbox: true } })
  win.loadFile(path.join(__dirname, '..', 'web', 'index.html'))
  win.webContents.on('did-fail-load', (_event, code, description) => fs.appendFileSync(path.join(process.cwd(), 'electron-started.txt'), `load-failed ${code} ${description}\n`))
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`new Promise(resolve => { if (window.__benchmark) resolve(window.__benchmark); else window.addEventListener('benchmark-complete', () => resolve(window.__benchmark), { once: true }) })`).then((result) => {
      writeResult(result)
      setTimeout(() => app.quit(), 250)
    })
  })
})
