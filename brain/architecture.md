# Architecture

## Process Model

TrayFocus is a standard **Electron** app with three process types:

| Process | Entry | Role |
|---|---|---|
| **Main** | `src/main/index.js` | Creates `BrowserWindow`, system `Tray`, registers IPC handlers, manages `settings.json` read/write, auto-updater |
| **Preload** | `src/preload/index.js` | Runs before renderer, exposes `window.electron` (from `@electron-toolkit/preload`) and `window.settingsAPI` via `contextBridge` |
| **Renderer** | `src/renderer/src/main.jsx` | React app mounted into `#root`, renders `<ErrorBoundary><App /></ErrorBoundary>` |

## Main Process (`src/main/index.js`)

### Window
- `BrowserWindow` created in `createWindow()` at `src/main/index.js:49`
- **450×600** (changed from 700×600), `resizable: false`, `frame: false`, `titleBarStyle: 'hidden'`
- `show: false` → `mainWindow.on('ready-to-show', () => mainWindow.show())`
- Preload at `join(__dirname, '../preload/index.js')`

### Tray
- Created in `createTray()` at `src/main/index.js:39`
- Uses `resources/icon.png` (from `../../resources/icon.png?asset`)
- Context menu: **Show** (restores window), **Quit** (sets `isQuitting = true`, calls `app.quit()`)
- Click handler: toggles window visibility

### Minimize-to-Tray
- `mainWindow.on('close', handler)` intercepts close
- If `getMinimizeToTray()` returns `true` and `!isQuitting` → `e.preventDefault(); mainWindow.hide()`
- `getMinimizeToTray()` reads `settings.json` (`minimizeToTray` key), defaults to `true`

### Settings File I/O (`src/main/index.js:8-20`)
```js
const settingsPath = () => join(app.getPath('userData'), 'settings.json')
const loadSettings = () => JSON.parse(fs.readFileSync(...))
const saveSettings = (data) => fs.writeFileSync(...)
```
- Path: `%APPDATA%/trayfocus/settings.json` on Windows
- `ipcMain.handle('settings-load', ...)` and `ipcMain.handle('settings-save', ...)`

### IPC Handlers
| Channel | Type | Handler |
|---|---|---|
| `window-minimize` | `ipcMain.on` | `BrowserWindow.getFocusedWindow().minimize()` |
| `window-maximize` | `ipcMain.on` | Toggle maximize/unmaximize |
| `window-close` | `ipcMain.on` | `minimizeToTray` ? hide : close |
| `toggle-always-on-top` | `ipcMain.on` | Toggle `win.setAlwaysOnTop()` via `event.returnValue` |
| `settings-load` | `ipcMain.handle` | Returns parsed settings.json |
| `settings-save` | `ipcMain.handle` | Writes to settings.json, then calls `updateAutoStart()` |
| `check-for-updates` | `ipcMain.on` | `autoUpdater.checkForUpdates()` |
| `download-update` | `ipcMain.on` | `autoUpdater.downloadUpdate()` |
| `install-update` | `ipcMain.on` | `autoUpdater.quitAndInstall()` |

### Auto-Start (`src/main/index.js:24-27`)
When the "Launch at startup" setting is enabled, `app.setLoginItemSettings({ openAtLogin: true })` registers TrayFocus to start with Windows. Called on app startup and after every settings save via `updateAutoStart()`.

## Preload (`src/preload/index.js`)

```js
contextBridge.exposeInMainWorld('electron', electronAPI)   // from @electron-toolkit/preload
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI) // custom: load/save via invoke
```
- `settingsAPI.load()` → `ipcRenderer.invoke('settings-load')`
- `settingsAPI.save(data)` → `ipcRenderer.invoke('settings-save', data)`

## Renderer: State Architecture (`src/renderer/src/App.jsx`)

All top-level state lives in the `App` component:

| State | Type | Default | Persisted? |
|---|---|---|---|
| `isThemeModalOpen` | boolean | `false` | No |
| `isCommandPaletteOpen` | boolean | `false` | No |
| `paletteMode` | `'commands'`/`'spotlight'` | `'commands'` | No |
| `isSidebarOpen` | boolean | `false` | No |
| `isSettingsModalOpen` | boolean | `false` | No |
| `isCheatsheetOpen` | boolean | `false` | No |
| `activePage` | `'chat'`/`'home'`/`'markdown'` | `'chat'` (localStorage init) | Yes (localStorage + settings.json) |
| `activeTheme` | string | `'zinc'` (theme ID) | Yes (settings.json) |
| `settingsValues` | object | `{}` → loaded data | Yes (settings.json) |
| `settingsLoaded` | boolean | `false` | No (gate for SettingsModal) |
| `alwaysOnTop` | boolean | `false` | Yes (settings.json) |
| `updateStatus` | object/null | `null` | No (IPC events) |

### State Flow
```
App.jsx mount
  → settings.load()       // IPC → main process → read settings.json
  → setActiveTheme()
  → setActivePage()
  → setSettingsValues(data)
  → setSettingsLoaded(true)
  → if checkUpdates → ipcSend('check-for-updates')
```

### Shortcut Registration
`useEffect` → `startListening()` → `register(key, callback, options)` for each shortcut:
- `Ctrl+T` → toggle theme modal
- `Ctrl+P` → toggle command palette (commands mode)
- `Ctrl+Shift+P` → open command palette (spotlight mode)
- `Ctrl+Shift+A` → toggle always-on-top
- `Ctrl+B` → toggle sidebar
- `Ctrl+,` → open settings
- `Ctrl+/` → toggle shortcut cheatsheet

All managed by `ShortcutManager` (singleton at `src/renderer/src/utils/ShortcutManager.js`).

## Settings Persistence Flow

```
User changes setting in SettingsModal
  → handleChange(key, value) updates SettingsModal's internal `values` state
  → User clicks Save
  → handleSave() → onSave(values) in App.jsx
  → settings.save(values)
    → ipcRenderer.invoke('settings-save', cache)     // renderer
    → ipcMain.handle('settings-save', ...)            // main process
    → fs.writeFileSync(settingsPath, JSON.stringify)  // disk
    → catch silently (renderer already has cache)
```

On app restart:
```
App mount → settings.load()
  → ipcRenderer.invoke('settings-load')     // renderer
  → ipcMain.handle('settings-load', ...)    // main process
  → JSON.parse(fs.readFileSync(...))        // disk
  → returned to renderer
  → setSettingsValues(data)
  → SettingsModal receives initialValues={settingsValues}
```
