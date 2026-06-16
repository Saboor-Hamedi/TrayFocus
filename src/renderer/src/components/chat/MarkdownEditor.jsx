import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, keymap, placeholder, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { Eye, Code2, GripVertical } from 'lucide-react';
import Markdown from './Markdown';

const STORAGE_KEY = 'trayfocus-md-preview';
const STORAGE_SPLIT = 'trayfocus-md-split';

const loadPreview = () => { try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false } };
const savePreview = (v) => { try { localStorage.setItem(STORAGE_KEY, v) } catch {} };
const loadSplit = () => { try { const v = parseFloat(localStorage.getItem(STORAGE_SPLIT)); return v > 0.1 && v < 0.9 ? v : 0.5 } catch { return 0.5 } };
const saveSplit = (v) => { try { localStorage.setItem(STORAGE_SPLIT, v) } catch {} };

const editorTheme = (fs) => EditorView.theme({
  '&': { fontSize: `${Math.max(fs * 0.95, 12)}px`, height: '100%', background: 'transparent' },
  '.cm-content': { padding: '14px', fontFamily: 'ui-monospace, SF Mono, Menlo, Monaco, monospace', caretColor: '#60a5fa', lineHeight: '1.6' },
  '.cm-activeLine': { background: 'rgba(255,255,255,0.04)' },
  '.cm-selectionBackground': { background: 'rgba(96,165,250,0.25)' },
  '.cm-gutters': { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.12)', fontSize: `${Math.max(fs * 0.7, 9)}px` },
  '.cm-cursor': { borderLeftColor: '#60a5fa' },
  '.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
  '& ::-webkit-scrollbar': { width: '6px', height: '6px' },
  '& ::-webkit-scrollbar-track': { background: 'transparent' },
  '& ::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.08)', borderRadius: '3px' },
  '& ::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.15)' },
}, { dark: true });

const MarkdownEditor = ({ value = '', onChange, readOnly = false, fontSize = 14, accentColor = '' }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [preview, setPreview] = useState(loadPreview);
  const [content, setContent] = useState(value);
  const [splitRatio, setSplitRatio] = useState(loadSplit);
  const splitRef = useRef(splitRatio);
  const draggingRef = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => { splitRef.current = splitRatio; }, [splitRatio]);

  const handleMouseDown = useCallback(() => { draggingRef.current = true; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const clamped = Math.min(0.85, Math.max(0.15, ratio));
    setSplitRatio(clamped);
  }, []);
  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    saveSplit(splitRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  const togglePreview = useCallback(() => { setPreview((p) => { savePreview(!p); return !p; }); }, []);

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const update = EditorView.updateListener.of((v) => {
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
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        placeholder('Write markdown...'),
        editorTheme(fontSize),
        update,
      ],
      parent: editorRef.current,
    });

    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, []);

  // Ctrl+\ toggles preview regardless of focus (document-level listener)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') { e.preventDefault(); togglePreview(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePreview]);

  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (value !== current) {
      viewRef.current.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  const editorPercent = preview ? `${(splitRatio * 100).toFixed(1)}%` : '100%';
  const previewPercent = preview ? `${((1 - splitRatio) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="flex flex-col h-full border border-white/[0.06] rounded-xl overflow-hidden select-none" ref={containerRef}>
      <div className="flex items-center justify-between px-3 py-1 border-b border-white/[0.05] bg-white/[0.02] shrink-0 [app-region:no-drag]">
        <span className="text-[10px] text-white/30 font-medium">Markdown</span>
        <div className="flex items-center gap-1">
          <kbd className="text-[9px] text-white/15 mr-1">Ctrl+\</kbd>
          <button
            onClick={togglePreview}
            className="size-6 flex items-center justify-center rounded text-white/25 hover:text-white/50 transition-colors"
            title={preview ? 'Hide preview' : 'Show preview'}
          >
            {preview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div ref={editorRef} className="overflow-hidden" style={{ width: editorPercent }} />
        {preview && (
          <>
            <div
              className="w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center group hover:bg-white/[0.03] transition-colors border-x border-white/[0.04]"
              onMouseDown={handleMouseDown}
            >
              <GripVertical className="w-3 h-3 text-white/10 group-hover:text-white/25 transition-colors" />
            </div>
            <div
              className="overflow-y-auto bg-white/[0.01] select-text"
              style={{ width: previewPercent }}
            >
              <div className="p-3">
                <Markdown content={content || 'Nothing to preview'} fontSize={fontSize} accentColor={accentColor} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
