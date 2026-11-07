# Cross-runtime benchmark harness

The harness uses one deterministic fixture: a 1080×720 window, 500 alternating user/assistant messages, and a 10,000-token stream at a 16 ms cadence. `startupMs` measures fixture/UI construction until streaming begins; `streamMs` measures the stream only. It also records token count, message count, and runtime memory/CPU where the runtime exposes those counters.

## Current measured results

These are single-run smoke measurements on the current Windows machine, not a statistical performance study yet:

| Runtime | Startup | Stream | RSS | Result |
| --- | ---: | ---: | ---: | --- |
| BUI software raster | 8,575.7 ms | 8,475.6 ms | 101.3 MiB | completed |
| BUI Direct3D 11 | 9,105.8 ms | 8,891.6 ms | 125.2 MiB | completed |
| Electron | — | — | — | Electron binary exited before loading the benchmark entrypoint in this sandbox |
| Tauri | — | — | — | dependency build started but failed when the machine ran out of disk/paging space |
| GPUI | — | — | — | reduced-feature `cargo check` passed; executable link was stopped because disk space fell below 1 GiB |

The BUI run was repeated once per mode. The workload itself is intentionally synthetic and measures rendering/runtime behavior, not model/network latency.

## Files

- `bui.jsx` — BUI native benchmark
- `web/` — shared web fixture used by Electron and Tauri
- `electron/` — Electron host
- `tauri/` — Tauri host
- `gpui/` — GPUI host

The remaining limitation is environmental rather than conceptual: the machine needs several more gigabytes free to finish native Rust linking and run a clean multi-trial comparison for Tauri and GPUI.
