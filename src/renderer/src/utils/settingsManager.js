// Renderer-side settings manager — communicates with main process via
// window.electron.ipcRenderer to read/write settings.json in AppData/trayfocus/

const defaults = {
  theme: 'zinc',
  autostart: false,
  minimizeToTray: true,
  showMaximize: true,
  alwaysOnTop: false,
  accent: 'blue',
  displayName: 'User',
  fontSize: 14,
  compactMode: false,
  animationsEnabled: true,
  checkUpdates: true,
  debugMode: false,
  deepseekKey: '',
  geminiKey: '',
  aiProvider: 'deepseek',
  aiModel: 'deepseek-chat',
  activePage: 'chat',
};

let cache = null;

function ipc() {
  try { return window.electron.ipcRenderer } catch { return null }
}

export async function load() {
  if (cache) return { ...cache };
  const r = ipc();
  if (!r) { cache = { ...defaults }; return { ...cache }; }
  try {
    cache = { ...defaults, ...(await r.invoke('settings-load')) };
  } catch {
    cache = { ...defaults };
  }
  return { ...cache };
}

export async function save(partial) {
  cache = { ...(cache || defaults), ...partial };
  const r = ipc();
  if (!r) return;
  try { await r.invoke('settings-save', cache) } catch { /* ignore */ }
}

export async function loadTheme() {
  const s = await load();
  return s.theme || 'zinc';
}

export async function saveTheme(id) {
  await save({ theme: id });
}
