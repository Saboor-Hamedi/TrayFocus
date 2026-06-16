import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { House, Palette, Cog, Zap, Keyboard, Wrench } from 'lucide-react';
import TitleBar from './components/header/TitleBar';
import ThemeModal from './components/modals/ThemeModal';
import SettingsModal from './components/modals/SettingsModal';
import CommandPalette from './components/content/CommandPalette';
import ShortcutsPanel from './components/settings/ShortcutsPanel';
import AppearancePanel from './components/settings/AppearancePanel';
import AdvancedPanel from './components/settings/AdvancedPanel';
import Sidebar, { SidebarHeader, SidebarItem, SidebarGroup, SidebarDivider } from './components/sidebar/Sidebar.jsx';
import { getTheme, getThemeClass, getAccentClass } from './theme';
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

  // Whether the sidebar is open or closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Whether the settings modal is open or closed
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Currently active theme ID — loaded from settings.json on mount
  const [activeTheme, setActiveTheme] = useState('zinc');

  // Persistent settings loaded from settings.json
  const [settingsValues, setSettingsValues] = useState({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  useEffect(() => {
    settings.load().then((data) => {
      setActiveTheme(data.theme || 'zinc');
      setSettingsValues(data);
      setAlwaysOnTop(data.alwaysOnTop || false);
      if (data.alwaysOnTop) ipcSend('toggle-always-on-top');
      setSettingsLoaded(true);
    });
  }, []);

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

  // Toggle the command palette — used by the Ctrl+P shortcut
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  // Toggle the sidebar — used by the Ctrl+B shortcut
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Toggle the settings modal — used by the Ctrl+, shortcut
  const toggleSettings = useCallback(() => {
    setIsSettingsModalOpen((prev) => !prev);
  }, []);

  // ---- command palette commands ----
  // These are the actions that appear when the user opens the palette
  const commands = useMemo(() => [
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
      id: 'sidebar',
      name: 'Toggle Sidebar',
      icon: '📂',
      description: 'Open or close the sidebar panel',
      shortcut: 'Ctrl+B',
      keywords: ['panel', 'nav', 'menu'],
      action: () => setIsSidebarOpen((prev) => !prev),
    },
    {
      id: 'theme',
      name: 'Change Theme',
      icon: '🎨',
      description: 'Pick a color theme for the app',
      shortcut: 'Ctrl+T',
      keywords: ['color', 'appearance', 'dark', 'light'],
      action: () => setIsThemeModalOpen(true),
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
      shortcut: 'Ctrl+Shift+P',
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
    const unregisterPalette = register('p', toggleCommandPalette, {
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

    // Ctrl+, opens the settings modal
    const unregisterSettings = register(',', toggleSettings, {
      ctrl: true,
      description: 'Open settings',
      priority: 10,
    });

    // Ctrl+Shift+P toggles always-on-top
    const unregisterPin = register('p', toggleAlwaysOnTop, {
      ctrl: true,
      shift: true,
      description: 'Toggle always on top',
      priority: 10,
    });

    return () => {
      unregisterTheme();
      unregisterPalette();
      unregisterSidebar();
      unregisterSettings();
      unregisterPin();
      stopListening();
    };
  }, [toggleThemeModal, toggleCommandPalette, toggleSidebar, toggleSettings, toggleAlwaysOnTop]);

  // ---- derived values ----
  // Full theme object (id, name, Tailwind classes) for the active theme
  const theme = getTheme(activeTheme);

  // className string for the root wrapper div (background + text color)
  const themeClass = getThemeClass(activeTheme);
  const accentClass = useMemo(() => getAccentClass(activeTheme), [activeTheme]);

  const settingsStyle = useMemo(() => ({
    bg: 'bg-zinc-900/95',
    border: 'border-zinc-800',
    text: 'text-white',
    textMuted: 'text-zinc-400',
    hover: 'hover:bg-zinc-800/50',
    active: `${accentClass} bg-zinc-800/50`,
    input: 'bg-zinc-800/50 border-zinc-700 text-white',
    inputFocus: 'border-zinc-500',
    scrollbar: 'scrollbar-thumb-zinc-700',
    shadow: 'shadow-2xl',
  }), [accentClass]);

  const sidebarStyle = useMemo(() => ({
    bg: theme.bg,
    border: 'border-white/10',
    text: theme.text,
    textMuted: 'text-white/40',
    hover: 'hover:bg-white/5',
    active: `${accentClass} bg-white/10`,
    activeBg: 'bg-white/5',
    divider: 'border-white/10',
    scrollbar: 'scrollbar-thumb-zinc-700',
    shadow: 'shadow-2xl',
  }), [theme, accentClass]);

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
        onMinimize={() => ipcSend('window-minimize')}
        onMaximize={() => ipcSend('window-maximize')}
        onClose={() => ipcSend('window-close')}
      />

      {/* ---- main content area — fills remaining space after title bar ---- */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] opacity-25">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">Ctrl+B</kbd> Sidebar &nbsp;
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">Ctrl+T</kbd> Theme &nbsp;
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px]">Ctrl+P</kbd> Commands
          </p>
        </div>
      </main>

      {/* ---- sidebar panel (toggles in from the left) ---- */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        position="left"
        width="w-56"
        collapsible={false}
        theme={sidebarStyle}
      >
        <SidebarHeader
          title="TrayFocus"
          subtitle={`v${pkg.version}`}
          showCollapse={false}
          showClose={true}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 overflow-y-auto">
          <SidebarGroup label="Main">
            <SidebarItem
              icon={<House className="w-4 h-4" strokeWidth={1.5} />}
              label="Home"
              active
              onClick={() => {}}
            />
          </SidebarGroup>

          <SidebarGroup label="Appearance">
            <SidebarItem
              icon={<Palette className="w-4 h-4" strokeWidth={1.5} />}
              label="Theme"
              shortcut="Ctrl+T"
              onClick={() => { setIsSidebarOpen(false); setIsThemeModalOpen(true); }}
            />
          </SidebarGroup>
        </div>

        <SidebarDivider />
        <SidebarItem
          icon={<Cog className="w-4 h-4" strokeWidth={1.5} />}
          label="Settings"
          onClick={() => { setIsSidebarOpen(false); setIsSettingsModalOpen(true); }}
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
        theme="dark"
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
          { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} /> },
          { id: 'advanced', label: 'Advanced', icon: <Wrench className="w-3.5 h-3.5" strokeWidth={1.5} /> },
        ]}
        customSections={{
          shortcuts: <ShortcutsPanel />,
          appearance: <AppearancePanel />,
          advanced: <AdvancedPanel />,
        }}
        onSave={(values) => {
          setSettingsValues(values);
          settings.save(values);
          if (values.alwaysOnTop !== alwaysOnTop) toggleAlwaysOnTop();
        }}
      />
      )}
    </div>
  );
}

// memo — only re-render when state changes (not on parent re-renders)
export default memo(App)