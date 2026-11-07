/**
 * Sarvam AI Chat Completions API client with genuine Server-Sent Events (SSE) streaming.
 * Specifically tuned for Sarvam 105B (v2 chat completions).
 */

class SarvamApiError extends Error {
  constructor(status, message, code = 'api_error', details = null) {
    super(message)
    this.name = 'SarvamApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function parseErrorMessage(status, rawText) {
  let json = null
  try {
    json = JSON.parse(rawText)
  } catch (_) {}

  const serverMsg = json?.error?.message || json?.message || rawText || ''

  switch (status) {
    case 400:
      return new SarvamApiError(400, `Invalid request: ${serverMsg || 'Malformed parameters or unsupported fields.'}`, 'bad_request', json)
    case 401:
      return new SarvamApiError(401, 'Invalid or expired Sarvam API key (HTTP 401). Please check your key in Settings.', 'invalid_api_key', json)
    case 403:
      return new SarvamApiError(403, `Access denied or unauthorized (HTTP 403). ${serverMsg || 'Verify your Sarvam subscription.'}`, 'forbidden', json)
    case 404:
      return new SarvamApiError(404, `Model or endpoint not found (HTTP 404): ${serverMsg}`, 'not_found', json)
    case 413:
      return new SarvamApiError(413, 'Request payload too large (HTTP 413). Conversation history exceeds token limits.', 'payload_too_large', json)
    case 429:
      return new SarvamApiError(429, 'Sarvam API rate limit exceeded (HTTP 429). Please wait a moment before retrying.', 'rate_limit', json)
    case 502:
    case 503:
      return new SarvamApiError(status, `Sarvam service temporarily unavailable (HTTP ${status}). The model server may be busy.`, 'service_unavailable', json)
    default:
      return new SarvamApiError(status, serverMsg ? `Sarvam API error (${status}): ${serverMsg}` : `Sarvam API returned error HTTP ${status}`, 'unknown_error', json)
  }
}

/**
 * Streams chat completion from Sarvam 105B.
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages - conversation history
 * @param {string} options.apiKey - Sarvam subscription key
 * @param {string} [options.baseUrl] - API endpoint base (defaults to https://api.sarvam.ai/v2)
 * @param {string} [options.model] - Model name (defaults to sarvam-105b)
 * @param {number} [options.maxTokens] - Max tokens to generate
 * @param {string} [options.sessionId] - Session affinity ID
 * @param {AbortSignal} [options.signal] - Abort signal for user cancellation
 * @param {(chunk: string) => void} options.onDelta - Called when new visible text tokens arrive
 * @param {(accumulated: string) => void} [options.onComplete] - Called when generation completes successfully
 * @param {(error: Error, partialText: string) => void} options.onError - Called on error with accumulated text
 */
async function streamChatCompletion({
  messages,
  apiKey,
  baseUrl = 'https://api.sarvam.ai/v2',
  model = 'sarvam-105b',
  maxTokens = 2048,
  sessionId = null,
  signal = null,
  onDelta,
  onComplete,
  onError,
}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    const err = new SarvamApiError(401, 'No Sarvam API key configured. Please enter your API key in Settings.', 'missing_key')
    onError(err, '')
    return
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`

  const headers = {
    'Content-Type': 'application/json',
    'api-subscription-key': apiKey.trim(),
  }

  if (sessionId) {
    headers['x-session-affinity'] = String(sessionId)
  }

  const payload = {
    model: model || 'sarvam-105b',
    messages: messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: String(m.content || ''),
    })),
    stream: true,
    max_tokens: Number(maxTokens) || 2048,
  }

  let accumulated = ''
  let response = null

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    })
  } catch (fetchErr) {
    if (signal?.aborted) {
      if (onComplete) onComplete(accumulated)
      return
    }
    const netErr = new SarvamApiError(0, `Network error: Could not reach Sarvam API at ${baseUrl}. (${fetchErr.message})`, 'network_error')
    onError(netErr, accumulated)
    return
  }

  if (!response.ok) {
    let errBody = ''
    try {
      errBody = await response.text()
    } catch (_) {}
    const err = parseErrorMessage(response.status, errBody)
    onError(err, accumulated)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf8')
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      // Keep the last partial line in buffer
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith(':')) continue // Keep-alive comment

        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim()
          if (dataStr === '[DONE]') {
            // Terminal event reached
            if (onComplete) onComplete(accumulated)
            return
          }

          try {
            const parsed = JSON.parse(dataStr)
            const choice = parsed.choices?.[0]
            if (!choice) continue

            const delta = choice.delta || {}

            // Extract visible content
            // Sarvam may return content in delta.content or delta.text
            const textPiece = delta.content || delta.text || ''

            if (textPiece) {
              // Filter out internal reasoning tags if present
              const cleanPiece = textPiece.replace(/<\/?think>/gi, '')
              if (cleanPiece) {
                accumulated += cleanPiece
                if (onDelta) onDelta(cleanPiece)
              }
            }
          } catch (_) {
            // Ignore unparseable or ping chunks
          }
        }
      }
    }

    // Flush any remaining buffer if done
    if (buffer.trim().startsWith('data:')) {
      const dataStr = buffer.trim().slice(5).trim()
      if (dataStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataStr)
          const textPiece = parsed.choices?.[0]?.delta?.content || ''
          if (textPiece) {
            accumulated += textPiece
            if (onDelta) onDelta(textPiece)
          }
        } catch (_) {}
      }
    }

    if (onComplete) onComplete(accumulated)
  } catch (streamErr) {
    if (signal?.aborted) {
      // User cancelled generation: preserve partial response
      if (onComplete) onComplete(accumulated)
      return
    }
    const err = new SarvamApiError(0, `Streaming interrupted: ${streamErr.message}`, 'stream_interrupted')
    onError(err, accumulated)
  } finally {
    try {
      reader.releaseLock()
    } catch (_) {}
  }
}

/**
 * Quick validation check for an API key against Sarvam 105B.
 */
async function testApiKey(apiKey, baseUrl = 'https://api.sarvam.ai/v2') {
  if (!apiKey || apiKey.trim() === '') {
    return { ok: false, message: 'API key cannot be empty.' }
  }

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey.trim(),
      },
      body: JSON.stringify({
        model: 'sarvam-105b',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 2,
        stream: false,
      }),
    })

    if (res.ok) {
      return { ok: true, message: 'Connection successful! Sarvam 105B is accessible.' }
    } else {
      let body = ''
      try { body = await res.text() } catch (_) {}
      const err = parseErrorMessage(res.status, body)
      return { ok: false, message: err.message, status: res.status }
    }
  } catch (err) {
    return { ok: false, message: `Could not connect to Sarvam API: ${err.message}` }
  }
}

module.exports = {
  streamChatCompletion,
  testApiKey,
  SarvamApiError,
}
