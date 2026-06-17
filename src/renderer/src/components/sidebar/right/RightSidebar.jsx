import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, Hash, Type, AlignJustify, Tag, Columns2 } from 'lucide-react';
import RightHeader from './RightHeader';

/* ── Accent color resolution ─────────────────────────────────── */
const COLOR_MAP = {
  blue: '#60a5fa', sky: '#38bdf8', cyan: '#22d3ee', teal: '#2dd4bf',
  green: '#4ade80', emerald: '#34d399', lime: '#a3e635', yellow: '#facc15',
  amber: '#fbbf24', orange: '#fb923c', red: '#f87171', rose: '#fb7185',
  pink: '#f472b6', fuchsia: '#e879f9', purple: '#c084fc', violet: '#a78bfa', indigo: '#818cf8',
};
const resolveAccent = (a) => COLOR_MAP[a.replace('text-', '').replace(/-\d+$/, '')] || '#60a5fa';

/* ── Width persistence ───────────────────────────────────────── */
const W_KEY  = 'trayfocus-right-panel-w';
const loadW  = () => { try { const v = parseInt(localStorage.getItem(W_KEY), 10); return v > 140 && v < 520 ? v : 240; } catch { return 240; } };
const saveW  = (v) => { try { localStorage.setItem(W_KEY, String(v)); } catch {} };

/* ── Document stats parser ───────────────────────────────────── */
const computeStats = (content) => {
  if (!content) {
    return { chars: 0, words: 0, lines: 1, maxCol: 0, tags: [], mentions: [] };
  }
  const lines    = content.split('\n');
  const words    = (content.match(/\S+/g) ?? []).length;
  const chars    = content.length;
  const maxCol   = Math.max(...lines.map((l) => l.length));

  // Extract #tags and @mentions (skip inside code fences)
  const tagCount     = {};
  const mentionCount = {};
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const [, t] of line.matchAll(/(^|[\s,;!?(])#(\w[\w-]*)/g))  tagCount[t]     = (tagCount[t]     || 0) + 1;
    for (const [, m] of line.matchAll(/(^|[\s,;!?(])@(\w[\w.-]*)/g)) mentionCount[m] = (mentionCount[m] || 0) + 1;
  }

  const tags     = Object.entries(tagCount).sort(([, a], [, b]) => b - a);
  const mentions = Object.entries(mentionCount).sort(([, a], [, b]) => b - a);

  return { chars, words, lines: lines.length, maxCol, tags, mentions };
};

/* ── Section label ───────────────────────────────────────────── */
const Section = ({ label }) => (
  <div className="px-4 pt-3 pb-0.5">
    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-black/25 dark:text-white/20 select-none">
      {label}
    </span>
  </div>
);

/* ── A single row item (icon + name + count) ─────────────────── */
const Row = ({ icon: Icon, name, count, accentHex }) => (
  <div className="flex items-center gap-2 rounded-md px-3 py-[5px] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors mx-1 select-text">
    <Icon className="h-3 w-3 shrink-0 text-black/25 dark:text-white/20" strokeWidth={1.5} />
    <span className="flex-1 truncate text-[11px] text-black/65 dark:text-white/55 font-medium">{name}</span>
    <span
      className="text-[11px] font-semibold tabular-nums shrink-0"
      style={{ color: accentHex }}
    >
      {count}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   RightSidebar — Document outline & stats panel
   ─────────────────────────────────────────────────────────────
   • Positioned on the RIGHT side of the editor
   • Resizable via drag handle on the LEFT edge
   • Toggle: Ctrl+Shift+B (registered in App.jsx)
   • Shows #tags and @mentions extracted from content
   • 2-row × 3-col stats grid in footer
   ═══════════════════════════════════════════════════════════════ */
const RightSidebar = ({ isOpen, onClose, content = '', accentColor = '' }) => {
  const [width, setWidth]   = useState(loadW);
  const widthRef            = useRef(width);
  const dragging            = useRef(false);
  const startX              = useRef(0);
  const startW              = useRef(0);

  useEffect(() => { widthRef.current = width; }, [width]);

  const accentHex = resolveAccent(accentColor);
  const stats     = useMemo(() => computeStats(content), [content]);

  /* Resize drag handlers — handle is on the LEFT edge of the panel.
     Dragging left  → increases width
     Dragging right → decreases width */
  const onDragStart = useCallback((e) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = widthRef.current;
    e.preventDefault();
  }, []);

  const onDragMove = useCallback((e) => {
    if (!dragging.current) return;
    const next = Math.min(520, Math.max(160, startW.current + (startX.current - e.clientX)));
    setWidth(next);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    saveW(widthRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup',   onDragEnd);
    return () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup',   onDragEnd);
    };
  }, [onDragMove, onDragEnd]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Resize handle (LEFT edge, since panel is on the right) ── */}
      <div
        className="group relative w-[5px] shrink-0 cursor-col-resize transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border-l border-black/[0.06] dark:border-white/[0.06]"
        onMouseDown={onDragStart}
      >
        <div className="absolute inset-y-0 left-[2px] w-px bg-transparent group-hover:bg-black/[0.12] dark:group-hover:bg-white/[0.15] transition-colors" />
      </div>

      {/* ── Panel ───────────────────────────────────────────── */}
      <div
        className="flex h-full flex-col shrink-0 overflow-hidden bg-[#f6f6f7] dark:bg-zinc-900/80 border-l border-black/[0.08] dark:border-white/[0.06]"
        style={{ width }}
      >
        <RightHeader onClose={onClose} />

        {/* ── Stats table ────────────────────────────────────────── */}
        <div className="shrink-0 px-2 pt-[10px] pb-1">
          <div className="flex flex-col gap-[1px]">
            {[
              { label: 'Characters', value: stats.chars,              icon: Type,          color: '#60a5fa' },
              { label: 'Words',      value: stats.words,              icon: AlignJustify,  color: '#34d399' },
              { label: 'Lines',      value: stats.lines,              icon: Hash,          color: '#fbbf24' },
              { label: 'Tags',       value: stats.tags.length,        icon: Tag,           color: '#f472b6' },
              { label: 'Mentions',   value: stats.mentions.length,    icon: AtSign,        color: '#a78bfa' },
              { label: 'Max column', value: stats.maxCol,             icon: Columns2,      color: '#fb923c' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-md px-2 py-1 select-text cursor-default
                  hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-2.5 h-2.5" style={{ color }} strokeWidth={2} />
                </div>
                <span className="flex-1 text-[10px] text-black/50 dark:text-white/35 font-medium">{label}</span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
                  {value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 py-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(127,127,127,0.12) transparent' }}
        >
          {/* Tags */}
          {stats.tags.length > 0 && (
            <>
              <Section label="Tags" />
              {stats.tags.map(([tag, count]) => (
                <Row key={tag} icon={Hash} name={tag} count={count} accentHex={accentHex} />
              ))}
            </>
          )}

          {/* Mentions */}
          {stats.mentions.length > 0 && (
            <>
              <Section label="Mentions" />
              {stats.mentions.map(([mention, count]) => (
                <Row key={mention} icon={AtSign} name={mention} count={count} accentHex={accentHex} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
