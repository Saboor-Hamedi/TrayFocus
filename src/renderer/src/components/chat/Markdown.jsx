import React, { useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.min.css';

marked.setOptions({ breaks: true, gfm: true });

/* ── Code block renderer ─────────────────────────────────────── */
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

/* ── Clipboard fallback for Electron ─────────────────────────── */
const fallbackCopy = (text) => {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
};

/* ── Accent color map ─────────────────────────────────────────── */
const COLOR_MAP = {
  blue: '#60a5fa', sky: '#38bdf8', cyan: '#22d3ee', teal: '#2dd4bf',
  green: '#4ade80', emerald: '#34d399', lime: '#a3e635', yellow: '#facc15',
  amber: '#fbbf24', orange: '#fb923c', red: '#f87171', rose: '#fb7185',
  pink: '#f472b6', fuchsia: '#e879f9', purple: '#c084fc', violet: '#a78bfa', indigo: '#818cf8',
};

/* ── Main component ───────────────────────────────────────────── */
const Markdown = ({ content, fontSize = 14, fontFamily = '', accentColor = '' }) => {
  const ref = useRef(null);

  const accentKey = accentColor.replace('text-', '').replace(/-\d+$/, '') || 'blue';
  const accentHex = COLOR_MAP[accentKey] || '#60a5fa';

  const html = useMemo(() => {
    try { return marked.parse(content, { async: false, renderer }); }
    catch { return content; }
  }, [content]);

  /* Delegated click — survives streaming re-renders */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClick = (e) => {
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
      } else {
        try { fallbackCopy(code); done(); } catch {}
      }
    };
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []);

  /* Accent styles — runs when html or accent changes */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll(':not(pre) > code').forEach((n) => {
      n.style.color = accentHex;
      n.style.background = accentHex + '18';
      n.style.fontWeight = '500';
    });
    el.querySelectorAll('hr').forEach((n) => {
      n.style.borderColor = accentHex + '28';
    });
    el.querySelectorAll('a').forEach((n) => {
      n.style.color = accentHex;
    });
  }, [html, accentHex]);

  // Use fontSize directly so the preview matches the editor — no downscaling
  const fs   = Math.max(fontSize, 11);
  const h1   = Math.round(fs * 1.6);
  const h2   = Math.round(fs * 1.35);
  const h3   = Math.round(fs * 1.15);
  const code = Math.max(Math.round(fs * 0.88), 10);

  // Font family: use prop if provided, fall back to app system font
  const ff = fontFamily || 'inherit';

  return (
    <div
      ref={ref}
      className={
        'prose prose-invert max-w-none leading-relaxed break-words select-text ' +
        /* Code wrapper */
        '[&_.cb-wrap]:my-4 [&_.cb-wrap]:rounded-lg [&_.cb-wrap]:overflow-hidden [&_.cb-wrap]:border [&_.cb-wrap]:border-white/[0.07] [&_.cb-wrap]:bg-black/[0.35] ' +
        '[&_.cb-head]:flex [&_.cb-head]:items-center [&_.cb-head]:justify-between [&_.cb-head]:px-3.5 [&_.cb-head]:py-1.5 [&_.cb-head]:bg-white/[0.03] [&_.cb-head]:border-b [&_.cb-head]:border-white/[0.06] ' +
        '[&_.cb-lang]:text-[9px] [&_.cb-lang]:font-mono [&_.cb-lang]:text-white/25 [&_.cb-lang]:uppercase [&_.cb-lang]:tracking-widest ' +
        '[&_.cb-btn]:text-[10px] [&_.cb-btn]:text-white/25 [&_.cb-btn]:hover:text-white/60 [&_.cb-btn]:bg-transparent [&_.cb-btn]:border-0 [&_.cb-btn]:cursor-pointer [&_.cb-btn]:transition-colors [&_.cb-btn]:outline-none [&_.cb-btn]:p-0 [&_.cb-btn]:font-sans ' +
        '[&_.cb-wrap_pre]:m-0 [&_.cb-wrap_pre]:bg-transparent [&_.cb-wrap_pre]:px-3.5 [&_.cb-wrap_pre]:py-3 [&_.cb-wrap_pre]:overflow-x-auto ' +
        '[&_.cb-wrap_code]:font-mono [&_.cb-wrap_code]:leading-relaxed [&_.cb-wrap_code]:bg-transparent [&_.cb-wrap_code]:p-0 ' +
        '[&_pre_code]:text-inherit [&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
        /* Inline code */
        '[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono ' +
        /* Prose */
        '[&_p]:my-2.5 [&_p]:leading-relaxed ' +
        '[&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-opacity [&_a]:hover:opacity-80 ' +
        '[&_hr]:border-white/[0.07] [&_hr]:my-4 ' +
        '[&_ul]:list-disc [&_ul]:my-2 [&_ul]:pl-5 ' +
        '[&_ol]:list-decimal [&_ol]:my-2 [&_ol]:pl-5 ' +
        '[&_li]:my-1 [&_li]:pl-0.5 [&_li]:leading-relaxed ' +
        '[&_strong]:font-semibold [&_strong]:text-white/90 ' +
        '[&_em]:italic [&_em]:text-white/70 ' +
        '[&_del]:line-through [&_del]:text-white/35 ' +
        '[&_img]:rounded-lg [&_img]:my-3 [&_img]:max-w-full ' +
        '[&_h1]:font-bold [&_h1]:text-white/90 [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:leading-tight [&_h1]:tracking-tight ' +
        '[&_h2]:font-semibold [&_h2]:text-white/85 [&_h2]:mb-2.5 [&_h2]:mt-4 [&_h2]:leading-tight ' +
        '[&_h3]:font-semibold [&_h3]:text-white/80 [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:leading-snug ' +
        '[&_h4]:font-medium [&_h4]:text-white/75 [&_h4]:mb-1.5 [&_h4]:mt-2.5 ' +
        '[&_blockquote]:border-l-[3px] [&_blockquote]:border-white/15 [&_blockquote]:pl-4 [&_blockquote]:text-white/50 [&_blockquote]:my-3 [&_blockquote]:italic ' +
        '[&_table]:w-full [&_table]:text-left [&_table]:my-3 [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/[0.06] ' +
        '[&_th]:bg-white/[0.04] [&_th]:border-b [&_th]:border-white/[0.06] [&_th]:px-3.5 [&_th]:py-2 [&_th]:text-white/55 [&_th]:font-semibold [&_th]:text-left [&_th]:uppercase [&_th]:tracking-wider ' +
        '[&_td]:border-b [&_td]:border-white/[0.04] [&_td]:px-3.5 [&_td]:py-2 ' +
        '[&_tbody_tr:nth-child(even)_td]:bg-white/[0.015] ' +
        '[&_tr:last-child_td]:border-b-0'
      }
      style={{
        fontSize: fs + 'px',
        fontFamily: ff,
        '--md-h1': h1 + 'px',
        '--md-h2': h2 + 'px',
        '--md-h3': h3 + 'px',
        '--md-code': code + 'px',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Markdown;
