# TrayFocus — Agent Brain

TrayFocus is a lightweight **Electron + React** desktop utility built with **electron-vite**. It runs in the system tray and provides a custom frameless window with theme switching, AI chat (DeepSeek/Gemini), a markdown editor with live preview, keyboard-driven command palette, persistent settings, and auto-update support via GitHub Releases.

## Project Structure

```
TrayFocus/
├── src/
│   ├── main/index.js          — Electron main process (window, tray, IPC, auto-updater)
│   ├── main/updater.js        — electron-updater integration
│   ├── preload/index.js       — contextBridge: exposes electron, api, settingsAPI
│   └── renderer/
│       ├── index.html          — entry HTML (CSP, root div)
│       ├── src/
│       │   ├── main.jsx        — React root: ErrorBoundary → App
│       │   ├── App.jsx         — root component: all state, shortcuts, modals
│       │   ├── theme.js        — 19 themes + accent colors (single source of truth)
│       │   ├── ai/             — AI providers (DeepSeek.js, Gemini.js, index.js)
│       │   ├── components/
│       │   │   ├── header/TitleBar.jsx
│       │   │   ├── sidebar/    — Sidebar, SidebarHeader, Items, Groups, Context
│       │   │   ├── modals/     — SettingsModal, ThemeModal, ConfirmModal, Notification, ErrorBoundary
│       │   │   ├── content/    — CommandPalette (Ctrl+P / Ctrl+Shift+P)
│       │   │   ├── chat/       — ChatPanel, ChatInput, Markdown, MarkdownEditor, CodeMirror
│       │   │   └── settings/   — AIPanel, AppearancePanel, AdvancedPanel, AccentPanel, ShortcutsPanel
│       │   ├── utils/
│       │   │   ├── ShortcutManager.js   — keyboard shortcut registry (singleton)
│       │   │   └── settingsManager.js   — IPC-based settings persistence
│       │   └── assets/         — CSS, SVGs
├── electron-builder.yml        — build/publish config (GitHub, NSIS, oneClick=false)
├── package.json                — v1.0.4, scripts (dev, build, publish:win/mac/linux/all)
└── vite.config.js / electron.vite.config.mjs
```

## Key Architecture Decisions

- **Sandbox: false** — renderer has Node.js access (needed for IPC and fs in main)
- **contextIsolation: true** — preload uses `contextBridge.exposeInMainWorld` to expose `window.electron` (from `@electron-toolkit/preload`) and `window.settingsAPI`
- **Frame: false** — custom title bar (`TitleBar.jsx`) with `[app-region:drag]` CSS for window movement
- **Single window** — 700×600, `resizable: false`, title bar buttons control minimize/maximize/close via IPC
- **System tray** — `Tray` with context menu (Show/Quit), `minimizeToTray` setting hides on close instead of quitting
- **No localStorage** — all persistent settings go through `settingsManager.js` → `ipcRenderer.invoke` → main process → `AppData/trayfocus/settings.json`
- **No backend** — everything runs client-side; AI API keys stored locally, never sent anywhere except to the provider

## Table of Contents

| Doc | Description |
|---|---|
| [architecture.md](./architecture.md) | Full architecture: main/renderer/preload flow, IPC channels, state management |
| [ui.md](./ui.md) | UI system: TitleBar, Sidebar, layout, themes, accent, ErrorBoundary |
| [features.md](./features.md) | Command palette, spotlight search, keyboard shortcuts, tray, always-on-top |
| [chat.md](./chat.md) | AI chat: providers, streaming, system prompt, ChatPanel/ChatInput |
| [markdown.md](./markdown.md) | Markdown rendering, CodeMirror editor, live preview, resizable split |
| [settings.md](./settings.md) | Settings modal, persistence flow, all setting keys and defaults |
| [updates.md](./updates.md) | Auto-updater, GitHub Releases, publish scripts, NSIS installer |
| [out-of-scope.md](./out-of-scope.md) | What this project does NOT do, future ideas |

---

*This brain folder is the single source of truth for AI agents working on TrayFocus. Always refer to it before making changes.*
