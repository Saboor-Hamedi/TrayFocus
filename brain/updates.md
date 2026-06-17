# Updates & Publishing

## Auto-Updater (`src/main/updater.js`)

Uses `electron-updater` for automatic app updates via GitHub Releases.

### Configuration
```yaml
# electron-builder.yml
publish:
  provider: github
  owner: Saboor-Hamedi
  repo: TrayFocus
  releaseType: release
```

### Lifecycle
```
initAutoUpdater(mainWindow)                         ← called after createWindow() in main/index.js
  autoUpdater.autoDownload = false                  ← manual download, user clicks to trigger
  autoUpdater.autoInstallOnAppQuit = true           ← install when closing app

Event: 'update-available'
  → sends IPC 'update-status' { status: 'available', version }
  → renderer shows blue badge in TitleBar

Event: 'download-progress'
  → sends IPC 'update-status' { status: 'downloading', percent }
  → renderer shows progress ring + %

Event: 'update-downloaded'
  → sends IPC 'update-status' { status: 'downloaded' }
  → renderer shows green badge + "Restart to Update"

Event: 'update-not-available'
  → sends IPC 'update-status' { status: 'not-available' }
  → renderer shows "Up to date" in dropdown

Event: 'error'
  → sends IPC 'update-status' { status: 'error', message }
```

### IPC Handlers
| Channel | Handler |
|---|---|
| `check-for-updates` | `autoUpdater.checkForUpdates()` |
| `download-update` | `autoUpdater.downloadUpdate()` |
| `install-update` | `autoUpdater.quitAndInstall()` |

### Renderer UI (App.jsx + TitleBar.jsx)
- **Auto-check on startup** if `checkUpdates !== false` in settings
- **Manual check**: click download icon in TitleBar → dropdown → "Check for updates"
- **States**: idle → checking → available → downloading (progress %) → downloaded (restart)
- **Update indicator**: always visible download icon in TitleBar, changes color based on status
- **Settings**: Advanced → "Auto-check updates" toggle

### Dev Mode
- `electron-updater` skips checks in dev mode (not packed)
- `dev-app-update.yml` file in project root forces update checks even in dev
- Contains: `provider: github`, `owner: Saboor-Hamedi`, `repo: TrayFocus`

## Publishing

### Scripts (`package.json`)
```json
"publish:win":   "node -e \"auto-tag + delete existing release\" && npm run build && electron-builder --win --publish always"
"publish:mac":   "npm run build && electron-builder --mac --publish always"
"publish:linux": "npm run build && electron-builder --linux --publish always"
"publish:all":   "npm run build && electron-builder --win --mac --linux --publish always"
```

The publish scripts auto-create a git tag (`v{version}`), push it, delete any existing GitHub release for that version, then build and publish via electron-builder.

### Build Output
- Windows: NSIS installer (`trayfocus-{version}-setup.exe`)
- Block map: `trayfocus-{version}-setup.exe.blockmap` (for differential updates)
- Latest info: `latest.yml` (electron-updater checks this)

### NSIS Installer
```yaml
nsis:
  oneClick: false                        # Wizard-style installation (next next next)
  allowToChangeInstallationDirectory: true
  shortcutName: ${productName}
  createDesktopShortcut: always
```

### Windows Build
```yaml
win:
  icon: build/icon.ico
  executableName: trayfocus
```

## GitHub Releases

After publishing, the release on GitHub contains:
- `trayfocus-{version}-setup.exe` — installer (~100MB)
- `trayfocus-{version}-setup.exe.blockmap` — differential update map
- `latest.yml` — version info for auto-updater

Auto-updater checks `latest.yml` on GitHub to detect new versions. When a new version is found, it downloads only the differential (`.nupkg` files via NSIS), not the full `.exe` — like VS Code updates.

## Icons (`npm run make:icons`)

Generates all required icon formats from `resources/icon.png` (1024×1024 source):
- `build/icon.png` (512×512)
- `build/icon.ico` (multi-size: 16, 32, 64, 128, 256)
- `build/icon.icns` (512×512, macOS)
- `resources/icon.ico` (same multi-size, for tray)

Uses `sharp` (image processing) + `png-to-ico` (ICO conversion). Script at `scripts/make-icons.js`.
