# BUI Chat: A Native Desktop AI Chat Application

A polished, high-performance desktop AI chat application built with **BUI + React + Sarvam 105B**.

Demonstrates the capabilities of **BUI (Blender User Interface)**: a decoupled native retained-mode UI toolkit extracted from Blender's core architecture, running with a native Win32 window, React 19 reconciler, and genuine streaming from **Sarvam AI's frontier 105B parameter model**.

---

## 1. Overview & Architecture

Unlike typical desktop AI applications, **BUI Chat contains zero Electron, zero Chromium, zero Tauri, and zero WebViews**.

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Application                 │
│         Signals (useSignal, useState) · JSX            │
└──────────────────────────┬─────────────────────────────┘
                           │ @blender-ui/react reconciler
┌──────────────────────────▼─────────────────────────────┐
│                 BUI Retained DOM Layer                 │
│      @blender-ui/native · Discrete Event Updates       │
└──────────────────────────┬─────────────────────────────┘
                           │ napi-rs native bindings
┌──────────────────────────▼─────────────────────────────┐
│                BUI Core C Runtime (Kit)                │
│    Taffy Layout Engine · Blender Widgets · Win32 Host  │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   Software SDF Raster          Direct3D 11 GPU
(Default: parallel CPU bands) (Optional: instanced uber-shader)
```

### How BUI is Used Internally
1. **Host Window**: Uses BUI's native Win32 host (`kit_window_win32.c`) directly managed through napi-rs (`blenderui.win32-x64.node`).
2. **React Reconciler**: Uses `@blender-ui/react` (based on `react-reconciler 0.34`), mapping JSX tags (`<main>`, `<aside>`, `<div>`, `<button>`, `<textarea>`) to native BUI nodes.
3. **Signal-Backed State**: State updates are backed by reactive push-pull signals. Discrete events update native elements without triggering full virtual DOM reconciliations.
4. **Damage-Driven Rendering**: An idle BUI Chat window uses **0% CPU**. Only damaged 64×32 tiles are redrawn when state or typing changes.
5. **Layout & Styling**: Uses Taffy's flexbox/grid engine, rendering Tailwind CSS utility classes and hex color definitions.

---

## 2. Sarvam 105B Integration

BUI Chat integrates directly with Sarvam AI's official Chat Completions API (`v2`):

- **Endpoint**: `POST https://api.sarvam.ai/v2/chat/completions`
- **Header**: `api-subscription-key: <SARVAM_API_KEY>`
- **Model**: `sarvam-105b`
- **Session Affinity**: Unique opaque session UUID sent via `x-session-affinity` header per conversation.

### Genuine Server-Sent Events (SSE) Streaming
- Incoming response streams are consumed incrementally chunk-by-chunk.
- Choice deltas (`choices[0].delta.content`) are extracted and progressively appended to the active message.
- Internal reasoning content (`delta.reasoning_content` or `<think>...</think>` tokens) is filtered out from user-visible text.
- Terminal `[DONE]` events and final token usage chunks are properly handled.
- Supports instant cancellation via `AbortController` (stopping generation cleanly while preserving partial responses).
- Failed requests can be retried immediately with the "Retry" button.

### Robust API Error Handling
- **400 Bad Request**: Identifies malformed parameters or unsupported fields.
- **401 Unauthorized**: Clear guidance on missing or invalid API keys.
- **403 Forbidden**: Subscription and permission errors surfaced cleanly.
- **404 Not Found**: Catches model naming or endpoint mismatches.
- **413 Payload Too Large**: Warns when context length exceeds token bounds.
- **429 Rate Limit**: Displays friendly retry notices without crashing.
- **502 / 503 Server Unavailable**: Informs user of upstream model server status.
- **Network Interruptions**: Retains accumulated text and offers instant retry.
- **Key Safety**: The API key is never exposed in application logs or shared state.

---

## 3. Application Features & UI Design

Visual aesthetic follows a dark developer-tool design language:
- **Background**: `#0B0D12` (near-black)
- **Panels & Cards**: `#11151D` & `#161B26`
- **Borders**: `#252B38`
- **Primary Accent**: `#8B5CF6` (purple)
- **Primary Text**: `#F5F5F5`
- **Secondary Text**: `#9299A8`

### Sidebar
- **Branding**: BUI Chat badge with native engine status.
- **New Conversation**: Instant shortcut button (`+ New Conversation`).
- **Real-Time Search**: Filters conversations dynamically as you type.
- **Recent Conversations List**: Shows titles and message counts; active chat highlighted with purple border.
- **Delete Action**: Instant per-conversation removal.
- **Settings Summary**: Live status pill (Green = Active Sarvam 105B key, Amber = Mock mode / Setup needed).

### Main Chat Area
- **Top Navigation**: Current conversation title, model tag (`sarvam-105b`), and quick actions.
- **Empty State**: "What are we building today?" with 4 clickable suggestion cards:
  1. *Explain a complex concept*
  2. *Help me debug some code*
  3. *Design a software architecture*
  4. *Review this code*
