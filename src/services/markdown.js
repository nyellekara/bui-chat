/**
 * Lightweight markdown parser for chat messages.
 * Splits assistant responses into structured text paragraphs and code blocks.
 */
function parseMessageContent(rawText) {
  if (!rawText || typeof rawText !== 'string') return []

  const parts = []
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const textBefore = rawText.slice(lastIndex, match.index)
    if (textBefore) {
      parts.push({ type: 'text', content: textBefore })
    }
    const lang = match[1]?.trim() || 'code'
    const code = match[2] // code body
    parts.push({ type: 'code', language: lang, content: code })
    lastIndex = match.index + match[0].length
  }

  const remainingText = rawText.slice(lastIndex)
  if (remainingText) {
    parts.push({ type: 'text', content: remainingText })
  }

  return parts
}

module.exports = {
  parseMessageContent,
}
