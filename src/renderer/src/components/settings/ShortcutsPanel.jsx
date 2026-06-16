import React, { useState, useMemo } from 'react';
import { getAll, setEnabled } from '../../utils/ShortcutManager';

// ============================================================
// Shortcuts panel — displays all registered keyboard shortcuts
// in a sortable table. Used as a custom section inside the
// SettingsModal via the customSections prop.
// ============================================================

const MODIFIER_ORDER = ['ctrl', 'shift', 'alt', 'meta'];

const ShortcutsPanel = () => {
  const [refresh, setRefresh] = useState(0);

  const shortcuts = useMemo(() => {
    return getAll()
      .filter((s) => s.description)
      .sort((a, b) => a.description.localeCompare(b.description));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const formatShortcut = (s) => {
    const parts = [];
    MODIFIER_ORDER.forEach((mod) => {
      if (s[mod]) parts.push(mod.charAt(0).toUpperCase() + mod.slice(1));
    });
    parts.push(s.key.toUpperCase());
    return parts.join(' + ');
  };

  const handleToggle = (id) => {
    setEnabled(id, !shortcuts.find((s) => s.id === id)?.enabled);
    setRefresh((r) => r + 1);
  };

  if (shortcuts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p className="text-sm">No shortcuts registered</p>
        <p className="text-xs mt-1">Shortcuts will appear here when registered</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {shortcuts.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/80 truncate">{s.description}</div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <kbd className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/[0.06] text-white/40 border border-white/[0.06]">
              {formatShortcut(s)}
            </kbd>

            <button
              onClick={() => handleToggle(s.id)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                s.enabled ? 'bg-blue-500' : 'bg-white/[0.08]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  s.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortcutsPanel;
