import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Settings persistence — exposed directly so the renderer
// can load/save to AppData/trayfocus/settings.json
const settingsAPI = {
  load: () => ipcRenderer.invoke('settings-load'),
  save: (data) => ipcRenderer.invoke('settings-save', data),
}

const filesAPI = {
  save: (filename, content) => ipcRenderer.invoke('file-save', filename, content),
  read: (filename) => ipcRenderer.invoke('file-read', filename),
  list: () => ipcRenderer.invoke('file-list'),
  delete: (filename) => ipcRenderer.invoke('file-delete', filename),
}

const workspaceAPI = {
  load: () => ipcRenderer.invoke('workspace-load'),
  save: (data) => ipcRenderer.invoke('workspace-save', data),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)
    contextBridge.exposeInMainWorld('filesAPI', filesAPI)
    contextBridge.exposeInMainWorld('workspaceAPI', workspaceAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.settingsAPI = settingsAPI
  window.filesAPI = filesAPI
  window.workspaceAPI = workspaceAPI
}
