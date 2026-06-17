import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  EditorView, keymap, placeholder, lineNumbers,
  drawSelection, MatchDecorator, ViewPlugin, Decoration,
} from '@codemirror/view';
import { EditorState, EditorSelection, Compartment } from '@codemirror/state';
import { markdown, markdownLanguage, markdownKeymap } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { tags } from '@lezer/highlight';
import { Eye, Code2, GripVertical } from 'lucide-react';
import Markdown from './Markdown';

/* ── Storage helpers ─────────────────────────────────────────── */
const STORAGE_KEY   = 'trayfocus-md-preview';
const STORAGE_SPLIT = 'trayfocus-md-split';
const loadPreview = () => { try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; } };
const savePreview = (v) => { try { localStorage.setItem(STORAGE_KEY, v); } catch {} };
const loadSplit   = () => { try { const v = parseFloat(localStorage.getItem(STORAGE_SPLIT)); return v > 0.1 && v < 0.9 ? v : 0.5; } catch { return 0.5; } };
const saveSplit   = (v) => { try { localStorage.setItem(STORAGE_SPLIT, v); } catch {} };

/* ── Accent color map ────────────────────────────────────────── */
const COLOR_MAP = {
  blue: '#60a5fa', sky: '#38bdf8', cyan: '#22d3ee', teal: '#2dd4bf',
  green: '#4ade80', emerald: '#34d399', lime: '#a3e635', yellow: '#facc15',
  amber: '#fbbf24', orange: '#fb923c', red: '#f87171', rose: '#fb7185',
  pink: '#f472b6', fuchsia: '#e879f9', purple: '#c084fc', violet: '#a78bfa', indigo: '#818cf8',
};
const resolveAccent = (accentColor) => {
  const key = accentColor.replace('text-', '').replace(/-\d+$/, '') || 'blue';
  return COLOR_MAP[key] || '#60a5fa';
};

/* ── Global style for tag/mention decorations ────────────────── */
const STYLE_ID = 'cm-editor-global-css';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `.cm-tag-mention { color: var(--cm-accent, #60a5fa); font-weight: 500; }`;
  document.head.appendChild(el);
}

/* ── Auto-close bracket pairs ────────────────────────────────── */
// Pairs: open → close. When open === close (backtick), check next char first.
const PAIRS = new Map([['(', ')'], ['[', ']'], ['{', '}'], ['`', '`']]);

const autoCloseKeymap = [];
PAIRS.forEach((close, open) => {
  if (open === close) {
    // Self-closing char (backtick): skip-over if already there, else insert pair
    autoCloseKeymap.push({
      key: open,
      run(view) {
        const { state } = view;
        const changes = state.changeByRange((range) => {
          if (range.empty) {
            const next = state.doc.sliceString(range.from, range.from + 1);
            if (next === close) return { range: EditorSelection.cursor(range.from + 1) };
            return {
              changes: { from: range.from, insert: open + close },
              range: EditorSelection.cursor(range.from + 1),
            };
          }
          const text = state.doc.sliceString(range.from, range.to);
          return {
            changes: { from: range.from, to: range.to, insert: open + text + close },
            range: EditorSelection.range(range.from + 1, range.to + 1),
          };
        });
        view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }));
        return true;
      },
    });
  } else {
    // Open: insert pair and place cursor inside
    autoCloseKeymap.push({
      key: open,
      run(view) {
        const { state } = view;
        const changes = state.changeByRange((range) => {
          if (range.empty) {
            return {
              changes: { from: range.from, insert: open + close },
              range: EditorSelection.cursor(range.from + 1),
            };
          }
          const text = state.doc.sliceString(range.from, range.to);
          return {
            changes: { from: range.from, to: range.to, insert: open + text + close },
            range: EditorSelection.range(range.from + 1, range.to + 1),
          };
        });
        view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }));
        return true;
      },
    });
    // Close: skip over if already there
    autoCloseKeymap.push({
      key: close,
      run(view) {
        const { state } = view;
        let skipped = false;
        const changes = state.changeByRange((range) => {
          if (range.empty && state.doc.sliceString(range.from, range.from + 1) === close) {
            skipped = true;
            return { range: EditorSelection.cursor(range.from + 1) };
          }
          return { range };
        });
        if (skipped) { view.dispatch(state.update(changes, { userEvent: 'input.skip' })); return true; }
        return false;
      },
    });
  }
});
// Backspace: delete both chars when cursor is between a pair
autoCloseKeymap.push({
  key: 'Backspace',
  run(view) {
    const { state } = view;
    let deleted = false;
    const changes = state.changeByRange((range) => {
      if (!range.empty) return { range };
      const before = state.doc.sliceString(Math.max(0, range.from - 1), range.from);
      const after  = state.doc.sliceString(range.from, range.from + 1);
      if (before && PAIRS.get(before) === after) {
        deleted = true;
        return {
          changes: { from: range.from - 1, to: range.from + 1 },
          range: EditorSelection.cursor(range.from - 1),
        };
      }
      return { range };
    });
    if (deleted) { view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'delete.backward' })); return true; }
    return false;
  },
});

