const MESSAGE_COUNT = 500
const TOKEN_COUNT = 10000
const STREAM_INTERVAL_MS = 16
const RUN_DURATION_MS = 9000

function makeMessage(index) {
  return {
    id: index,
    role: index % 2 === 0 ? 'user' : 'assistant',
    text: index % 2 === 0
      ? `User prompt ${index}: explain how a native retained-mode UI updates only damaged regions.`
      : `Assistant response ${index}: signals update the affected node while the renderer preserves the rest of the retained tree.`,
  }
}

function makeFixture() {
  return Array.from({ length: MESSAGE_COUNT }, (_, index) => makeMessage(index))
}

module.exports = {
  MESSAGE_COUNT,
  TOKEN_COUNT,
  STREAM_INTERVAL_MS,
  RUN_DURATION_MS,
  makeFixture,
}
