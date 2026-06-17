import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { Palette, Cog, Zap, Keyboard, Wrench, PaintBucket, MessageCircle, Key, FileText, BookOpen } from 'lucide-react';
import TitleBar from './components/header/TitleBar';
import ThemeModal from './components/modals/ThemeModal';
import SettingsModal from './components/modals/SettingsModal';
import CommandPalette from './components/content/CommandPalette';
import ShortcutsPanel from './components/settings/ShortcutsPanel';
import AppearancePanel from './components/settings/AppearancePanel';
import AdvancedPanel from './components/settings/AdvancedPanel';
import AccentPanel from './components/settings/AccentPanel';
import ChatPanel from './components/chat/ChatPanel';
import MarkdownEditor from './components/chat/MarkdownEditor';
import AIPanel from './components/settings/AIPanel';
import ShortcutCheatsheet from './components/modals/ShortcutCheatsheet';
import SaveModal from './components/modals/SaveModal';
import Sidebar, { SidebarHeader, SidebarItem, SidebarGroup, SidebarDivider } from './components/sidebar/Sidebar.jsx';
import RightSidebar from './components/sidebar/right/RightSidebar';
import { getTheme, getThemeClass } from './theme';
import { register, startListening, stopListening } from './utils/ShortcutManager';
import * as settings from './utils/settingsManager';
import pkg from '../../../package.json';

// ============================================================
// Root application component
//
// This is the single React root mounted into index.html#root.
// It owns all top-level state and wires together:
//   1. The custom title bar (minimize / close window)
//   2. The theme system (persisted to AppData/trayfocus/settings.json)
//   3. The theme picker modal (Ctrl+T shortcut)
//   4. The command palette (Ctrl+P shortcut)
//   5. The sidebar (Ctrl+B toggle)
//   6. Settings (persisted to AppData/trayfocus/settings.json)
// ============================================================

// Safe IPC send — wraps window.electron.ipcRenderer in a try/catch
// so the renderer won't crash if the preload script isn't ready
const ipcSend = (channel) => {
  try { window.electron.ipcRenderer.send(channel) } catch { /* ignore */ }
};

