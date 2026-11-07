# Cross-runtime benchmark harness

The harness uses one deterministic fixture: a 1080×720 window, 500 alternating user/assistant messages, and a 10,000-token stream at a 16 ms cadence. The primary comparison is resource usage: `metrics.totalRssBytes` (total runtime memory), `metrics.averageCpuPercent`/`metrics.peakCpuPercent` (CPU cost), `metrics.memoryDeltaBytes` (growth), and `metrics.processCount`. `startupMs` and `streamMs` remain diagnostic timing fields, not the headline score.

## Results policy

Only results produced by the current harness revision should be compared. Older startup/stream tables were exploratory smoke measurements and are intentionally superseded because they did not aggregate Electron's renderer process or use equivalent update paths. The workload is synthetic and measures runtime behavior, not model/network latency.

## Files

- `bui.jsx` — BUI native benchmark
- `web/` — shared web fixture used by Electron and Tauri
- `electron/` — Electron host
- `tauri/` — Tauri host
- `gpui/` — GPUI host

The remaining limitation is environmental rather than conceptual: the machine needs several more gigabytes free to finish native Rust linking and run a clean multi-trial comparison for Tauri and GPUI.
