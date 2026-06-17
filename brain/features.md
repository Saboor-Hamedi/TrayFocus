# Features

## Command Palette (`Ctrl+P` / `Ctrl+Shift+P`)

Single component at `src/renderer/src/components/content/CommandPalette.jsx` that works in two modes:

### Commands Mode (`Ctrl+P`)
- Searches only the `commands` array (defined in App.jsx)
- Disabled by default — typing anything shows "Type Ctrl+Shift+P or > to search"
- When user types `>`, automatically switches to **Spotlight Mode**

### Spotlight Mode (`Ctrl+Shift+P`)
- `>` prefix visible in the input (like VS Code)
- Searches **commands + themes + keyboard shortcuts** (all live data from ShortcutManager and theme.js)
- Backspace to delete `>` → switches back to Commands Mode
- `Ctrl+Shift+P` while palette is open → toggles between modes

### UI
- Single card: search input at top with `Search` icon, results list below, footer with `↑↓ Enter Esc` hints
- Keyboard navigation: `↑↓` arrows, `Enter` to select, `Escape` to close
- Results show icon, name, description, shortcut (if applicable), and kind badge (command/theme/shortcut)

### Integration
- Both modes use the SAME component with `mode` prop
- App.jsx tracks `paletteMode` state (`'commands'` / `'spotlight'`)
- `Ctrl+P` sets mode to `'commands'` and toggles open
- `Ctrl+Shift+P` sets mode to `'spotlight'` and opens (always opens, never toggles)

## Keyboard Shortcuts Reference (`Ctrl+/`)

`ShortcutCheatsheet` component at `src/renderer/src/components/modals/ShortcutCheatsheet.jsx`.

- Reads ALL registered shortcuts from `ShortcutManager.getAll()`
- Shows in a clean 2-column layout: description | key combo (styled `<kbd>` badges)
- Key combos formatted as `Ctrl + T`, `Ctrl + Shift + P`, etc.
- Escape or backdrop click to dismiss
- Live data — always reflects currently registered shortcuts

### Current Shortcuts
| Shortcut | Description |
|---|---|
| `Ctrl+T` | Toggle theme picker |
| `Ctrl+P` | Toggle command palette (commands) |
| `Ctrl+Shift+P` | Open spotlight search |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Open settings |
| `Ctrl+Shift+A` | Toggle always on top |
| `Ctrl+/` | Show keyboard shortcuts |
| `Ctrl+\` | Toggle markdown preview (only on markdown page) |

### ShortcutManager (`src/renderer/src/utils/ShortcutManager.js`)
- Singleton class, global `keydown` listener on `document`
- Priority-based matching (higher priority runs first)
- **Skips plain keystrokes** in inputs/textareas (modifier combos like `Ctrl+B` still work)
- Features: `once`, `throttle`, `debounce`, `enable`/`disable`/`toggle` per shortcut
- `ShortcutsPanel` in Settings shows a live table with per-shortcut enable/disable toggles

## System Tray & Window Management

### Tray
- Tray icon from `resources/icon.png`
- Context menu: **Show** (restore window), **Quit** (full quit)
- Single-click: if visible → focus, if hidden → show and focus
- Always created on app start (`src/main/index.js:createTray()`)

### Minimize-to-Tray
- Setting: General → "Minimize to tray" (switch, default ON)
- When ON: close button hides to tray, clicking tray icon restores
- When OFF: close button closes normally
- `window-close` IPC checks `getMinimizeToTray()` → reads from settings.json each time

### Always-on-Top
- `Ctrl+Shift+A` toggles
- Pin icon in TitleBar when active
- Setting: General → "Always on top" (switch, default OFF)
- Main process: `win.setAlwaysOnTop(pinned)` via `toggle-always-on-top` IPC

### Window Controls
- Show/hide minimize and maximize buttons independently via settings
- Maximize returns window to 700×600 (original size)
- Window is `resizable: false` — user cannot drag edges

## Spotlight Search

Merged into CommandPalette — same component, different mode. See Command Palette section above.

## Quick Actions via CommandPalette

Available in both Commands and Spotlight modes:

| Action | Description |
|---|---|
| Toggle Sidebar | `Ctrl+B` |
| Change Theme | Opens ThemeModal |
| Open Settings | Opens SettingsModal |
| Check for Updates | Triggers update check |
| Always on Top | `Ctrl+Shift+A` |
| Keyboard Shortcuts | Shows cheatsheet |
| Minimize Window | Minimizes to taskbar |
| Close Window | Closes (or hides to tray) |
