# Settings System

## SettingsModal (`src/renderer/src/components/modals/SettingsModal.jsx`)

Full-featured settings dialog with tabbed navigation, search, save/reset, and custom section support.

### Architecture
```
SettingsModal
├── SettingsContext.Provider → { values, handleChange, errors, style }
├── TitleBar (minimize/close)
├── Notification (toast on save/reset)
├── ConfirmModal (on reset/unsaved close)
├── Sidebar (category tabs)
├── Content
│   ├── Search bar
│   ├── Custom sections (components) OR
│   └── Settings list (grouped by category, uses SettingsItem)
└── Footer (Reset + Save buttons)
```

### Categories
The modal supports both **normal settings** (defined in the `settings` array) and **custom sections** (React components rendered via `customSections` prop).

| Tab | Type | Component |
|---|---|---|
| General | Settings | Switch items: autostart, minimizeToTray, showMaximize, alwaysOnTop, displayName |
| Appearance | Custom | `AppearancePanel` — fontSize, compactMode, animationsEnabled |
| Accent | Custom | `AccentPanel` — 17 accent color swatches |
| Shortcuts | Custom | `ShortcutsPanel` — live table of all registered shortcuts |
| AI | Custom | `AIPanel` — deepseekKey, geminiKey, aiProvider, aiModel |
| Advanced | Custom | `AdvancedPanel` — checkUpdates, debugMode |

### Settings Flow
1. User opens Settings → `setValues(initialValues)` (loaded from `settingsValues` via App.jsx)
2. User changes a setting → `handleChange(key, value)` → updates internal `values` state → sets `isDirty = true`
3. User clicks Save → `handleSave()` → `onSave(values)` → `settings.save(values)` → IPC to main process → writes `settings.json`
4. User clicks Reset → `ConfirmModal` → `setValues(initialValues)` → `onReset?.()`
5. Close (Escape or X) → if `isDirty`, shows `ConfirmModal` ("Unsaved Changes")

### SettingsItem (`src/renderer/src/components/settings/SettingsItem.jsx`)
Reusable input component that reads/writes via `useSettings()` context.

**Input Types Supported:**
- `text` — text input
- `number` — number input with min/max/step
- `textarea` — multi-line text
- `select` — dropdown with options
- `switch` — toggle switch (`bg-blue-500` when ON)
- `checkbox` — checkbox
- `color` — color picker
- `range` — range slider

Each setting definition:
```js
{ key: 'settingKey', category: 'general', label: 'Display Name', description: '...', type: 'text', defaultValue: 'User', placeholder: '...' }
```

## All Setting Keys & Defaults

| Key | Default | Type | Category | Description |
|---|---|---|---|---|
| `theme` | `'zinc'` | string | — | Active theme ID |
| `autostart` | `false` | switch | General | Launch at startup |
| `minimizeToTray` | `true` | switch | General | Hide to tray on close |
| `showMaximize` | `true` | switch | General | Show maximize button |
| `alwaysOnTop` | `false` | switch | General | Keep window above others |
| `displayName` | `'User'` | text | General | Display name in app |
| `accent` | `'blue'` | select | Accent | Accent color ID |
| `fontSize` | `14` | number | Appearance | App text size (px) |
| `cursorStyle` | `'bar'` | — | — | Not yet used |
| `cursorWidth` | `2` | — | — | Not yet used |
| `compactMode` | `false` | switch | Appearance | Denser layout |
| `animationsEnabled` | `true` | switch | Appearance | UI transitions |
| `checkUpdates` | `true` | switch | Advanced | Auto-check on startup |
| `debugMode` | `false` | switch | Advanced | Debug logging |
| `deepseekKey` | `''` | text | AI | DeepSeek API key |
| `geminiKey` | `''` | text | AI | Gemini API key |
| `aiProvider` | `'deepseek'` | select | AI | Default AI provider |
| `aiModel` | `'deepseek-chat'` | select | AI | AI model |
| `activePage` | `'chat'` | — | — | Last active tab (sidebar) |

## Settings Persistence

All persistent settings go through `src/renderer/src/utils/settingsManager.js`:

**Save:**
```
App.jsx onSave → settings.save(values)
  → cache = { ...cache, ...partial }
  → ipcRenderer.invoke('settings-save', cache)
    → main process: ipcMain.handle('settings-save')
      → fs.writeFileSync(settingsPath, JSON.stringify(data))
        → %APPDATA%/trayfocus/settings.json
```

**Load:**
```
App.jsx mount → settings.load()
  → ipcRenderer.invoke('settings-load')
    → main process: ipcMain.handle('settings-load')
      → JSON.parse(fs.readFileSync(...))
  → setSettingsValues(data)
  → SettingsModal initialValues={settingsValues}
```

**Defaults fallback:** If file doesn't exist or is corrupted, `loadSettings()` returns `{}`, and `settingsManager` applies `defaults` on top.

## Deduplication
- `loadPromise` in settingsManager prevents concurrent IPC calls during initial load
- `cache` layer avoids re-reading from disk every time
- `isOpen` guard on SettingsModal's reset effect prevents re-initialization on prop changes (only resets when modal actually opens)

## Custom Section Panels

Each custom section is a standalone React component in `src/renderer/src/components/settings/`:

| Panel | Purpose |
|---|---|
| `AppearancePanel.jsx` | Font size, compact mode, animations — uses `SettingsItem` with `useSettings()` |
| `AccentPanel.jsx` | 17-color swatch grid, reads/writes `accent` via `useSettings()` |
| `ShortcutsPanel.jsx` | Live table of all shortcuts from `ShortcutManager.getAll()`, per-shortcut toggle |
| `AIPanel.jsx` | API key fields + provider/model dropdowns, uses `SettingsItem` with `useSettings()` |
| `AdvancedPanel.jsx` | Auto-check updates, debug mode — uses `SettingsItem` with `useSettings()` |
