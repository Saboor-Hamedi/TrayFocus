import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'

let updateWindow = null

export function initAutoUpdater(win) {
  updateWindow = win

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    updateWindow?.webContents.send('update-status', {
      status: 'available',
      version: info.version,
    })
  })

  autoUpdater.on('update-not-available', () => {
    updateWindow?.webContents.send('update-status', {
      status: 'not-available',
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    updateWindow?.webContents.send('update-status', {
      status: 'downloading',
      percent: Math.round(progress.percent),
    })
  })

  autoUpdater.on('update-downloaded', () => {
    updateWindow?.webContents.send('update-status', {
      status: 'downloaded',
    })
  })

  autoUpdater.on('error', (err) => {
    updateWindow?.webContents.send('update-status', {
      status: 'error',
      message: err?.message || 'Update check failed',
    })
  })
}

ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates().catch(() => {})
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate().catch(() => {})
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})
