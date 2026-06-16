import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { getThemeNames } from '../../theme';
import { getAll } from '../../utils/ShortcutManager';

const SpotlightSearch = ({ isOpen, onClose, commands = [], settings = [], onOpenTheme, onOpenSettings }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  const themes = useMemo(() => getThemeNames(), []);
  const shortcuts = useMemo(() => getAll().filter(s => s.description), []);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const all = [];

    all.push(...commands
      .filter(c => c.name.toLowerCase().includes(q) || c.keywords?.some(k => k.includes(q)))
      .map(c => ({ ...c, kind: 'command' })));

    all.push(...themes
      .filter(t => t.name.toLowerCase().includes(q))
      .map(t => ({ ...t, kind: 'theme', label: t.name })));

    all.push(...shortcuts
      .filter(s => s.description.toLowerCase().includes(q))
      .map(s => ({ ...s, kind: 'shortcut', label: s.description })));

    all.push(...settings
      .filter(s => (s.label || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
      .map(s => ({ ...s, kind: 'setting', label: s.label })));

    return all.slice(0, 12);
  }, [query, commands, themes, shortcuts, settings]);

  useEffect(() => {
    if (isOpen) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) {
        e.preventDefault();
        const r = results[selected];
        if (r.kind === 'command' && r.action) { r.action(); onClose(); }
        if (r.kind === 'theme') { onOpenTheme?.(r.id); onClose(); }
        if (r.kind === 'setting') { onOpenSettings?.(); onClose(); }
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, results, selected, onClose, onOpenTheme, onOpenSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15%]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search anything..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/[0.06] text-white/25 border border-white/[0.06]">Esc</kbd>
        </div>

        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto py-1">
            {results.map((r, i) => (
              <button
                key={`${r.kind}-${r.id || r.key || r.label}-${i}`}
                onClick={() => {
                  if (r.kind === 'command' && r.action) { r.action(); onClose(); }
                  if (r.kind === 'theme') { onOpenTheme?.(r.id); onClose(); }
                  if (r.kind === 'setting') { onOpenSettings?.(); onClose(); }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  i === selected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-sm flex-shrink-0 w-5 text-center">
                  {r.kind === 'command' ? (r.icon || '⚡') : r.kind === 'theme' ? '🎨' : r.kind === 'shortcut' ? '⌨' : '⚙️'}
                </span>
                <span className="text-sm text-white/80 truncate flex-1">{r.label || r.name}</span>
                <span className="text-[10px] text-white/15 flex-shrink-0 uppercase">{r.kind}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04]">
          <span className="text-[9px] text-white/15">{results.length} results</span>
          <span className="text-[9px] text-white/10">↑↓ Enter Esc</span>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
