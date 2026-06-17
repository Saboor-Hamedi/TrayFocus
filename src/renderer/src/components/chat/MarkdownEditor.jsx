import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, keymap, placeholder, lineNumbers, drawSelection } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown, markdownLanguage, markdownKeymap } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { Eye, Code2, GripVertical } from 'lucide-react';
import Markdown from './Markdown';

const STORAGE_KEY   = 'trayfocus-md-preview';
const STORAGE_SPLIT = 'trayfocus-md-split';

const loadPreview = () => { try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; } };
const savePreview = (v) => { try { localStorage.setItem(STORAGE_KEY, v); } catch {} };
const loadSplit   = () => { try { const v = parseFloat(localStorage.getItem(STORAGE_SPLIT)); return v > 0.1 && v < 0.9 ? v : 0.5; } catch { return 0.5; } };
const saveSplit   = (v) => { try { localStorage.setItem(STORAGE_SPLIT, v); } catch {} };

/* ── Build a CodeMirror theme from the current fontSize ──────── */
const buildTheme = (fs) => EditorView.theme({
  '&': {
    fontSize: `${Math.max(fs, 12)}px`,
    height: '100%',
    background: 'transparent',
  },
  '.cm-content': {
    padding: '16px',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
    caretColor: '#60a5fa',
    lineHeight: '1.65',
  },
  '.cm-activeLine': { background: 'rgba(255,255,255,0.025)' },
  '.cm-activeLineGutter': { background: 'rgba(255,255,255,0.02)' },
  '.cm-selectionBackground, ::selection': { background: 'rgba(96,165,250,0.22) !important' },
  '.cm-gutters': {
    background: 'rgba(255,255,255,0.015)',
    border: 'none',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.18)',
    fontSize: `${Math.max(fs * 0.78, 9)}px`,
    paddingRight: '8px',
  },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '32px', textAlign: 'right' },
  '.cm-cursor': { borderLeftColor: '#60a5fa', borderLeftWidth: '2px' },
  '.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
  '& ::-webkit-scrollbar': { width: '5px', height: '5px' },
  '& ::-webkit-scrollbar-track': { background: 'transparent' },
  '& ::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.07)', borderRadius: '3px' },
  '& ::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.14)' },
}, { dark: true });

/* Build cursor style extension from settings */
const buildCursorTheme = (style, width) => {
  const styles = {};
  if (style === 'block') {
    styles['.cm-cursor'] = {
      borderLeftWidth: '0.6em',
      borderLeftColor: 'rgba(96,165,250,0.75)',
      background: 'transparent',
      marginLeft: '-0.3em',
    };
  } else if (style === 'underline') {
    styles['.cm-cursor'] = {
      borderLeftWidth: '0',
      borderBottom: `${Math.max(width, 1)}px solid rgba(96,165,250,0.85)`,
      width: '0.6em',
      top: 'auto',
    };
  } else {
    // bar (default)
    styles['.cm-cursor'] = {
      borderLeftWidth: `${Math.max(width, 1)}px`,
      borderLeftColor: '#60a5fa',
    };
  }
  return EditorView.theme(styles, { dark: true });
};

/* ── MarkdownEditor ──────────────────────────────────────────── */
const MarkdownEditor = ({ value = '', onChange, readOnly = false, fontSize = 14, fontFamily = '', accentColor = '', cursorStyle = 'bar', cursorWidth = 2 }) => {
  const editorRef   = useRef(null);
  const viewRef     = useRef(null);
  const compartment = useRef(new Compartment()); // for dynamic fontSize updates
  const cursorCompartment = useRef(new Compartment()); // for dynamic cursor updates
  const [preview, setPreview]     = useState(loadPreview);
  const [content, setContent]     = useState(value);
  const [splitRatio, setSplitRatio] = useState(loadSplit);
  const splitRef    = useRef(splitRatio);
  const draggingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => { splitRef.current = splitRatio; }, [splitRatio]);

  /* Drag-to-resize */
  const handleMouseDown = useCallback(() => { draggingRef.current = true; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const togglePreview = useCallback(() => {
    setPreview((p) => { savePreview(!p); return !p; });
  }, []);

  /* Create editor once */
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
          lineNumbers(),
          markdown({ base: markdownLanguage }),
          keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
          history(),
          drawSelection(),
          placeholder('Write markdown here…'),
          compartment.current.of(buildTheme(fontSize)),
          cursorCompartment.current.of(buildCursorTheme(cursorStyle, cursorWidth)),
          updateListener,
        ],
      parent: editorRef.current,
    });

    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line

  /* ✅ Key fix: dynamically reconfigure the theme when fontSize changes */
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: compartment.current.reconfigure(buildTheme(fontSize)),
    });
  }, [fontSize]);

  /* Dynamically reconfigure cursor theme when cursorStyle/cursorWidth changes */
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: cursorCompartment.current.reconfigure(buildCursorTheme(cursorStyle, cursorWidth)),
    });
  }, [cursorStyle, cursorWidth]);

  /* Ctrl+\ toggles preview */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); togglePreview(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePreview]);

  /* Sync external value changes into editor */
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
      className="flex flex-col h-full border border-white/[0.06] rounded-xl overflow-hidden select-none"
      ref={containerRef}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/[0.05] bg-white/[0.02] shrink-0 [app-region:no-drag]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-white/30 tracking-wide">Markdown</span>
          {preview && (
            <span className="text-[9px] text-white/15 border border-white/[0.06] rounded px-1 py-px">
              split
            </span>
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
        {/* CodeMirror editor */}
        <div
          ref={editorRef}
          className="overflow-hidden"
          style={{ width: editorW, fontFamily: fontFamily || undefined }}
        />

        {/* Drag handle */}
        {preview && (
          <>
            <div
              className="w-[5px] flex-shrink-0 cursor-col-resize flex items-center justify-center group hover:bg-white/[0.04] transition-colors border-x border-white/[0.05]"
              onMouseDown={handleMouseDown}
            >
              <GripVertical className="w-2.5 h-2.5 text-white/10 group-hover:text-white/30 transition-colors" />
            </div>

            {/* Preview pane */}
            <div
              className="overflow-y-auto bg-white/[0.01] select-text"
              style={{
                width: previewW,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.07) transparent',
              }}
            >
              <div className="px-5 py-4">
                {content
                  ? <Markdown
                      content={content}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      accentColor={accentColor}
                    />
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
