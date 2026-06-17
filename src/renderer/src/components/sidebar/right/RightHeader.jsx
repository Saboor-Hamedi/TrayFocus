import React from 'react';
import { BarChart3, X } from 'lucide-react';

/* ── RightHeader ─────────────────────────────────────────────────
   Matches the editor toolbar appearance exactly.
   ─────────────────────────────────────────────────────────────── */
const RightHeader = ({ onClose }) => (
  <div className="flex shrink-0 items-center justify-between border-b border-black/10 dark:border-white/[0.05] px-3.5 py-1.5 bg-black/[0.02] dark:bg-white/[0.02]">
    <div className="flex items-center gap-2">
      <BarChart3 className="h-3 w-3 text-black/30 dark:text-white/30" strokeWidth={1.5} />
      <span className="select-none text-[10px] font-medium text-black/40 dark:text-white/30 tracking-wide">
        Outline
      </span>
    </div>
    <button
      onClick={onClose}
      className="flex h-5 w-5 items-center justify-center rounded text-black/25 dark:text-white/20 transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-black/50 dark:hover:text-white/50"
      title="Close panel (Ctrl+Shift+B)"
    >
      <X className="h-3 w-3" strokeWidth={2} />
    </button>
  </div>
);

export default RightHeader;
