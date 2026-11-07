const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

function getStorageDir() {
  const base = process.env.APPDATA || (process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : path.join(os.homedir(), '.config'))
  const dir = path.join(base, 'BUI-Chat')
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  } catch (err) {
    console.error('Failed to create storage directory:', err)
  }
  return dir
}

const CONVERSATIONS_FILE = path.join(getStorageDir(), 'conversations.json')
const SETTINGS_FILE = path.join(getStorageDir(), 'settings.json')

function loadConversations() {
  try {
    if (fs.existsSync(CONVERSATIONS_FILE)) {
      const data = fs.readFileSync(CONVERSATIONS_FILE, 'utf8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.warn('Could not read conversations file, starting fresh:', err.message)
  }
  return []
}

function saveConversations(conversations) {
  try {
    const dir = getStorageDir()
    const tempFile = path.join(dir, `conversations_${Date.now()}.tmp`)
    fs.writeFileSync(tempFile, JSON.stringify(conversations, null, 2), 'utf8')
    fs.renameSync(tempFile, CONVERSATIONS_FILE)
  } catch (err) {
    try {
      fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2), 'utf8')
    } catch (writeErr) {
      console.error('Failed to save conversations:', writeErr)
    }
  }
}

function loadSettings() {
  const defaults = {
    apiKey: process.env.SARVAM_API_KEY || '',
    baseUrl: process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai/v2',
    model: process.env.SARVAM_MODEL || 'sarvam-105b',
    maxTokens: 2048,
    mockMode: false,
    gpu: false,
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      const parsed = JSON.parse(data)
      return { ...defaults, ...parsed }
    }
  } catch (err) {
    console.warn('Could not read settings file, using defaults:', err.message)
  }
  return defaults
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

module.exports = {
  getStorageDir,
  loadConversations,
  saveConversations,
  loadSettings,
  saveSettings,
}
