import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, placeholder, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { Eye, Code2 } from 'lucide-react';
import Markdown from './Markdown';

const editorTheme = EditorView.theme({
  '&': { fontSize: '12px', height: '100%', background: 'transparent' },
  '.cm-content': { padding: '12px', fontFamily: 'ui-monospace, monospace', caretColor: '#60a5fa' },
  '.cm-activeLine': { background: 'rgba(255,255,255,0.03)' },
  '.cm-selectionBackground': { background: 'rgba(96,165,250,0.2)' },
  '.cm-gutters': { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.15)', fontSize: '10px' },
  '.cm-activeLineGutter': { background: 'transparent', color: 'rgba(255,255,255,0.3)' },
  '.cm-cursor': { borderLeftColor: '#60a5fa' },
  '.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto', scrollbarWidth: 'thin' },
}, { dark: true });

const MarkdownEditor = ({ value = '', onChange, readOnly = false, fontSize = 14, accentColor = '' }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [preview, setPreview] = useState(true);
  const [content, setContent] = useState(value);

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
        editorTheme,
        update,
      ],
      parent: editorRef.current,
    });

    return () => { viewRef.current?.destroy(); viewRef.current = null; };
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (value !== current) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="flex flex-col h-full border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 border-b border-white/[0.05] bg-white/[0.02] shrink-0">
        <span className="text-[10px] text-white/30 font-medium">Markdown</span>
        <button
          onClick={() => setPreview(!preview)}
          className="size-6 flex items-center justify-center rounded text-white/25 hover:text-white/50 transition-colors"
          title={preview ? 'Hide preview' : 'Show preview'}
        >
          {preview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>
      <div className={`flex ${preview ? 'flex-row' : ''} flex-1 min-h-0 h-full`}>
        <div ref={editorRef} className={`${preview ? 'w-1/2 border-r border-white/[0.06]' : 'w-full'} overflow-hidden`} />
        {preview && (
          <div className="w-1/2 overflow-y-auto p-3 bg-white/[0.01]">
            <Markdown content={content || 'Nothing to preview'} fontSize={fontSize} accentColor={accentColor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