/* ── Tag / mention MatchDecorator ────────────────────────────── */
const tagMatcher = new MatchDecorator({
  regexp: /(#\w+|@\w+)/g,
  decoration: Decoration.mark({ class: 'cm-tag-mention' }),
});
const tagMentionPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) { this.decos = tagMatcher.createDeco(view); }
    update(upd) {
      if (upd.docChanged || upd.viewportChanged)
        this.decos = tagMatcher.updateDeco(upd, this.decos);
    }
  },
  { decorations: (v) => v.decos },
);

/* ── Markdown syntax highlight style ────────────────────────── */
const mdHighlight = HighlightStyle.define([
  { tag: tags.heading1, color: '#c4b5fd', fontWeight: '700' },
  { tag: tags.heading2, color: '#93c5fd', fontWeight: '700' },
  { tag: tags.heading3, color: '#6ee7b7', fontWeight: '600' },
  { tag: tags.heading4, color: '#fcd34d', fontWeight: '600' },
  { tag: [tags.heading5, tags.heading6], color: '#f9a8d4', fontWeight: '500' },
  { tag: tags.processingInstruction, color: 'rgba(255,255,255,0.22)' },
  { tag: tags.strong,        color: '#f1f5f9', fontWeight: '700' },
  { tag: tags.emphasis,      color: '#cbd5e1', fontStyle: 'italic' },
  { tag: tags.strikethrough, color: '#52525b', textDecoration: 'line-through' },
  { tag: tags.link,          color: '#60a5fa' },
  { tag: tags.url,           color: '#3b82f6' },
  { tag: tags.monospace,     color: '#f472b6' },
  { tag: tags.labelName,     color: '#86efac' },
  { tag: tags.quote,         color: '#94a3b8', fontStyle: 'italic' },
  { tag: tags.list,          color: '#34d399' },
  { tag: tags.contentSeparator, color: '#374151' },
  { tag: tags.escape,        color: '#fbbf24' },
  { tag: tags.character,     color: '#fbbf24' },
]);

