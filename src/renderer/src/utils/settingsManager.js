// Renderer-side settings manager.
// Single source of truth: settings.json in AppData (via IPC).
// No localStorage — all reads/writes go through the main process.

const defaults = {
  theme: 'zinc',
  autostart: false,
  minimizeToTray: true,
  showMaximize: true,
  alwaysOnTop: false,
  accent: 'blue',
  displayName: 'User',
  fontSize: 14,
  cursorStyle: 'bar',
  cursorWidth: 2,
  editorWrapLines: true,
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
let loadPromise = null; // deduplicates concurrent load() calls

export async function load() {
  if (cache) return { ...cache };

  // If a load is already in-flight, wait for it instead of firing a second IPC call
  if (loadPromise) return loadPromise.then(() => ({ ...cache }));

  loadPromise = (async () => {
    try {
      const r = window.electron?.ipcRenderer;
      const disk = r ? await r.invoke('settings-load') : {};
      cache = { ...defaults, ...disk };
    } catch {
      cache = { ...defaults };
    }
    loadPromise = null;
  })();

  await loadPromise;
  return { ...cache };
}

export async function save(partial) {
  // Ensure we have a full base before merging a partial update.
  // This prevents clobbering disk data with bare defaults on early saves.
  if (!cache) await load();

  cache = { ...cache, ...partial };
  try {
    const r = window.electron?.ipcRenderer;
    if (r) await r.invoke('settings-save', cache);
  } catch {}
}

export async function loadTheme() {
  const s = await load();
  return s.theme || 'zinc';
}

export async function saveTheme(id) {
  await save({ theme: id });
}
