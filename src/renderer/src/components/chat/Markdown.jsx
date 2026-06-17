import React, { useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.min.css';

marked.setOptions({ breaks: true, gfm: true });

/* ── Accent color map ─────────────────────────────────────────── */
const COLOR_MAP = {
  blue: '#60a5fa', sky: '#38bdf8', cyan: '#22d3ee', teal: '#2dd4bf',
  green: '#4ade80', emerald: '#34d399', lime: '#a3e635', yellow: '#facc15',
  amber: '#fbbf24', orange: '#fb923c', red: '#f87171', rose: '#fb7185',
  pink: '#f472b6', fuchsia: '#e879f9', purple: '#c084fc', violet: '#a78bfa', indigo: '#818cf8',
};

/* ── One-time global style injection (ID-guarded) ─────────────── */
const STYLE_ID = 'md-prose-global-css';
const injectGlobalStyles = () => {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    /* ── Base ───────────────────────────────────────────────── */
    .md-prose { line-height: 1.7; word-break: break-word; }
    .md-prose > *:first-child { margin-top: 0 !important; }
    .md-prose > *:last-child  { margin-bottom: 0 !important; }

    /* ── Paragraphs ─────────────────────────────────────────── */
    .md-prose p { margin: 0.55em 0; line-height: 1.75; }

    /* ── Headings ───────────────────────────────────────────── */
    .md-prose h1,.md-prose h2,.md-prose h3,
    .md-prose h4,.md-prose h5,.md-prose h6 {
      font-weight: 600; line-height: 1.25; color: rgba(0,0,0,0.85);
      letter-spacing: -0.01em;
    }
    .md-prose h1 {
      font-size: var(--md-h1, 1.6em); font-weight: 700;
      margin: 1.1em 0 0.45em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      letter-spacing: -0.02em;
    }
    .md-prose h2 {
      font-size: var(--md-h2, 1.35em); font-weight: 700;
      margin: 0.95em 0 0.38em;
      padding-bottom: 0.22em;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .md-prose h3 { font-size: var(--md-h3, 1.15em); margin: 0.8em 0 0.3em; }
    .md-prose h4 { font-size: 1em; margin: 0.65em 0 0.25em; color: rgba(0,0,0,0.75); }
    .md-prose h5,.md-prose h6 {
      font-size: 0.95em; font-weight: 500;
      margin: 0.55em 0 0.2em; color: rgba(0,0,0,0.55);
    }

    .dark .md-prose h1,.dark .md-prose h2,.dark .md-prose h3 { color: rgba(255,255,255,0.9); }
    .dark .md-prose h1 { border-bottom-color: rgba(255,255,255,0.07); }
    .dark .md-prose h2 { border-bottom-color: rgba(255,255,255,0.05); }
    .dark .md-prose h4 { color: rgba(255,255,255,0.8); }
    .dark .md-prose h5,.dark .md-prose h6 { color: rgba(255,255,255,0.65); }

    /* ── Links ──────────────────────────────────────────────── */
    .md-prose a {
      color: var(--md-accent, #60a5fa);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: color-mix(in srgb, var(--md-accent, #60a5fa) 40%, transparent);
      transition: opacity 0.15s;
    }
    .md-prose a:hover { opacity: 0.75; }

    /* ── HR ─────────────────────────────────────────────────── */
    .md-prose hr {
      border: 0;
      border-top: 1px solid rgba(0,0,0,0.1);
      margin: 1em 0;
    }
    .dark .md-prose hr { border-top-color: rgba(255,255,255,0.07); }

    /* ── Inline formatting ──────────────────────────────────── */
    .md-prose strong { font-weight: 700; color: rgba(0,0,0,0.9); }
    .md-prose em { font-style: italic; color: rgba(0,0,0,0.65); }
    .md-prose del { text-decoration: line-through; color: rgba(0,0,0,0.35); }
    .dark .md-prose strong { color: rgba(255,255,255,0.92); }
    .dark .md-prose em { color: rgba(255,255,255,0.72); }
    .dark .md-prose del { color: rgba(255,255,255,0.35); }

    /* ── Tags & mentions ─────────────────────────────────────── */
    .md-prose .md-tag,
    .md-prose .md-mention {
      color: var(--md-accent, #60a5fa);
      font-weight: 500;
      opacity: 0.9;
    }

    /* ── Inline code ─────────────────────────────────────────── */
    .md-prose :not(pre) > code {
      font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
      font-size: 0.87em;
      padding: 0.18em 0.45em;
      border-radius: 4px;
      color: var(--md-accent, #60a5fa);
      background: color-mix(in srgb, var(--md-accent, #60a5fa) 8%, transparent);
      font-weight: 500;
    }
    .dark .md-prose :not(pre) > code {
      background: color-mix(in srgb, var(--md-accent, #60a5fa) 12%, transparent);
    }

    /* ── Blockquote ─────────────────────────────────────────── */
    .md-prose blockquote {
      margin: 0.75em 0;
      padding: 0.45em 0 0.45em 1em;
      border-left: 3px solid color-mix(in srgb, var(--md-accent, #60a5fa) 40%, transparent);
      background: color-mix(in srgb, var(--md-accent, #60a5fa) 5%, transparent);
      border-radius: 0 6px 6px 0;
      color: rgba(0,0,0,0.6);
      font-style: italic;
    }
    .dark .md-prose blockquote { color: rgba(255,255,255,0.52); }
    .md-prose blockquote p { margin: 0; }
    .md-prose blockquote > *:first-child { margin-top: 0; }
    .md-prose blockquote > *:last-child  { margin-bottom: 0; }

    /* ── Lists — base ────────────────────────────────────────── */
    .md-prose ul, .md-prose ol {
      margin: 0.5em 0;
      padding-left: 1.6em;
    }
    .md-prose li > ul, .md-prose li > ol { margin: 0.18em 0; }

    .md-prose ul                { list-style-type: disc; }
    .md-prose ul ul             { list-style-type: circle; }
    .md-prose ul ul ul          { list-style-type: square; }

    .md-prose ol                { list-style-type: decimal; }
    .md-prose ol ol             { list-style-type: lower-alpha; }
    .md-prose ol ol ol          { list-style-type: lower-roman; }

    .md-prose li {
      margin: 0.28em 0;
      padding-left: 0.25em;
      line-height: 1.7;
    }
    .md-prose li::marker {
      color: var(--md-accent, #60a5fa);
      opacity: 0.65;
    }
    .md-prose li > p { margin: 0.2em 0; }

    /* ── Task lists ──────────────────────────────────────────── */
    .md-prose li.md-task {
      list-style: none;
      display: flex;
      align-items: flex-start;
      gap: 0.55em;
      margin-left: -1.6em;
      padding-left: 0;
    }
    .md-prose li.md-task .md-cb {
      flex-shrink: 0;
      width:  0.95em;
      height: 0.95em;
      border: 1.5px solid rgba(0,0,0,0.2);
      border-radius: 3px;
      margin-top: 0.375em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6em;
      line-height: 1;
      color: transparent;
      transition: background 0.15s, border-color 0.15s;
    }
    .dark .md-prose li.md-task .md-cb { border-color: rgba(255,255,255,0.22); }
    .md-prose li.md-task.md-checked .md-cb {
      background: var(--md-accent, #60a5fa);
      border-color: var(--md-accent, #60a5fa);
      color: #000;
    }
    .md-prose li.md-task.md-checked .md-task-text {
      opacity: 0.42;
      text-decoration: line-through;
      text-decoration-color: color-mix(in srgb, var(--md-accent, #60a5fa) 50%, transparent);
    }

    /* ── Tables ──────────────────────────────────────────────── */
    .md-prose table {
      width: 100%; border-collapse: separate; border-spacing: 0;
      margin: 0.8em 0;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 8px; overflow: hidden;
      font-size: 0.92em;
    }
    .dark .md-prose table { border-color: rgba(255,255,255,0.07); }
    .md-prose th {
      background: rgba(0,0,0,0.04);
      padding: 0.5em 0.9em;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      font-size: 0.78em; text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(0,0,0,0.5); font-weight: 600; text-align: left;
    }
    .dark .md-prose th { background: rgba(255,255,255,0.04); border-bottom-color: rgba(255,255,255,0.07); color: rgba(255,255,255,0.5); }
    .md-prose td {
      padding: 0.45em 0.9em;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .dark .md-prose td { border-bottom-color: rgba(255,255,255,0.04); }
    .md-prose tr:last-child td { border-bottom: 0; }
    .md-prose tr:nth-child(even) td { background: rgba(0,0,0,0.015); }
    .dark .md-prose tr:nth-child(even) td { background: rgba(255,255,255,0.015); }

    /* ── Images ──────────────────────────────────────────────── */
    .md-prose img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }

    /* ── Code blocks ─────────────────────────────────────────── */
    .md-prose .cb-wrap {
      margin: 0.9em 0;
      border-radius: 8px; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.1);
      background: rgba(0,0,0,0.04);
    }
    .dark .md-prose .cb-wrap { border-color: rgba(255,255,255,0.08); background: rgba(0,0,0,0.32); }
    .md-prose .cb-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.32em 0.9em;
      background: rgba(0,0,0,0.03);
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .dark .md-prose .cb-head { background: rgba(255,255,255,0.03); border-bottom-color: rgba(255,255,255,0.06); }
    .md-prose .cb-lang {
      font-family: ui-monospace, monospace; font-size: 0.68em;
      text-transform: uppercase; letter-spacing: 0.09em;
      color: rgba(0,0,0,0.4);
    }
    .dark .md-prose .cb-lang { color: rgba(255,255,255,0.24); }
    .md-prose .cb-btn {
      font-size: 0.7em; color: rgba(0,0,0,0.4);
      background: transparent; border: 0; cursor: pointer;
      padding: 0; font-family: inherit;
      transition: color 0.15s;
    }
    .dark .md-prose .cb-btn { color: rgba(255,255,255,0.24); }
    .md-prose .cb-btn:hover { color: rgba(0,0,0,0.6); }
    .dark .md-prose .cb-btn:hover { color: rgba(255,255,255,0.6); }
    .md-prose .cb-wrap pre {
      margin: 0; background: transparent;
      padding: 0.875em 0.9em; overflow-x: auto;
    }
    .md-prose .cb-wrap code {
      font-size: 0.84em;
      font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
      line-height: 1.65; background: transparent; padding: 0;
    }
  `;
  document.head.appendChild(el);
};

// Inject once when module is loaded
injectGlobalStyles();

/* ── marked renderers ────────────────────────────────────────── */
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }) => {
  const label = lang || 'plain';
  let highlighted;
  if (lang && hljs.getLanguage(lang)) {
    try { highlighted = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value; }
    catch { highlighted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  } else {
    highlighted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return `<div class="cb-wrap"><div class="cb-head"><span class="cb-lang">${label}</span><button class="cb-btn" data-code="${encodeURIComponent(text)}">Copy</button></div><pre><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre></div>`;
};

// Task list items
renderer.listitem = (item) => {
  if (item.task) {
    const cls = `md-task${item.checked ? ' md-checked' : ''}`;
    const mark = item.checked ? '✓' : '';
    // Strip wrapping <p> tags marked sometimes adds in loose lists
    const body = item.text.replace(/^<p>(.*?)<\/p>\n?$/s, '$1');
    return `<li class="${cls}"><span class="md-cb">${mark}</span><span class="md-task-text">${body}</span></li>\n`;
  }
  return `<li>${item.text}</li>\n`;
};

/* ── Clipboard fallback ──────────────────────────────────────── */
const fallbackCopy = (text) => {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

/* ── Preprocess raw markdown before parsing ──────────────────── */
// Converts `. item` (dot-space) at start of lines into `- item`
// so the user can use `.` as a bullet marker.  Skips code fences.
const preprocessMarkdown = (raw) => {
  const lines = raw.split('\n');
  let inFence = false;
  return lines.map((line) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return line; }
    if (inFence) return line;
    // Match optional leading whitespace then exactly one dot then a space
    return line.replace(/^(\s*)\.(\s+)/, '$1-$2');
  }).join('\n');
};

/* ── Post-process HTML: highlight #tag and @mention ─────────── */
// Splits on <code>/<pre> blocks so we never modify code content.
const CODE_BLOCK_RE = /(<(?:code|pre)\b[^>]*>[\s\S]*?<\/(?:code|pre)>)/gi;

const addTagsMentions = (rawHtml) =>
  rawHtml.split(CODE_BLOCK_RE).map((chunk, i) => {
    if (i % 2 === 1) return chunk; // inside code block — skip
    return chunk
      .replace(/(^|[\s>.,;!?(])(#\w+)/g, '$1<span class="md-tag">$2</span>')
      .replace(/(^|[\s>.,;!?(])(@\w+)/g, '$1<span class="md-mention">$2</span>');
  }).join('');

/* ── Component ───────────────────────────────────────────────── */
const Markdown = ({ content, fontSize = 14, fontFamily = '', accentColor = '' }) => {
  const ref = useRef(null);

  const accentKey = accentColor.replace('text-', '').replace(/-\d+$/, '') || 'blue';
  const accentHex = COLOR_MAP[accentKey] || '#60a5fa';

  const html = useMemo(() => {
    try {
      const preprocessed = preprocessMarkdown(content);
      const raw = marked.parse(preprocessed, { async: false, renderer });
      return addTagsMentions(raw);
    } catch { return content; }
  }, [content]);

  /* Delegated copy button handler */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e) => {
      const btn = e.target.closest('.cb-btn');
      if (!btn) return;
      const code = decodeURIComponent(btn.dataset.code || '');
      const done = () => {
        btn.textContent = '✓ Copied';
        btn.style.color = '#4ade80';
        setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 1500);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(() => { try { fallbackCopy(code); done(); } catch {} });
      } else { try { fallbackCopy(code); done(); } catch {} }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, []);

  /* Mermaid diagram rendering — runs every render so saves don't lose diagrams */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const blocks = el.querySelectorAll('.cb-wrap code.language-mermaid, .hljs.language-mermaid');
    if (blocks.length === 0) return;

    // Swap un-rendered wrappers for placeholders
    const pending = [];
    blocks.forEach((codeEl) => {
      const wrap = codeEl.closest('.cb-wrap');
      if (!wrap) return;
      const text = (codeEl.textContent || '').trim();
      const placeholder = document.createElement('div');
      placeholder.className = 'mermaid-placeholder';
      placeholder.style.cssText = 'margin:0.5em 0;height:80px;display:flex;align-items:center;justify-content:center;border:1px dashed rgba(127,127,127,0.12);border-radius:6px;';
      placeholder.innerHTML = '<span style="font-size:10px;color:rgba(127,127,127,0.3)">rendering…</span>';
      wrap.replaceWith(placeholder);
      pending.push({ placeholder, text });
    });

    if (!window.__mermaidPromise) {
      window.__mermaidPromise = import('mermaid').then(m => m.default);
    }

    window.__mermaidPromise.then((mermaid) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      });

      pending.forEach(({ placeholder, text }) => {
        if (!text || !document.contains(placeholder)) return;

        mermaid.render(`mermaid-${Math.random().toString(36).slice(2, 8)}`, text).then(({ svg }) => {
          if (!document.contains(placeholder)) return;
          const div = document.createElement('div');
          div.className = 'mermaid-wrap';
          div.style.cssText = 'margin:0.5em 0;display:flex;justify-content:center;overflow-x:auto;max-height:300px;';
          div.innerHTML = svg;
          placeholder.replaceWith(div);
        }).catch(() => {
          if (document.contains(placeholder)) {
            placeholder.innerHTML = '<span style="font-size:10px;color:rgba(200,50,50,0.4)">render failed</span>';
          }
        });
      });
    });
  });

  const fs = Math.max(fontSize, 11);
  const ff = fontFamily || 'inherit';

  return (
    <div
      ref={ref}
      className="md-prose select-text"
      style={{
        fontSize: fs + 'px',
        fontFamily: ff,
        // CSS variables consumed by the injected global stylesheet
        '--md-accent': accentHex,
        '--md-h1': Math.round(fs * 1.6) + 'px',
        '--md-h2': Math.round(fs * 1.35) + 'px',
        '--md-h3': Math.round(fs * 1.15) + 'px',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Markdown;
