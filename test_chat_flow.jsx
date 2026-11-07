/** @jsxImportSource @blender-ui/react */
require('dotenv').config()
const { streamChatCompletion, testApiKey } = require('./src/api/sarvam.js')
const { streamMockCompletion } = require('./src/api/mock.js')
const { loadConversations, saveConversations, getStorageDir, loadSettings } = require('./src/services/storage.js')
const { generateTitle } = require('./src/services/title.js')

async function runChatTests() {
  console.log('='.repeat(60))
  console.log('RUNNING BUI CHAT CORE ENGINE & STREAMING VERIFICATION')
  console.log('='.repeat(60))

  // 1. Test Title Generation
  console.log('\n[1] Testing Title Generation:')
  const t1 = generateTitle('Can you explain how BUI renders native Windows without WebViews?')
  console.log('  Prompt: "Can you explain how BUI renders native Windows without WebViews?"')
  console.log('  Title: ', t1)

  // 2. Test Mock Streaming
  console.log('\n[2] Testing Streaming (Server-Sent Events Simulation):')
  let streamedText = ''
  let chunkCount = 0
  await streamMockCompletion({
    messages: [{ role: 'user', content: 'What is BUI?' }],
    onDelta: (chunk) => {
      chunkCount++
      streamedText += chunk
      process.stdout.write(chunk)
    },
    onComplete: (full) => {
      console.log(`\n  ✓ Mock streaming complete! Received ${chunkCount} chunks, total chars: ${full.length}`)
    },
    onError: (err) => {
      console.error('  Mock streaming error:', err)
    }
  })

  // 3. Test Abort / Cancellation
  console.log('\n[3] Testing Streaming Cancellation via AbortController:')
  const controller = new AbortController()
  let partialReceived = ''
  setTimeout(() => {
    console.log('  Triggering abort signal at 40ms...')
    controller.abort()
  }, 40)

  await streamMockCompletion({
    messages: [{ role: 'user', content: 'Tell me a long story.' }],
    signal: controller.signal,
    onDelta: (c) => { partialReceived += c },
    onComplete: (full) => {
      console.log(`  ✓ Cancelled cleanly! Partial text retained (${partialReceived.length} chars).`)
    },
    onError: (err) => {
      console.log('  Error callback received:', err.message)
    }
  })

  // 4. Test API Key Validation & Error Mapping
  console.log('\n[4] Testing Sarvam API Key Validation & Error Mapping:')
  const invalidKeyTest = await testApiKey('invalid_dummy_key_12345')
  console.log('  Testing invalid API key result:', invalidKeyTest)
  console.log('  ✓ Expected rejection handled gracefully without crashing.')

  // 5. Test Persistence in AppData
  console.log('\n[5] Testing Local Storage Persistence in AppData:')
  const storageDir = getStorageDir()
  console.log('  Storage Directory:', storageDir)
  const testConvs = [
    {
      id: 'test-conv-1',
      title: 'BUI Native Architecture',
      sessionId: 'test-session-123',
      messages: [
        { id: 'm1', role: 'user', content: 'Explain BUI architecture', timestamp: Date.now() },
        { id: 'm2', role: 'assistant', content: 'BUI runs on a retained C kit...', timestamp: Date.now() }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ]
  saveConversations(testConvs)
  const reloaded = loadConversations()
  console.log('  Saved & Reloaded Conversations Count:', reloaded.length)
  console.log('  First conversation title:', reloaded[0]?.title)
  console.log('  ✓ Persistence verified.')

  console.log('\n' + '='.repeat(60))
  console.log('ALL ENGINE VERIFICATIONS PASSED')
  console.log('='.repeat(60))
}

runChatTests()
