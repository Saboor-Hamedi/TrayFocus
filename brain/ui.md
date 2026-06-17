# UI System

## TitleBar (`src/renderer/src/components/header/TitleBar.jsx`)

Custom frameless title bar replacing native OS chrome. Renders three window control buttons (minimize, maximize, close) plus an update indicator and a pin icon.

### Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | string | `"TrayFocus"` | App name shown in draggable area |
| `onMinimize` | func | — | IPC `window-minimize` |
| `onMaximize` | func | — | IPC `window-maximize` |
| `onClose` | func | — | IPC `window-close` |
| `showMinimize` | boolean | `true` | Controlled by `settingsValues.minimizeToTray` |
| `showMaximize` | boolean | `true` | Controlled by `settingsValues.showMaximize` |
| `pinned` | boolean | `false` | Shows `Pin` icon when `alwaysOnTop` is active |
| `titleColor` | string | `''` | Tailwind class for the title text (accent color) |
| `backgroundColor` | string | `'bg-zinc-800'` | Bar background |
| `textColor` | string | `'text-zinc-100'` | Text/icon color |
| `updateStatus` | object | `null` | Auto-updater status from main process |
| `appVersion` | string | `'1.0.0'` | Current version from `package.json` |
| `onCheckUpdate` | func | — | IPC `check-for-updates` |
| `onDownloadUpdate` | func | — | IPC `download-update` |
| `onInstallUpdate` | func | — | IPC `install-update` |

### Structure
```
<div className="flex h-8 w-full...">
  <!-- Draggable area: title + pin + update indicator -->
  <div className="[app-region:drag]">
    <span>{title}</span>
    {pinned && <Pin />}
    <button onClick={showDropdown}><Download /></button>  <!-- update indicator -->
    {showDropdown && <div>dropdown with version, download/install/check buttons</div>}
  </div>
  <!-- Non-draggable area: window controls -->
  <div className="[app-region:no-drag]">
    {showMinimize && <button onClick={onMinimize}><Minus /></button>}
    {showMaximize && <button onClick={onMaximize}><Square /></button>}
    <button onClick={onClose} className="hover:bg-red-600"><X /></button>
  </div>
</div>
```

### Update Indicator
- Always visible (subtle download icon)
- States: idle (text-white/20), available (blue badge + version), downloading (spinner + circular progress ring SVG), downloaded (green badge → click to restart)
- Dropdown: version info + "Download & Install" / "Restart to Update" + "Check for updates"

## Sidebar (`src/renderer/src/components/sidebar/`)

Toggleable left panel (`Ctrl+B`). Contains nav items, header with close button, and settings link at bottom.

### Files
| File | Role |
|---|---|
| `Sidebar.jsx` | Main component, context provider, SidebarItem/SidebarGroup/SidebarDivider |
| `sidebarContext.js` | Shared `SidebarContext` + `useSidebar()` hook (avoids circular deps) |
| `SidebarHeader.jsx` | Title + subtitle (dynamic version from `pkg.version`) + close button |
| `SidebarFooter.jsx` | Optional footer (user info, version) — not currently used in main sidebar |

### Sidebar Component Props
- `isOpen`, `onClose`, `position='left'`, `width='w-56'`
- `theme={sidebarStyle}` — accepts style object derived from active app theme
- `closeOnOverlayClick={false}`, `closeOnEscape={false}` — sidebar only closes via button or `Ctrl+B`
- `collapsible={false}` — always expanded when open

### Sidebar Items (in App.jsx)
```
Main:
  Chat (MessageCircle)    → setActivePage('chat')
  Home (House)            → setActivePage('home')
  Markdown (FileText)     → setActivePage('markdown')

Appearance:
  Theme (Palette) Ctrl+T → open ThemeModal

Divider
  Settings (Cog) Ctrl+,   → open SettingsModal
```
Active states are dynamic: Chat/Home/Markdown highlight based on `activePage`, Theme highlights when modal open, Settings highlights when modal open.

## Theme System (`src/renderer/src/theme.js`)

Single source of truth for 19 themes. Each theme object:

```js
{ id, name, preview, bg, text, titlebar, accent }
```

- `preview` — color swatch shown in ThemeModal (e.g., `bg-blue-600`)
- `bg` — page background (e.g., `bg-blue-950`)
- `text` — text color (e.g., `text-blue-100`)
- `titlebar` — title bar background (e.g., `bg-blue-950`)
- `accent` — text-only class (e.g., `text-sky-400`) — used for active states, not backgrounds

### Accent
- Decoupled from theme — user can pick any accent independently in **Settings → Accent** tab
- 17 available colors in `AccentPanel.jsx`
- `accentClass` computed in App.jsx: `text-${accentId}-400`
- Applied to: app title in TitleBar, active sidebar items, active settings tabs
- **Toggles** (switch) always use `bg-blue-500` — not affected by accent

### ThemeModal (`src/renderer/src/components/modals/ThemeModal.jsx`)
- Opens via `Ctrl+T`, sidebar "Theme" link, or CommandPalette
- Searchable 5-column grid of 19 color swatches
- Auto-focuses search, Escape closes, selected theme scrolls into view
- `getThemeNames()` returns `{ id, name, preview }` from theme.js

## Layout

```
<div className="flex h-screen w-screen flex-col">        ← root
  <TitleBar />                                            ← 32px fixed
  <main className="flex-1">                               ← fills remaining space
    {chatPanel || markdownEditor || blank}
  </main>
  <Sidebar />                                             ← absolute positioned, overlay
  <ThemeModal />                                          ← z-50 overlay
  <SettingsModal />                                       ← z-50 overlay
  <CommandPalette />                                      ← z-50 overlay
  <Notification />                                        ← z-50 toast
  <ShortcutCheatsheet />                                  ← z-50 overlay
</div>
```

Root has `select-none` (no text selection), `overflow-hidden` (no scrollbar on body). Individual components add `select-text` where needed (chat messages, markdown preview).

## ErrorBoundary (`src/renderer/src/components/ErrorBoundary.jsx`)

Class component wrapping the entire `<App />`. Catches React render errors, shows a modal with:
- Error message (red box)
- Expandable stack trace (collapsible `<pre>` with monospace)
- Component stack (which React component caused the error)
- **Copy** button (copies full error + stack to clipboard)
- **Try Again** button (resets boundary, re-renders children)
- **Reload App** button (`window.location.reload()`)

Does NOT crash the Electron shell — only the React tree is affected. Rest of app (title bar, tray) stays functional.
