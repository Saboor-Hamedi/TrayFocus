import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs'
import { initAutoUpdater } from './updater'

const settingsPath = () => {
  const dir = app.getPath('userData')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return join(dir, 'settings.json')
}

const docsDir = () => {
  const dir = join(app.getPath('documents'), 'TrayFocus')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

const sanitize = (name) => {
  let clean = name.replace(/[<>:"/\\|?*]/g, '-').trim()
  const dot = clean.lastIndexOf('.')
  if (dot > 0) clean = clean.slice(0, dot)
  return clean + '.md'
}

const loadSettings = () => {
  try { return JSON.parse(fs.readFileSync(settingsPath(), 'utf-8')) } catch { return {} }
}

const saveSettings = (data) => {
  fs.writeFileSync(settingsPath(), JSON.stringify(data, null, 2), 'utf-8')
}

const getMinimizeToTray = () => loadSettings().minimizeToTray !== false

const updateAutoStart = () => {
  const s = loadSettings()
  app.setLoginItemSettings({ openAtLogin: !!s.autostart })
}

ipcMain.handle('settings-load', () => loadSettings())
ipcMain.handle('settings-save', (_e, data) => {
  saveSettings(data)
  updateAutoStart()
})

ipcMain.handle('file-save', (_e, filename, content) => {
  const safeName = sanitize(filename)
  const filePath = join(docsDir(), safeName)
  fs.writeFileSync(filePath, content, 'utf-8')
  return safeName
})

ipcMain.handle('file-read', (_e, filename) => {
  const filePath = join(docsDir(), filename)
  try { return fs.readFileSync(filePath, 'utf-8') } catch { return '' }
})

ipcMain.handle('file-list', () => {
  try {
    return fs.readdirSync(docsDir())
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''))
  } catch { return [] }
})

let mainWindow = null
let tray = null
let isQuitting = false

function createTray() {
  tray = new Tray(nativeImage.createFromPath(icon).resize({ width: 16, height: 16 }))
  tray.setToolTip('TrayFocus')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit() } },
  ]))
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
    resizable: false,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!isQuitting && getMinimizeToTray()) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.on('window-minimize', () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.minimize()
})

ipcMain.on('window-maximize', () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
  }
})

ipcMain.on('window-is-maximized', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) event.returnValue = window.isMaximized()
})

ipcMain.on('window-close', () => {
  if (getMinimizeToTray()) {
    BrowserWindow.getFocusedWindow()?.hide()
  } else {
    BrowserWindow.getFocusedWindow()?.close()
  }
})

ipcMain.on('toggle-always-on-top', (event) => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    const pinned = !win.isAlwaysOnTop()
    win.setAlwaysOnTop(pinned)
    event.returnValue = pinned
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  createTray()
  initAutoUpdater(mainWindow)
  updateAutoStart()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => { isQuitting = true })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})