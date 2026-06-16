// Renderer-side settings manager — communicates with main process via
// window.settingsAPI (exposed by preload) to read/write settings.json
// in AppData/trayfocus/

const defaults = {
  theme: 'zinc',
  autostart: false,
  minimizeToTray: true,
  showMaximize: true,
  alwaysOnTop: false,
  displayName: 'User',
  fontSize: 14,
  compactMode: false,
  animationsEnabled: true,
  checkUpdates: true,
  debugMode: false,
};

let cache = null;

function api() {
  try { return window.settingsAPI } catch { return null }
}

export async function load() {
  if (cache) return { ...cache };
  const a = api();
  if (!a) { cache = { ...defaults }; return { ...cache }; }
  try {
    cache = { ...defaults, ...(await a.load()) };
  } catch {
    cache = { ...defaults };
  }
  return { ...cache };
}

export async function save(partial) {
  cache = { ...(cache || defaults), ...partial };
  const a = api();
  if (!a) return;
  try { await a.save(cache) } catch { /* ignore */ }
}

export async function loadTheme() {
  const s = await load();
  return s.theme || 'zinc';
}

export async function saveTheme(id) {
  await save({ theme: id });
}
