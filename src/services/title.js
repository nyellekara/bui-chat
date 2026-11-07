/**
 * Generates a concise, readable conversation title from the first prompt.
 * Lightweight, instant, and local.
 */
function generateTitle(prompt) {
  if (!prompt || typeof prompt !== 'string') return 'New Conversation'

  // Clean prompt: trim, remove leading question tags or punctuation
  let cleaned = prompt
    .trim()
    .replace(/^[\s#>`*_-]+/, '')
    .replace(/^(can you |please |help me |how do i |what is |explain |tell me about )/i, '')
    .trim()

  if (!cleaned) return 'New Conversation'

  // Take first sentence or up to 36 characters
  const firstLine = cleaned.split('\n')[0].trim()
  if (firstLine.length <= 36) {
    return firstLine.charAt(0).toUpperCase() + firstLine.slice(1)
  }

  // Find a word boundary within 32 chars
  const truncated = firstLine.slice(0, 32)
  const lastSpace = truncated.lastIndexOf(' ')
  const title = (lastSpace > 10 ? truncated.slice(0, lastSpace) : truncated) + '...'
  return title.charAt(0).toUpperCase() + title.slice(1)
}

module.exports = {
  generateTitle,
}