- **Scrollable Message History**: User and assistant messages formatted with timestamps, badges, and avatars.
- **Formatted Code Blocks**: Monospace syntax blocks with language tags and native clipboard copying (`clip`).
- **Message Actions**: "Copy Response" and "Regenerate" actions.

### Multiline Message Composer
- Multiline `textarea` with autogrow.
- `Enter` sends the message; `Shift + Enter` inserts a newline.
- Send button disabled when empty or generating.
- In-flight indicator ("Generating response...").
- "Stop" generation button (`#EF4444`) to cancel stream.
- "Retry" button on error states.

### Persistence
- All conversations and settings persist in the operating system's standard Application Data directory:
  - **Windows**: `%APPDATA%\BUI-Chat` (`C:\Users\<User>\AppData\Roaming\BUI-Chat`)
  - **macOS / Linux**: `~/.config/BUI-Chat`
- Stored outside the project source repository.
- Handles missing or malformed JSON storage safely without crashing.

---

## 4. Installation & Launch Commands

### Prerequisites
- Node.js 18+ (tested on Node v24)
- Windows x64 (prebuilt native addon included)

### Setup
```bash
# Clone or navigate to the directory
cd bui

# Install dependencies
npm install

# Configure your Sarvam API Key
cp .env.example .env
# Edit .env and set: SARVAM_API_KEY=your_actual_key_here
```

### Launch
```bash
# Launch with Node.js
npm start

# Or launch with Bun (reads JSX natively)
npm run start:bun

# Or run the prebuilt standalone executable
./bui-chat.exe
```

### Build Standalone Executable
```bash
# Compiles a standalone ~116 MB executable bundling BUI native runtime + app
npm run build:exe
```

### Running Automated Verification Tests
```bash
# Runs the core engine test suite (streaming SSE, title generator, abort, error mapping, storage)
npm test

# Runs the end-to-end BUI native desktop window test & screenshot capture
npm run test:e2e
```

---

## 5. Configuring `SARVAM_API_KEY`

You can configure your Sarvam API key in two ways:

1. **Via Environment Variable / `.env` file**:
   ```env
   SARVAM_API_KEY=your_key_from_docs_sarvam_ai
   SARVAM_BASE_URL=https://api.sarvam.ai/v2
   SARVAM_MODEL=sarvam-105b
   ```
2. **Via In-App Settings UI**:
   - Click the **⚙ Settings** button in the sidebar or top navigation.
   - Paste your key into the **Sarvam API Key** field.
   - Click **Test Connection** to verify live connectivity with Sarvam 105B.
   - Click **Save Settings** (persisted securely in `%APPDATA%\BUI-Chat\settings.json`).

*Note*: If you do not have an active key, you can enable **Optional Mock Mode** in Settings to test the native UI, streaming animations, and code blocks completely offline.

---

## 6. Technical Limitations & Workarounds Encountered

1. **Signal vs. Primitive Props in Custom Reconciler**:
   - In `@blender-ui/react`, state returned by `useState` is a signal object. When passing values down component trees, passing either raw booleans or signals can cause `Cannot read properties of boolean (reading 'value')` if components assume signals.
   - *Resolution*: Implemented a clean unwrapping helper `getVal(v)` across components to handle both raw primitives and signals transparently.
2. **Layout Geometry Measurement**:
   - Calling `getBoundingClientRect()` on native nodes returns a Promise resolving to layout bounds once the native UI thread has committed the frame.
   - *Resolution*: Synchronized event handling through discrete update dispatching and async frame flushes.
3. **Clipboard in Headless / Native Node**:
   - While browsers have `navigator.clipboard`, Node in desktop environments does not include Web API clipboard globals.
   - *Resolution*: Implemented native Win32 clipboard pipe (`clip`), allowing instant, zero-dependency copy functionality.

---

## 7. Working Features vs Incomplete Features

| Feature | Status | Notes |
|---|---|---|
| Native Desktop Window (Win32) | **Working** | Powered by `@blender-ui/native` and Blender's C kit |
| Software SDF Raster (CPU) | **Working** | Zero idle CPU damage rendering (default) |
| Direct3D 11 Hardware GPU Mode | **Working** | Switchable via `BUI_GPU=1` or in Settings |
| React 19 Reconciler | **Working** | Fully driven by `@blender-ui/react` |
| Sarvam 105B API Client | **Working** | SSE streaming, deltas, session affinity |
| Abort / Stop Generation | **Working** | Stops in-flight fetch and retains partial text |
| Local Persistence in AppData | **Working** | Auto-saves conversations outside source dir |
| Multiple Conversations | **Working** | Create, switch, search, and delete |
| Code Block Formatting & Copy | **Working** | Language tags and one-click copy to clipboard |
| Suggestion Cards & Empty State | **Working** | One-click prompt submission |
| In-App Settings & Key Tester | **Working** | Live API key ping and validation |
| Standalone Windows Executable | **Working** | Built via `bui build` into `bui-chat.exe` |
| Audio / Voice Input | *Planned* | Not part of current text chat scope |
| Markdown Tables Rendering | *Planned* | Code blocks & paragraphs supported; full GFM tables planned |

---

## License
GPL-3.0-or-later (aligned with Blender UI & BUI).
