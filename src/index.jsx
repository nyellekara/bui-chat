/** @jsxImportSource @blender-ui/react */
require('dotenv').config()
const React = require('react')
const { render } = require('@blender-ui/react')
const { App } = require('./App.jsx')
const { loadSettings, getStorageDir } = require('./services/storage.js')

function main() {
  const settings = loadSettings()
  const useGpu = process.env.BUI_GPU === '1' || settings.gpu === true

  console.log('='.repeat(60))
  console.log('Starting BUI Chat: Native Desktop AI Chat Application')
  console.log('='.repeat(60))
  console.log('• Renderer:       BUI Native Desktop (Win32)')
  console.log(`• Acceleration:   ${useGpu ? 'Direct3D 11 (GPU)' : 'Software Raster (CPU, zero idle CPU)'}`)
  console.log('• Frontend:       React 19 Reconciler backed by Signals')
  console.log(`• Model:          ${settings.model || 'sarvam-105b'}`)
  console.log(`• Local Storage:  ${getStorageDir()}`)
  console.log(`• Mock Mode:      ${settings.mockMode ? 'ENABLED (Offline)' : 'DISABLED (Real Sarvam 105B API)'}`)
  console.log('='.repeat(60))

  const { app, window, root } = render(React.createElement(App), {
    title: 'BUI Chat — Sarvam 105B',
    width: 1080,
    height: 720,
    resizable: true,
    gpu: useGpu,
  })

  window.body.setAttribute('styled', '')
  window.body.style = 'margin: 0; padding: 0; width: 100%; height: 100%; background: #08090D; color: #F5F5F5; overflow: hidden;'

  console.log(`BUI Window created successfully [Window ID: ${window.id}]`)

  window.on('close', () => {
    console.log('BUI Native Window closed. Exiting cleanly.')
    app.quit()
  })

  return { app, window, root }
}

if (require.main === module || !process.env.BUI_TEST_MODE) {
  main()
}

module.exports = { main }
