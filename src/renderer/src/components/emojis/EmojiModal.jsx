import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import { emojis } from './emoji';

const EmojiModal = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return emojis.slice(0, 48);
    return emojis.filter(
      e => e.name.includes(q) || e.tags.some(t => t.includes(q))
    ).slice(0, 48);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[380px] rounded-xl border border-black/10 dark:border-white/[0.08] bg-[#f6f6f7] dark:bg-zinc-900/95 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-black/[0.06] dark:border-white/[0.06]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25 dark:text-white/25" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="w-full pl-9 pr-3 py-2.5 text-[13px] bg-transparent text-black/80 dark:text-white/80 placeholder:text-black/25 dark:placeholder:text-white/25 outline-none"
            spellCheck={false}
          />
        </div>

        <div className="h-[280px] overflow-y-auto p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(127,127,127,0.15) transparent' }}>
          <div className="grid grid-cols-8 gap-0.5">
            {filtered.map((e, i) => (
              <button
                key={e.name + i}
                onClick={() => {
                  onSelect?.(e.emoji);
                  onClose();
                }}
                className="w-full aspect-square flex items-center justify-center text-xl rounded-md hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors select-none"
                title={e.name}
              >
                {e.emoji}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-full text-[11px] text-black/20 dark:text-white/20">
              No emojis found
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 border-t border-black/[0.06] dark:border-white/[0.06]">
          <span className="text-[9px] text-black/20 dark:text-white/20">
            {filtered.length} emojis
          </span>
          <span className="text-[9px] text-black/15 dark:text-white/15">
            click to insert · Esc close
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmojiModal;
