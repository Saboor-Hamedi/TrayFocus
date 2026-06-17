// Renderer-side settings manager.
// Uses localStorage for instant cache + IPC invoke for disk persistence.
// Falls back to localStorage if IPC is not available.

const STORAGE_KEY = 'trayfocus-settings';

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

function readLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function writeLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

let cache = null;

export async function load() {
  if (cache) return { ...cache };

  // 1. Try localStorage first (instant, always works)
  const local = readLocal();
  if (Object.keys(local).length > 0) {
    cache = { ...defaults, ...local };
    // 2. Sync from disk in background (more recent on other sessions)
    try { const r = window.electron?.ipcRenderer; if (r) { const disk = await r.invoke('settings-load'); cache = { ...cache, ...disk }; } } catch {}
  } else {
    // 3. No localStorage — try disk
    cache = { ...defaults };
    try { const r = window.electron?.ipcRenderer; if (r) { cache = { ...cache, ...(await r.invoke('settings-load')) }; } } catch {}
  }

  writeLocal(cache);
  return { ...cache };
}

export async function save(partial) {
  cache = { ...(cache || defaults), ...partial };
  writeLocal(cache);
  try { const r = window.electron?.ipcRenderer; if (r) await r.invoke('settings-save', cache) } catch {}
}

export async function loadTheme() {
  const s = await load();
  return s.theme || 'zinc';
}

export async function saveTheme(id) {
  await save({ theme: id });
}
