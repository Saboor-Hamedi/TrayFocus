import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import TitleBar from './components/header/TitleBar';
import ThemeModal from './components/modals/ThemeModal';
import SettingsModal from './components/modals/SettingsModal';
import CommandPalette from './components/content/CommandPalette';
import ShortcutsPanel from './components/settings/ShortcutsPanel';
import AppearancePanel from './components/settings/AppearancePanel';
import AdvancedPanel from './components/settings/AdvancedPanel';
import Sidebar, { SidebarHeader, SidebarItem, SidebarGroup, SidebarDivider } from './components/sidebar/Sidebar.jsx';
import { loadTheme, saveTheme, getTheme, getThemeClass } from './theme';
import { register, startListening, stopListening } from './utils/ShortcutManager';
import pkg from '../../../package.json';

// ============================================================
// Root application component
//
// This is the single React root mounted into index.html#root.
// It owns all top-level state and wires together:
//   1. The custom title bar (minimize / close window)
//   2. The theme system (persisted to localStorage)
//   3. The theme picker modal (Ctrl+T shortcut)
//   4. The command palette (Ctrl+P shortcut)
//   5. The sidebar (Ctrl+B toggle)
//   6. Keyboard shortcut handling (ShortcutManager)
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

  // Currently active theme ID — loaded from localStorage on first render
  const [activeTheme, setActiveTheme] = useState(loadTheme);

  // ---- callbacks ----
  // Select a theme and persist it so it survives app restarts
  const handleSelectTheme = useCallback((id) => {
    setActiveTheme(id);
    saveTheme(id);
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

    return () => {
      unregisterTheme();
      unregisterPalette();
      unregisterSidebar();
      unregisterSettings();
      stopListening();
    };
  }, [toggleThemeModal, toggleCommandPalette, toggleSidebar, toggleSettings]);

  // ---- derived values ----
  // Full theme object (id, name, Tailwind classes) for the active theme
  const theme = getTheme(activeTheme);

  // className string for the root wrapper div (background + text color)
  const themeClass = getThemeClass(activeTheme);

  // Sidebar style derived from active theme — uses neutral white-opacity
  // classes that work with any background, plus the theme's text color
  const sidebarStyle = useMemo(() => ({
    bg: theme.bg,
    border: 'border-white/10',
    text: theme.text,
    textMuted: 'text-white/40',
    hover: 'hover:bg-white/5',
    active: 'bg-white/10 text-white',
    activeBg: 'bg-white/5',
    divider: 'border-white/10',
    scrollbar: 'scrollbar-thumb-zinc-700',
    shadow: 'shadow-2xl',
  }), [theme]);

  return (
    // root wrapper — fills the entire Electron window, flex column layout
    <div className={`flex h-screen w-screen flex-col select-none overflow-hidden transition-colors duration-300 ${themeClass}`}>
      {/* ---- custom title bar (pinned to top, frameless window controls) ---- */}
      <TitleBar
        title="TrayFocus"
        backgroundColor={theme.titlebar}
        textColor={theme.text}
        showMaximize={false}
        onMinimize={() => ipcSend('window-minimize')}
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
        width="w-64"
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
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              }
              label="Home"
              active
              onClick={() => {}}
            />
          </SidebarGroup>

          <SidebarGroup label="Appearance">
            <SidebarItem
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88a1.124 1.124 0 011.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                </svg>
              }
              label="Theme"
              shortcut="Ctrl+T"
              onClick={() => { setIsSidebarOpen(false); setIsThemeModalOpen(true); }}
            />
          </SidebarGroup>
        </div>

        <SidebarDivider />
        <SidebarItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
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
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Settings"
        settings={[
          { key: 'autostart', category: 'general', label: 'Launch at startup', description: 'Start TrayFocus when you log in', type: 'switch', defaultValue: false },
          { key: 'minimizeToTray', category: 'general', label: 'Minimize to tray', description: 'Hide to system tray instead of closing', type: 'switch', defaultValue: true },
          { key: 'displayName', category: 'general', label: 'Display name', description: 'Your display name in the app', type: 'text', defaultValue: 'User', placeholder: 'Enter name' },
        ]}
        categories={[
          { id: 'general', label: 'General', icon: '⚡' },
          { id: 'appearance', label: 'Appearance', icon: '🎨' },
          { id: 'shortcuts', label: 'Shortcuts', icon: '⌨' },
          { id: 'advanced', label: 'Advanced', icon: '🔧' },
        ]}
        customSections={{
          shortcuts: <ShortcutsPanel />,
          appearance: <AppearancePanel />,
          advanced: <AdvancedPanel />,
        }}
        onSave={(values) => console.log('settings saved', values)}
      />
    </div>
  );
}

// memo — only re-render when state changes (not on parent re-renders)
export default memo(App)