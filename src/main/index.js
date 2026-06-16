import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

const settingsPath = () => {
  const dir = join(app.getPath('userData'), 'trayfocus')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return join(dir, 'settings.json')
}

const loadSettings = () => {
  try { return JSON.parse(fs.readFileSync(settingsPath(), 'utf-8')) } catch { return {} }
}

const saveSettings = (data) => {
  fs.writeFileSync(settingsPath(), JSON.stringify(data, null, 2), 'utf-8')
}

ipcMain.handle('settings-load', () => loadSettings())
ipcMain.handle('settings-save', (_e, data) => saveSettings(data))

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 600,
  resizable: false,
    show: false,
    frame: false, // Hide native window frame 
    titleBarStyle: 'hidden', // For macOS
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// FIXED: Stop minimizing the window (typo fixed)
ipcMain.on('window-minimize', () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.minimize()
})

// FIXED: Maximize or unmaximize the window (typo fixed: 'widow-maximize' -> 'window-maximize')
ipcMain.on('window-maximize', () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
  }
})

// Optional: Send window state to renderer
ipcMain.on('window-is-maximized', (event) => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    event.returnValue = window.isMaximized()
  }
})

// FIXED: Close the window (typo fixed: 'window-clow' -> 'window-close')
ipcMain.on('window-close', () => {
  const window = BrowserWindow.getFocusedWindow()
  if (window) window.close()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// REMOVED DUPLICATE: You had this twice, removing the second one
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.