/* ── Theme (fontSize + light/dark aware) ─────────────────────── */
const buildTheme = (fs, light = false) => EditorView.theme({
  '&': { fontSize: `${Math.max(fs, 12)}px`, height: '100%', background: 'transparent' },
  '.cm-content': {
    padding: '16px 20px',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
    caretColor: light ? '#2563eb' : '#60a5fa',
    lineHeight: '1.65',
    color: light ? '#24292f' : 'inherit',
  },
  '.cm-activeLine':       { background: light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.025)' },
  '.cm-activeLineGutter': { background: light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)'  },
  '.cm-selectionBackground, ::selection': {
    background: light
      ? 'rgba(37,99,235,0.15) !important'
      : 'rgba(96,165,250,0.22) !important',
  },
  '.cm-gutters': {
    background:  light ? 'rgba(0,0,0,0.035)' : 'rgba(0,0,0,0.18)',
    borderRight: light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.05)',
    color:       light ? 'rgba(0,0,0,0.40)'  : 'rgba(255,255,255,0.28)',
    fontSize:    `${Math.max(fs * 0.78, 9)}px`,
    paddingRight: '4px',
  },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '24px', textAlign: 'right' },
  '.cm-cursor':  { borderLeftColor: light ? '#2563eb' : '#60a5fa' },
  '.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
  '& ::-webkit-scrollbar':       { width: '5px', height: '5px' },
  '& ::-webkit-scrollbar-track': { background: 'transparent' },
  '& ::-webkit-scrollbar-thumb': {
    background: light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.07)',
    borderRadius: '3px',
  },
  '& ::-webkit-scrollbar-thumb:hover': {
    background: light ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.14)',
  },
}, { dark: !light });

/* ── Cursor theme ────────────────────────────────────────────── */
const buildCursorTheme = (style, width) => {
  const styles = {};
  if (style === 'block') {
    styles['.cm-cursor'] = { border: 'none', background: 'rgba(96,165,250,0.45)', width: '0.6em' };
  } else if (style === 'underline') {
    styles['.cm-cursor'] = {
      borderLeftWidth: '0',
      borderBottom: `${Math.max(width, 1)}px solid rgba(96,165,250,0.85)`,
      width: '0.6em',
    };
  } else {
    styles['.cm-cursor'] = { borderLeftWidth: `${Math.max(width, 1)}px`, borderLeftColor: '#60a5fa' };
  }
  return EditorView.theme(styles, { dark: true });
};

/* ── Toggleable extensions ───────────────────────────────────── */
const buildWrapExt     = (wrap) => wrap ? EditorView.lineWrapping : [];
const buildLineNumsExt = (show) => show ? lineNumbers() : [];

/* ═══════════════════════════════════════════════════════════════
   MarkdownEditor component
   ═══════════════════════════════════════════════════════════════ */
