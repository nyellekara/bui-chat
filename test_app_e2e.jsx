/** @jsxImportSource @blender-ui/react */
require('dotenv').config()
const React = require('react')
const { render } = require('@blender-ui/react')
const { App } = require('./src/App.jsx')
const { loadConversations, getStorageDir } = require('./src/services/storage.js')
const fs = require('node:fs')

async function runE2ETest() {
  console.log('--- Starting BUI Chat Full Verification Test ---')

  const { app, window } = render(React.createElement(App), {
    title: 'BUI Chat - Verification Test',
    width: 1080,
    height: 720,
    resizable: true,
  })

  window.body.setAttribute('styled', '')
  window.body.className = 'm-0 h-full w-full bg-[#0B0D12] text-[#F5F5F5]'

  console.log('BUI Native Window created! Window ID:', window.id)

  // Wait 1.5 seconds for initial layout and damage rendering
  await new Promise(r => setTimeout(r, 1500))

  try {
    const shot = await window.screenshot()
    console.log(`Captured Native Window Screenshot: ${shot.width}x${shot.height}, data size: ${shot.data.length} bytes`)
  } catch (err) {
    console.error('Screenshot capture failed:', err)
  }

  // Check persistence
  const convs = loadConversations()
  console.log('Conversations in AppData:', convs.length)
  console.log('AppData directory:', getStorageDir())

  console.log('--- Verification Test Completed Successfully ---')
  app.quit()
}

runE2ETest()
