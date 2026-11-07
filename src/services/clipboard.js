const { spawn } = require('node:child_process')

/**
 * Copies text to system clipboard.
 * Works natively on Windows via clip, or pbcopy on macOS, xclip/xsel on Linux.
 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    let cmd = 'clip'
    let args = []

    if (process.platform === 'darwin') {
      cmd = 'pbcopy'
    } else if (process.platform === 'linux') {
      cmd = 'xclip'
      args = ['-selection', 'clipboard']
    }

    try {
      const proc = spawn(cmd, args)
      proc.stdin.write(String(text))
      proc.stdin.end()
      proc.on('close', (code) => {
        if (code === 0) resolve(true)
        else resolve(false)
      })
      proc.on('error', (err) => {
        console.warn('Clipboard spawn error:', err.message)
        resolve(false)
      })
    } catch (err) {
      console.warn('Clipboard error:', err.message)
      resolve(false)
    }
  })
}

module.exports = {
  copyToClipboard,
}
