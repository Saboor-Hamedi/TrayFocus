import React, { useState, useEffect, useRef, memo } from 'react';
import { Search } from 'lucide-react';

// ============================================================
// Command palette — a Spotlight / VS Code style searchable
// command picker. Opened via Ctrl+P from App.jsx.
//
// Props:
//   isOpen        - controlled visibility from parent
//   onClose       - called on Escape / backdrop click / select
//   commands      - array of { id, name, icon?, description?, shortcut?, keywords?, action }
//   onSelect      - optional callback after a command is executed
//   placeholder   - search input placeholder
//   emptyMessage  - shown when no results match
//   theme         - "dark" | "light"
// ============================================================

const CommandPalette = memo(({ 
  isOpen,
  onClose,
  commands = [],
  placeholder = "Search commands...",
  emptyMessage = "No commands found",
  onSelect,
  className = "",
  theme = "dark"
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter commands based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCommands(commands);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = commands
      .map(cmd => ({
        ...cmd,
        score: calculateScore(cmd, searchLower)
      }))
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [search, commands]);

  // Calculate relevance score
  const calculateScore = (cmd, search) => {
    const name = cmd.name.toLowerCase();
    const keywords = (cmd.keywords || []).join(' ').toLowerCase();
    const combined = `${name} ${keywords}`;

    if (combined.includes(search)) {
      return 10 - Math.min(combined.indexOf(search), 9);
    }
    return 0;
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.children;
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (command) => {
    if (command.action) {
      command.action();
    }
    if (onSelect) {
      onSelect(command);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Theme styles
  const themes = {
    dark: {
      bg: 'bg-zinc-900/95',
      border: 'border-zinc-800',
      input: 'bg-zinc-800/50 border-zinc-700',
      text: 'text-white',
      textMuted: 'text-zinc-400',
      hover: 'hover:bg-zinc-800/50',
      selected: 'bg-blue-500/20',
      highlight: 'text-blue-400'
    },
    light: {
      bg: 'bg-white/95',
      border: 'border-gray-200',
      input: 'bg-gray-50 border-gray-200',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      hover: 'hover:bg-gray-50',
      selected: 'bg-blue-50',
      highlight: 'text-blue-600'
    }
  };

  const style = themes[theme] || themes.dark;

  return (
    <>
      {/* Backdrop + palette — centered like ThemeModal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15%] p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={onClose}
        />

        {/* Command Palette */}
        <div className={`relative w-full max-w-lg animate-in slide-in-from-top-5 duration-200 ${className}`}>
        <div className={`rounded-lg border ${style.border} ${style.bg} shadow-2xl overflow-hidden`}>
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className={`w-4 h-4 ${style.textMuted}`} strokeWidth={2} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className={`w-full pl-10 pr-3 py-2.5 text-xs ${style.text} bg-transparent border-b ${style.border} outline-none transition-colors`}
              spellCheck={false}
              autoComplete="off"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <kbd className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${style.border} ${style.textMuted} bg-opacity-50`}>
                ESC
              </kbd>
            </div>
          </div>

          {/* Command List */}
          <div 
            ref={listRef}
            className="max-h-64 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
          >
            {filteredCommands.length === 0 ? (
              <div className={`px-4 py-6 text-center ${style.textMuted}`}>
                <p className="text-xs">{emptyMessage}</p>
                {search && (
                  <p className="text-[10px] mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-0.5 px-1.5">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id || index}
                    onClick={() => handleSelect(command)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-all duration-150 ${
                      index === selectedIndex
                        ? `${style.selected} ${style.text} ring-1 ring-blue-500/20`
                        : `${style.text} ${style.hover}`
                    }`}
                  >
                    {/* Icon */}
                    {command.icon && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center">
                        {typeof command.icon === 'string' ? (
                          <span className="text-base">{command.icon}</span>
                        ) : (
                          command.icon
                        )}
                      </div>
                    )}

                    {/* Name & Description */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">
                        {command.highlight ? (
                          <HighlightText 
                            text={command.name} 
                            highlight={search} 
                            className={style.highlight}
                          />
                        ) : (
                          command.name
                        )}
                      </div>
                      {command.description && (
                        <div className={`text-[10px] ${style.textMuted} truncate`}>
                          {command.description}
                        </div>
                      )}
                    </div>

                    {/* Shortcut */}
                    {command.shortcut && (
                      <div className="flex-shrink-0 flex gap-1">
                        {command.shortcut.split('+').map((key, i) => (
                          <kbd key={i} className={`px-1 py-0.5 text-[9px] font-medium rounded ${style.border} ${style.textMuted} bg-opacity-50`}>
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between px-3 py-1.5 border-t ${style.border} ${style.textMuted}`}>
            <div className="flex items-center gap-3 text-[9px]">
              <span>
                <kbd className={`px-1.5 py-0.5 rounded ${style.border}`}>↑↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span>
                <kbd className={`px-1.5 py-0.5 rounded ${style.border}`}>Enter</kbd>
                <span className="ml-1">Select</span>
              </span>
              <span>
                <kbd className={`px-1.5 py-0.5 rounded ${style.border}`}>Esc</kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>
            <span className="text-[9px] opacity-50">
              {filteredCommands.length} results
            </span>
          </div>
        </div>
        </div>
      </div>
    </>
  );
});

// Highlight text component
const HighlightText = memo(({ text, highlight, className = '' }) => {
  if (!highlight.trim()) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className={className}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
});

export default CommandPalette;