const MarkdownEditor = ({
  value           = '',
  onChange,
  readOnly        = false,
  fontSize        = 14,
  fontFamily      = '',
  accentColor     = '',
  cursorStyle     = 'bar',
  cursorWidth     = 2,
  wrapLines       = true,
  showLineNumbers = true,
  isLightTheme    = false,
}) => {
  const editorRef   = useRef(null);
  const viewRef     = useRef(null);
  const compartment        = useRef(new Compartment());
  const cursorCompartment  = useRef(new Compartment());
  const wrapCompartment    = useRef(new Compartment());
  const lineNumCompartment = useRef(new Compartment());

  const [preview,    setPreview]    = useState(loadPreview);
  const [content,   setContent]    = useState(value);
  const [splitRatio, setSplitRatio] = useState(loadSplit);
  const splitRef    = useRef(splitRatio);
  const draggingRef = useRef(false);
  const containerRef = useRef(null);

  const accentHex = resolveAccent(accentColor);

  useEffect(() => { splitRef.current = splitRatio; }, [splitRatio]);

  /* ── Drag-to-resize ──────────────────────────────────────────── */
  const handleMouseDown = useCallback(() => { draggingRef.current = true; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect  = containerRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setSplitRatio(Math.min(0.85, Math.max(0.15, ratio)));
  }, []);
  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    saveSplit(splitRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup',   handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup',   handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const togglePreview = useCallback(() => {
    setPreview((p) => { savePreview(!p); return !p; });
  }, []);

  /* ── Create editor once ──────────────────────────────────────── */
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const updateListener = EditorView.updateListener.of((v) => {
      if (v.docChanged) {
        const text = v.state.doc.toString();
        setContent(text);
        onChange?.(text);
      }
    });

    viewRef.current = new EditorView({
      doc: value,
      extensions: [
        EditorState.readOnly.of(readOnly),
        markdown({ base: markdownLanguage }),
        // Keymaps: auto-close first (highest priority), then markdown list, then indent, then defaults
        keymap.of([...autoCloseKeymap, ...markdownKeymap, indentWithTab, ...defaultKeymap, ...historyKeymap]),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        syntaxHighlighting(mdHighlight),
        tagMentionPlugin,
        placeholder('Write markdown here…'),
        compartment.current.of(buildTheme(fontSize, isLightTheme)),
        cursorCompartment.current.of(buildCursorTheme(cursorStyle, cursorWidth)),
        wrapCompartment.current.of(buildWrapExt(wrapLines)),
        lineNumCompartment.current.of(buildLineNumsExt(showLineNumbers)),
        updateListener,
      ],
      parent: editorRef.current,
    });

    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line

  /* ── Live compartment updates ────────────────────────────────── */
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: compartment.current.reconfigure(buildTheme(fontSize, isLightTheme)) });
  }, [fontSize, isLightTheme]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: cursorCompartment.current.reconfigure(buildCursorTheme(cursorStyle, cursorWidth)) });
  }, [cursorStyle, cursorWidth]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: wrapCompartment.current.reconfigure(buildWrapExt(wrapLines)) });
  }, [wrapLines]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: lineNumCompartment.current.reconfigure(buildLineNumsExt(showLineNumbers)) });
  }, [showLineNumbers]);

  /* ── Ctrl+\ toggles preview ──────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); togglePreview(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePreview]);

  /* ── Sync external value ─────────────────────────────────────── */
  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (value !== current) {
      viewRef.current.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  const editorW  = preview ? `${(splitRatio * 100).toFixed(1)}%` : '100%';
  const previewW = preview ? `${((1 - splitRatio) * 100).toFixed(1)}%` : '0%';

  return (
    <div
      className="flex flex-col h-full border-y border-r border-white/[0.06] rounded-xl overflow-hidden"
      ref={containerRef}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.05] bg-white/[0.02] shrink-0 [app-region:no-drag]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-white/30 tracking-wide">Markdown</span>
          {preview && (
            <span className="text-[9px] text-white/15 border border-white/[0.06] rounded px-1 py-px">split</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="text-[9px] text-white/15 font-mono bg-white/[0.04] px-1 py-px rounded border border-white/[0.06]">
            Ctrl+\
          </kbd>
          <button
            onClick={togglePreview}
            className={`size-6 flex items-center justify-center rounded transition-colors
              ${preview ? 'text-blue-400/70 bg-blue-400/10' : 'text-white/25 hover:text-white/50 hover:bg-white/[0.05]'}`}
            title={preview ? 'Hide preview (Ctrl+\\)' : 'Show preview (Ctrl+\\)'}
          >
            {preview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Editor + optional preview pane */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* CodeMirror — --cm-accent drives tag/mention color */}
        <div
          ref={editorRef}
          className="overflow-auto"
          style={{ width: editorW, fontFamily: fontFamily || undefined, '--cm-accent': accentHex }}
        />

        {preview && (
          <>
            <div
              className="w-[5px] flex-shrink-0 cursor-col-resize flex items-center justify-center group hover:bg-white/[0.04] transition-colors border-x border-white/[0.05]"
              onMouseDown={handleMouseDown}
            >
              <GripVertical className="w-2.5 h-2.5 text-white/10 group-hover:text-white/30 transition-colors" />
            </div>
            <div
              className="overflow-y-auto select-text"
              style={{ width: previewW, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent' }}
            >
              <div className="px-4 py-4">
                {content
                  ? <Markdown content={content} fontSize={fontSize} fontFamily={fontFamily} accentColor={accentColor} />
                  : <p className="text-xs text-white/15 italic">Nothing to preview…</p>
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
