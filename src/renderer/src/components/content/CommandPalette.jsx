import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import { getThemeNames } from '../../theme';
import { getAll } from '../../utils/ShortcutManager';

const CommandPalette = ({ 
  isOpen,
  onClose,
  commands = [],
  mode = 'commands',
  spotlightExtras = {},
  placeholder = "Search commands...",
  emptyMessage = "No commands found",
  onSelect,
  className = "",
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Internal mode — toggled by typing/deleting ">" prefix like VS Code
  const [internalMode, setInternalMode] = useState(null);
  const activeMode = internalMode ?? mode;
  const isSpotlight = activeMode === 'spotlight';

  // These are live — recalculated every render so new registrations appear
  const themes = useMemo(() => getThemeNames(), []);
  const shortcuts = useMemo(() => getAll().filter(s => s.description), []);

  // When mode prop changes (e.g. Ctrl+Shift+P pressed while palette open), update
  useEffect(() => { setInternalMode(null); }, [mode]);

  // When typing '>', switch to spotlight and keep '>' visible like VS Code.
  // When deleting '>' in spotlight, switch back to commands.
  const handleChange = (v) => {
    if (!isSpotlight && v.startsWith('>')) {
      setInternalMode('spotlight');
      setSearch(v);
      return;
    }
    if (isSpotlight && !v.startsWith('>')) {
      setInternalMode('commands');
      setSearch(v.replace(/^>\s*/, ''));
      return;
    }
    setSearch(v);
  };

  // Search query: strip leading '> ' when in spotlight
  const query = isSpotlight ? search.replace(/^>\s*/, '') : search;

  // Use refs for live data access inside callbacks to avoid stale closures
  const themesRef = useRef(themes);
  themesRef.current = themes;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const filterResults = useCallback((q) => {
    if (!q.trim()) return [];

    const lower = q.toLowerCase().trim();
    const all = [];

    if (isSpotlight) {
      const filteredCommands = commands
        .filter(c => c.name.toLowerCase().includes(lower) || c.keywords?.some(k => k.includes(lower)))
        .map(c => ({ ...c, kind: 'command', score: score(c.name, c.keywords, lower) }));
      all.push(...filteredCommands);

      const t = themesRef.current;
      all.push(...t
        .filter(t => t.name.toLowerCase().includes(lower))
        .map(t => ({ ...t, kind: 'theme', label: t.name, action: () => spotlightExtras.onOpenTheme?.(t.id), score: 5 })));

      const sc = shortcutsRef.current;
      all.push(...sc
        .filter(s => s.description.toLowerCase().includes(lower))
        .map(s => ({ ...s, kind: 'shortcut', label: s.description, score: 3 })));
    } else {
      const notes = spotlightExtras.notes || [];
      all.push(...notes
      .filter(n => n.toLowerCase().includes(lower))
      .map(n => ({ id: `note-${n}`, kind: 'note', label: n, action: () => spotlightExtras.onOpenNote?.(n), score: 8 })));
    }

    return all.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 12);
  }, [isSpotlight, commands, spotlightExtras]);

  // Last 5 notes as suggestions when palette opens with empty query
  const suggestions = useMemo(() => {
    const notes = spotlightExtras.notes || [];
    return notes.slice(0, 5).map(n => ({
      id: `note-${n}`,
      kind: 'note',
      label: n,
      action: () => spotlightExtras.onOpenNote?.(n),
    }));
  }, [spotlightExtras.notes]);

  // Top commands for spotlight suggestions on empty query
  const spotlightSuggestions = useMemo(() => {
    const top = commands.slice(0, 5).map(c => ({
      ...c,
      kind: 'command',
      label: c.name,
    }));
    return top;
  }, [commands]);

  const score = (name, keywords = [], q) => {
    const combined = `${name.toLowerCase()} ${keywords.join(' ').toLowerCase()}`;
    return combined.includes(q) ? 10 - Math.min(combined.indexOf(q), 9) : 0;
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults(isSpotlight ? spotlightSuggestions : suggestions);
      return;
    }
    setResults(filterResults(query));
    setSelectedIndex(0);
  }, [query, filterResults, isSpotlight, suggestions]);

  useEffect(() => {
    if (isOpen) { setSearch(mode === 'spotlight' ? '> ' : ''); setInternalMode(null); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      // Toggle spotlight with Ctrl+Shift+P while palette is open
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setInternalMode(isSpotlight ? 'commands' : 'spotlight');
        setSearch('');
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => Math.min(p + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => Math.max(p - 1, 0)); }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const r = results[selectedIndex];
        if (r.action) { r.action(); }
        onSelect?.(r);
        onClose();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, results, selectedIndex, onClose, onSelect]);

  useEffect(() => {
    if (listRef.current && results[selectedIndex]) {
      const items = listRef.current.children;
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, results]);

  if (!isOpen) return null;

  const theme = {
    dark: {
      bg: 'bg-zinc-900/95',
      border: 'border-white/10',
      text: 'text-white',
      textMuted: 'text-white/40',
      hover: 'hover:bg-white/[0.04]',
      selected: 'bg-white/[0.08]',
      highlight: 'text-blue-400'
    },
  };
  const style = theme.dark;

  const displayMode = isSpotlight ? 'spotlight' : 'commands';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15%] p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full max-w-lg ${className}`}>
        <div className={`rounded-xl border ${style.border} ${style.bg} shadow-2xl backdrop-blur-xl overflow-hidden`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={isSpotlight ? 'Search anything...' : 'Search notes...'}
              className={`w-full pl-9 pr-3 py-2 text-xs ${style.text} bg-transparent border-b border-white/[0.06] outline-none placeholder:text-white/20 leading-none`}
              spellCheck={false}
              autoComplete="off"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <kbd className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/[0.06] text-white/25 border border-white/[0.06]">Esc</kbd>
            </div>
          </div>

          <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
            {!query.trim() && suggestions.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/20">
                <p className="text-xs">No notes in your vault yet</p>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/20">
                <p className="text-xs">{emptyMessage}</p>
              </div>
            ) : (
              results.map((r, i) => (
                <button
                  key={`${r.kind || 'cmd'}-${r.id || r.key || r.label || r.name}-${i}`}
                  onClick={() => {
                    if (r.action) r.action();
                    onSelect?.(r);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    i === selectedIndex ? style.selected : style.hover
                  }`}
                >
      <span className="text-sm flex-shrink-0 w-6 text-center">
        {r.kind === 'command' ? (r.icon || '⚡') : r.kind === 'theme' ? '🎨' : r.kind === 'shortcut' ? '⌨' : r.kind === 'setting' ? '⚙️' : r.kind === 'note' ? '📄' : (r.icon || '→')}
      </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${style.text} truncate`}>{r.label || r.name}</div>
                    {r.description && <div className={`text-[10px] ${style.textMuted} truncate`}>{r.description}</div>}
                  </div>
                  {r.shortcut && (
                    <span className="text-[10px] text-white/15 flex-shrink-0">{r.shortcut}</span>
                  )}
                  {isSpotlight && r.kind && (
                    <span className="text-[9px] text-white/10 flex-shrink-0 uppercase">{r.kind}</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04]">
            <span className="text-[9px] text-white/15">
              {results.length > 0 ? `${results.length} ${isSpotlight ? 'results' : 'notes'}` : isSpotlight ? 'Search anything' : 'Search your vault notes'}
            </span>
            <span className="text-[9px] text-white/10">↑↓ Enter Esc</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
