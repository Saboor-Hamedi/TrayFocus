import React, { useState, useEffect, useRef } from 'react';

const RenameModal = ({ isOpen, onClose, onRename, currentName = '' }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const base = currentName.replace(/\.md$/, '');
      setName(base);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, currentName]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed + '.md' === currentName) return;
    onRename(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[340px] rounded-xl border border-black/10 dark:border-white/[0.08] bg-[#f6f6f7] dark:bg-zinc-900/95 shadow-2xl p-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[13px] font-semibold text-black/80 dark:text-white/80 mb-4">
          Rename Note
        </h2>

        <label className="block text-[10px] text-black/40 dark:text-white/30 mb-1.5 font-medium">
          New name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
          }}
          placeholder="Enter new name"
          spellCheck={false}
          className="w-full px-3 py-2 rounded-lg text-[13px] bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-black/80 dark:text-white/80 placeholder:text-black/20 dark:placeholder:text-white/20 outline-none focus:border-blue-400/50 transition-colors"
        />

        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px] text-black/25 dark:text-white/20">Documents/TrayFocus/</span>
          <span className="text-[10px] font-medium text-black/60 dark:text-white/50">{name.trim() || 'undefined'}.md</span>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[11px] text-black/40 dark:text-white/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={!name.trim() || name.trim() + '.md' === currentName}
            className="px-4 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;
