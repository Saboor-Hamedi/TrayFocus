// Renderer-side settings manager — communicates with main process via IPC
// to read/write settings.json in AppData/trayfocus/

const IPC_LOAD = 'settings-load';
const IPC_SAVE = 'settings-save';

const defaults = {
  theme: 'zinc',
  autostart: false,
  minimizeToTray: true,
  displayName: 'User',
  fontSize: 14,
  compactMode: false,
  animationsEnabled: true,
  checkUpdates: true,
  debugMode: false,
};

let cache = null;

function ipc() {
  try { return window.electron.ipcRenderer } catch { return null }
}

export async function load() {
  if (cache) return { ...cache };
  const r = ipc();
  if (!r) return { ...defaults };
  try {
    const data = await r.invoke(IPC_LOAD);
    cache = { ...defaults, ...data };
  } catch {
    cache = { ...defaults };
  }
  return { ...cache };
}

export async function save(partial) {
  cache = { ...(cache || defaults), ...partial };
  const r = ipc();
  if (!r) return;
  try {
    await r.invoke(IPC_SAVE, cache);
  } catch { /* ignore */ }
}

export function get(key) {
  return cache ? cache[key] : defaults[key];
}

export async function loadTheme() {
  const s = await load();
  return s.theme || 'zinc';
}

export async function saveTheme(id) {
  await save({ theme: id });
}
