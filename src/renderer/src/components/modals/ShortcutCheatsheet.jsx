import React, { useMemo, useEffect } from 'react';
import { X, Command } from 'lucide-react';
import { getAll } from '../../utils/ShortcutManager';

const modifiers = ['ctrl', 'shift', 'alt', 'meta'];

const formatKeys = (s) => {
  const parts = [];
  modifiers.forEach((m) => { if (s[m]) parts.push(m === 'meta' ? '⌘' : m.charAt(0).toUpperCase() + m.slice(1)); });
  parts.push(s.key.toUpperCase());
  return parts;
};

const MODIFIER_MAP = { ctrl: 'Ctrl', shift: 'Shift', alt: 'Alt', meta: 'Win' };

const ShortcutCheatsheet = ({ isOpen, onClose }) => {
  const shortcuts = useMemo(() =>
    getAll()
      .filter((s) => s.description)
      .sort((a, b) => a.description.localeCompare(b.description)),
  []);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="size-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto px-4 py-2">
          {shortcuts.map((s) => {
            const keys = formatKeys(s);
            return (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                <span className="text-xs text-white/70">{s.description}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {keys.map((k, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-white/20 text-[10px]">+</span>}
                      <kbd className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/[0.06] text-white/50 border border-white/[0.06]">{k}</kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShortcutCheatsheet;