function App() {
  // ---- state ----
  // Whether the theme picker modal is open or closed
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Whether the command palette is open or closed
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteMode, setPaletteMode] = useState('commands');

  // Whether the sidebar is open or closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Whether the left document outline sidebar is open or closed
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Current markdown editor content (for RightSidebar stats)
  const [editorContent, setEditorContent] = useState('');

  // Saved filename (null = unsaved, string = filename.md)
  const [currentFilename, setCurrentFilename] = useState(null);

  // Save modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // List of saved notes from the vault
  const [savedNotes, setSavedNotes] = useState([]);

  // Whether the settings modal is open or closed
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Whether the shortcut cheatsheet is open
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);

  // Active content page — will be immediately overwritten by settings.load()
  const [activePage, setActivePage] = useState('chat');

  // Currently active theme ID — loaded from settings.json on mount
  const [activeTheme, setActiveTheme] = useState('zinc');

  // Persistent settings loaded from settings.json
  // These must be declared BEFORE the activePage useEffect that references settingsLoaded.
  const [settingsValues, setSettingsValues] = useState({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  // Sync active page to settings.json when it changes.
  // Guard with settingsLoaded so we never save before load() has completed.
  useEffect(() => {
    if (settingsLoaded) settings.save({ activePage });
  }, [activePage, settingsLoaded]);

  useEffect(() => {
    settings.load().then((data) => {
      setActiveTheme(data.theme || 'zinc');
      setActivePage(data.activePage || 'chat');
      setSettingsValues(data);
      setAlwaysOnTop(data.alwaysOnTop || false);
      if (data.alwaysOnTop) ipcSend('toggle-always-on-top');
      setSettingsLoaded(true);
    });
  }, []);

  // Toggle `dark` class on <html> for Tailwind `dark:` variant.
  // Only the GitHub light theme disables dark mode; every other theme is dark.
  useEffect(() => {
    if (!settingsLoaded) return;
    const isDark = activeTheme !== 'github';
    document.documentElement.classList.toggle('dark', isDark);
  }, [activeTheme, settingsLoaded]);

  // Auto-load last saved file on startup
  useEffect(() => {
    if (!settingsLoaded) return;
    try {
      const lastFile = localStorage.getItem('trayfocus-last-file');
      if (lastFile) {
        window.filesAPI.read(lastFile).then((content) => {
          if (content) {
            setEditorContent(content);
            setCurrentFilename(lastFile);
          }
        });
      }
    } catch {}
    refreshNotes();
  }, [settingsLoaded]);

  // Update status (from main process auto-updater)
  const [updateStatus, setUpdateStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  // Listen for update events from main process
  useEffect(() => {
    try {
      const { ipcRenderer } = window.electron;
      const handler = (_e, status) => setUpdateStatus(status);
      ipcRenderer.on('update-status', handler);
      return () => ipcRenderer.removeListener('update-status', handler);
    } catch { /* noop */ }
  }, []);

  // Check for updates on startup (if enabled)
  useEffect(() => {
    if (settingsLoaded && settingsValues.checkUpdates !== false) {
      ipcSend('check-for-updates');
    }
  }, [settingsLoaded, settingsValues.checkUpdates]);

  const toggleAlwaysOnTop = useCallback(() => {
    try {
      const pinned = window.electron.ipcRenderer.sendSync('toggle-always-on-top');
      setAlwaysOnTop(pinned);
      settings.save({ alwaysOnTop: pinned });
    } catch { /* noop */ }
  }, []);

  // ---- callbacks ----
  // Select a theme and persist it to settings.json
  const handleSelectTheme = useCallback((id) => {
    setActiveTheme(id);
    settings.saveTheme(id);
  }, []);

  // Toggle the theme modal open/closed — used by the Ctrl+T shortcut
  const toggleThemeModal = useCallback(() => {
    setIsThemeModalOpen((prev) => !prev);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const toggleCheatsheet = useCallback(() => {
    setIsCheatsheetOpen((prev) => !prev);
  }, []);

  // Toggle the sidebar — used by the Ctrl+B shortcut
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Toggle the right outline sidebar — used by Ctrl+Shift+B
  const toggleRightSidebar = useCallback(() => {
    setIsRightSidebarOpen((prev) => !prev);
  }, []);

  // Save markdown content
  const doSave = useCallback((name) => {
    try {
      window.filesAPI.save(name, editorContent).then((savedName) => {
        setCurrentFilename(savedName);
        try { localStorage.setItem('trayfocus-last-file', savedName); } catch {}
        refreshNotes();
      });
    } catch {}
  }, [editorContent]);

  const refreshNotes = useCallback(() => {
    try {
      window.filesAPI.list().then((list) => setSavedNotes(list));
    } catch {}
  }, []);

  const loadNote = useCallback((name) => {
    const filename = name + '.md';
    try {
      window.filesAPI.read(filename).then((content) => {
        setEditorContent(content);
        setCurrentFilename(filename);
        try { localStorage.setItem('trayfocus-last-file', filename); } catch {}
        setActivePage('markdown');
      });
    } catch {}
  }, []);

  const handleCtrlS = useCallback(() => {
    if (activePage !== 'markdown') return;
    if (currentFilename) {
      doSave(currentFilename.replace('.md', ''));
    } else {
      setIsSaveModalOpen(true);
    }
  }, [activePage, currentFilename, doSave]);

  const handleNewNote = useCallback(() => {
    setEditorContent('');
    setCurrentFilename(null);
    setActivePage('markdown');
  }, []);

  // Toggle the settings modal — used by the Ctrl+, shortcut
  const toggleSettings = useCallback(() => {
    setIsSettingsModalOpen((prev) => !prev);
  }, []);

  // ---- command palette commands ----
  // These are the actions that appear when the user opens the palette
  const commands = useMemo(() => [
    {
      id: 'nav-chat',
      name: 'Chat',
      icon: '💬',
      description: 'Switch to the Chat page',
      keywords: ['ai', 'assistant', 'gpt'],
      action: () => setActivePage('chat'),
    },
    {
      id: 'nav-markdown',
      name: 'Markdown',
      icon: '📝',
      description: 'Switch to the Markdown editor',
      keywords: ['editor', 'write'],
      action: () => setActivePage('markdown'),
    },
    {
      id: 'settings',
      name: 'Open Settings',
      icon: '⚙️',
      description: 'Configure application settings',
      shortcut: 'Ctrl+,',
      keywords: ['preferences', 'config', 'options'],
      action: () => setIsSettingsModalOpen(true),
    },
    {
      id: 'cheatsheet',
      name: 'Keyboard Shortcuts',
      icon: '⌨',
      description: 'Show all keyboard shortcuts',
      shortcut: 'Ctrl+/',
      keywords: ['hotkeys', 'help', 'reference'],
      action: () => setIsCheatsheetOpen((prev) => !prev),
    },
    {
      id: 'spotlight',
      name: 'Spotlight Search',
      icon: '🔍',
      description: 'Search anything — commands, themes, settings, shortcuts',
      shortcut: 'Ctrl+Space',
      keywords: ['find', 'search', 'global'],
      action: () => setIsSpotlightOpen(true),
    },
    {
      id: 'update',
      name: 'Check for Updates',
      icon: '🔄',
      description: 'Check and install the latest version',
      keywords: ['upgrade', 'version', 'release'],
      action: () => ipcSend('check-for-updates'),
    },
    {
      id: 'sidebar',
      name: 'Toggle Sidebar',
      icon: '📂',
      description: 'Open or close the sidebar panel',
      shortcut: 'Ctrl+B',
      keywords: ['panel', 'nav', 'menu'],
      action: () => setIsSidebarOpen((prev) => !prev),
    },
    {
      id: 'outline',
      name: 'Toggle Outline Panel',
      icon: '📊',
      description: 'Open or close the document outline & stats panel',
      shortcut: 'Ctrl+Shift+B',
      keywords: ['stats', 'tags', 'mentions', 'outline'],
      action: () => setIsRightSidebarOpen((prev) => !prev),
    },
    {
      id: 'minimize',
      name: 'Minimize Window',
      icon: '➖',
      description: 'Minimize to system tray or taskbar',
      shortcut: 'Ctrl+M',
      keywords: ['hide', 'dock'],
      action: () => ipcSend('window-minimize'),
    },
    {
      id: 'pin',
      name: 'Always on Top',
      icon: '📌',
      description: 'Pin the window above all other apps',
      shortcut: 'Ctrl+Shift+A',
      keywords: ['pin', 'float', 'ontop'],
      action: toggleAlwaysOnTop,
    },
    {
      id: 'close',
      name: 'Close Window',
      icon: '✕',
      description: 'Close the application',
      keywords: ['quit', 'exit'],
      action: () => ipcSend('window-close'),
    },
  ], []);

  // ---- keyboard shortcuts ----
  // Start listening for key combos when the component mounts,
  // clean up on unmount to prevent memory leaks / duplicate listeners
  useEffect(() => {
    startListening();

    // Ctrl+T opens/closes the theme picker
    const unregisterTheme = register('t', toggleThemeModal, {
      ctrl: true,
      description: 'Toggle theme picker',
      priority: 10,
    });

    // Ctrl+P opens/closes the command palette
    const unregisterPalette = register('p', () => { setPaletteMode('commands'); setIsCommandPaletteOpen(p => !p); }, {
      ctrl: true,
      description: 'Toggle command palette',
      priority: 10,
    });

    // Ctrl+B toggles the sidebar
    const unregisterSidebar = register('b', toggleSidebar, {
      ctrl: true,
      description: 'Toggle sidebar',
      priority: 10,
    });

    // Ctrl+Shift+B toggles the left outline sidebar
    const unregisterRightSidebar = register('b', toggleRightSidebar, {
      ctrl: true,
      shift: true,
      description: 'Toggle outline panel',
      priority: 10,
    });

    // Ctrl+, opens the settings modal
    const unregisterSettings = register(',', toggleSettings, {
      ctrl: true,
      description: 'Open settings',
      priority: 10,
    });

    // Ctrl+Shift+A toggles always-on-top
    const unregisterPin = register('a', toggleAlwaysOnTop, {
      ctrl: true,
      shift: true,
      description: 'Toggle always on top',
      priority: 10,
    });

    // Ctrl+/ shows keyboard shortcuts cheatsheet
    const unregisterCheatsheet = register('/', toggleCheatsheet, {
      ctrl: true,
      description: 'Show keyboard shortcuts',
      priority: 10,
    });

    // Ctrl+S saves the markdown document
    const unregisterSave = register('s', handleCtrlS, {
      ctrl: true,
      description: 'Save document',
      priority: 10,
    });

    // Ctrl+N creates a new blank note
    const unregisterNewNote = register('n', handleNewNote, {
      ctrl: true,
      description: 'New note',
      priority: 10,
    });

    // Ctrl+Shift+P opens spotlight search
    const unregisterSpotlight = register('p', () => { setPaletteMode('spotlight'); setIsCommandPaletteOpen(true); }, {
      ctrl: true,
      shift: true,
      description: 'Spotlight search',
      priority: 10,
    });

    return () => {
      unregisterTheme();
      unregisterPalette();
      unregisterSidebar();
      unregisterRightSidebar();
      unregisterSave();
      unregisterNewNote();
      unregisterSettings();
      unregisterPin();
      unregisterCheatsheet();
      unregisterSpotlight();
      stopListening();
    };
  }, [toggleThemeModal, toggleCommandPalette, toggleSidebar, toggleRightSidebar, toggleSettings, toggleAlwaysOnTop, toggleCheatsheet, handleCtrlS, handleNewNote]);

  // ---- derived values ----
  // Full theme object (id, name, Tailwind classes) for the active theme
  const theme = getTheme(activeTheme);

  // className string for the root wrapper div (background + text color)
  const themeClass = getThemeClass(activeTheme);
  const accentId = settingsValues.accent || 'blue';
  const accentClass = useMemo(() => `text-${accentId}-400`, [accentId]);

  const settingsStyle = useMemo(() => ({
    bg: 'bg-zinc-900/95',
    border: 'border-zinc-800',
    text: 'text-white',
    textMuted: 'text-zinc-400',
    hover: 'hover:bg-zinc-800/50',
    active: `${accentClass} bg-zinc-800/50`,
    activeBorder: accentClass.replace('text-', 'border-'),
    input: 'bg-zinc-800/50 border-zinc-700 text-white',
    inputFocus: 'border-zinc-500',
    scrollbar: 'scrollbar-thumb-zinc-700',
    shadow: 'shadow-2xl',
  }), [accentClass]);

  const sidebarStyle = useMemo(() => ({
    bg: 'bg-[#f6f6f7] dark:bg-zinc-900/80',
    border: 'border-black/10 dark:border-white/10',
    text: theme.text,
    textMuted: 'text-black/40 dark:text-white/40',
    hover: 'hover:bg-black/5 dark:hover:bg-white/5',
    active: `${accentClass} bg-black/5 dark:bg-white/10`,
    activeBg: 'bg-black/5 dark:bg-white/5',
    divider: 'border-black/10 dark:border-white/10',
    scrollbar: 'scrollbar-thumb-black/10 dark:scrollbar-thumb-zinc-700',
    shadow: 'shadow-2xl',
  }), [theme, accentClass]);

  // Block render until settings are loaded from disk.
  // This prevents the theme-flicker where the app paints with the default
  // theme and then transitions to the saved one once the IPC call resolves.
  if (!settingsLoaded) return null;

  return (
    // root wrapper — fills the entire Electron window, flex column layout
    <div className={`flex h-screen w-screen flex-col select-none overflow-hidden transition-colors duration-300 ${themeClass}`}>
      {/* ---- custom title bar (pinned to top, frameless window controls) ---- */}
      <TitleBar
        title="TrayFocus"
        backgroundColor={theme.titlebar}
        textColor={theme.text}
        titleColor={accentClass}
        showMinimize={settingsValues.minimizeToTray !== false}
        showMaximize={settingsValues.showMaximize !== false}
        pinned={alwaysOnTop}
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        updateStatus={updateStatus}
        appVersion={pkg.version}
        onCheckUpdate={() => ipcSend('check-for-updates')}
        onDownloadUpdate={() => ipcSend('download-update')}
        onInstallUpdate={() => ipcSend('install-update')}
        onMinimize={() => ipcSend('window-minimize')}
        onMaximize={() => ipcSend('window-maximize')}
        onClose={() => ipcSend('window-close')}
      />

      {/* ---- content wrapper — pushed right when sidebar opens (TitleBar stays full width) ---- */}
      <div className={`flex-1 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'pl-56' : 'pl-0'}`}>

      {/* ---- main content area — fills remaining space after title bar ---- */}
      {activePage === 'chat' ? (
        <ChatPanel
          apiKey={settingsValues[settingsValues.aiProvider === 'gemini' ? 'geminiKey' : 'deepseekKey'] || ''}
          providerId={settingsValues.aiProvider || 'deepseek'}
          model={settingsValues.aiModel || 'deepseek-chat'}
          fontSize={settingsValues.fontSize || 14}
          accentColor={accentClass}
        />
      ) : activePage === 'markdown' ? (
        <div className="flex h-full">
          <div className="flex-1 min-w-0 h-full">
            <MarkdownEditor
              value={editorContent}
              onChange={setEditorContent}
              filename={currentFilename}
              fontSize={settingsValues.fontSize || 14}
              cursorStyle={settingsValues.cursorStyle || 'bar'}
              cursorWidth={settingsValues.cursorWidth || 2}
              wrapLines={settingsValues.editorWrapLines ?? true}
              showLineNumbers={settingsValues.editorLineNumbers ?? true}
              isLightTheme={getTheme(activeTheme)?.bg?.includes('#ffffff') || getTheme(activeTheme)?.bg === 'bg-white'}
              accentColor={accentClass}
            />
          </div>
          <RightSidebar
            isOpen={isRightSidebarOpen}
            onClose={() => setIsRightSidebarOpen(false)}
            content={editorContent}
            accentColor={accentClass}
          />
        </div>
      ) : (
      <main className="flex-1" />
      )}
      </div>

      {/* ---- sidebar panel (toggles in from the left) ---- */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        position="left"
        width="w-56"
        collapsible={false}
        theme={sidebarStyle}
        overlay={false}
        closeOnEscape={false}
        closeOnOverlayClick={false}
      >
        <SidebarHeader
          icon={<Zap className="w-4 h-4" strokeWidth={1.5} />}
          title="TrayFocus"
          subtitle={`v${pkg.version}`}
        />

        <div className="flex-1 overflow-y-auto">
          <SidebarGroup label="Main">
            <SidebarItem
              icon={<div className="w-5 h-5 rounded bg-blue-500/15 flex items-center justify-center"><MessageCircle className="w-3 h-3 text-blue-400" strokeWidth={2} /></div>}
              label="AI Chat"
              active={activePage === 'chat'}
              onClick={() => setActivePage('chat')}
            />
            <SidebarItem
              icon={<div className="w-5 h-5 rounded bg-emerald-500/15 flex items-center justify-center"><FileText className="w-3 h-3 text-emerald-400" strokeWidth={2} /></div>}
              label="Markdown Editor"
              active={activePage === 'markdown'}
              onClick={() => setActivePage('markdown')}
            />
          </SidebarGroup>

          {savedNotes.length > 0 && (
            <SidebarGroup label="Notes" collapsible defaultCollapsed={false}>
              {savedNotes.map((note) => {
                const isActive = currentFilename === note + '.md';
                return (
                  <SidebarItem
                    key={note}
                    icon={
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-violet-500/30' : 'bg-violet-500/15'}`}>
                        <BookOpen className={`w-3 h-3 transition-colors ${isActive ? 'text-violet-300' : 'text-violet-400'}`} strokeWidth={2} />
                      </div>
                    }
                    label={note}
                    badge={<span className="text-[9px] text-black/20 dark:text-white/20 font-mono">.md</span>}
                    active={isActive}
                    onClick={() => loadNote(note)}
                  />
                );
              })}
            </SidebarGroup>
          )}

        </div>

        <SidebarDivider />
        <SidebarItem
          icon={<div className="w-5 h-5 rounded bg-amber-500/15 flex items-center justify-center"><Cog className="w-3 h-3 text-amber-400" strokeWidth={2} /></div>}
          label="Settings"
          shortcut="Ctrl+,"
          active={isSettingsModalOpen}
          onClick={() => { setIsSettingsModalOpen(true); }}
        />
      </Sidebar>

      {/* ---- theme picker modal (rendered here so it can cover full screen) ---- */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* ---- command palette (Spotlight-style searchable command picker) ---- */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
        mode={paletteMode}
        placeholder={paletteMode === 'spotlight' ? 'Search anything...' : 'Search commands...'}
        spotlightExtras={{
          onOpenTheme: (id) => { setActiveTheme(id); settings.saveTheme(id); },
          onOpenSettings: () => setIsSettingsModalOpen(true),
        }}
      />

      {/* ---- settings modal ---- */}
      {settingsLoaded && (
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialValues={settingsValues}
        theme={settingsStyle}
        title="Settings"
        settings={[
          { key: 'autostart', category: 'general', label: 'Launch at startup', description: 'Start TrayFocus when you log in', type: 'switch', defaultValue: false },
          { key: 'minimizeToTray', category: 'general', label: 'Minimize to tray', description: 'Hide to system tray instead of closing', type: 'switch', defaultValue: true },
          { key: 'showMaximize', category: 'general', label: 'Show maximize button', description: 'Show the maximize/restore button on the title bar', type: 'switch', defaultValue: true },
          { key: 'alwaysOnTop', category: 'general', label: 'Always on top', description: 'Keep TrayFocus above other windows', type: 'switch', defaultValue: false },
          { key: 'displayName', category: 'general', label: 'Display name', description: 'Your display name in the app', type: 'text', defaultValue: 'User', placeholder: 'Enter name' },
        ]}
        categories={[
          { id: 'general', label: 'General', icon: <Zap className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'appearance', label: 'Appearance', icon: <Palette className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'accent', label: 'Accent', icon: <PaintBucket className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'advanced', label: 'Advanced', icon: <Wrench className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'ai', label: 'AI', icon: <Key className="w-3.5 h-3.5" strokeWidth={1.5} /> },
        ]}
        customSections={{
          shortcuts: <ShortcutsPanel />,
          appearance: <AppearancePanel />,
          accent: <AccentPanel />,
          advanced: <AdvancedPanel />,
          ai: <AIPanel />,
        }}
        onSave={(values) => {
          setSettingsValues(values);
          settings.save(values);
          if (values.alwaysOnTop !== alwaysOnTop) toggleAlwaysOnTop();
        }}
      />
      )}

      <ShortcutCheatsheet
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={doSave}
      />
    </div>
  );
}

// memo — only re-render when state changes (not on parent re-renders)
export default memo(App)