import React, { useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.min.css';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
  const label = lang || 'text';
  let highlighted;
  if (lang && hljs.getLanguage(lang)) {
    try { highlighted = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value; }
    catch { highlighted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  } else {
    highlighted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return `<div class="cb-wrap"><div class="cb-head"><span>${label}</span><button class="cb-btn" data-code="${encodeURIComponent(text)}">Copy</button></div><pre><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre></div>`;
};

// Fallback for Electron contexts where navigator.clipboard may be restricted
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

const Markdown = ({ content, fontSize = 14, accentColor = '' }) => {
  const ref = useRef(null);

  // Color map for known accent classes — used to style inline code
  const accentHex = accentColor.replace('text-', '').replace(/-(\d+)$/, '') || 'blue';
  const colorMap = useMemo(() => ({
    blue: '#60a5fa', sky: '#38bdf8', cyan: '#22d3ee', teal: '#2dd4bf',
    green: '#4ade80', emerald: '#34d399', lime: '#a3e635', yellow: '#facc15',
    amber: '#fbbf24', orange: '#fb923c', red: '#f87171', rose: '#fb7185',
    pink: '#f472b6', fuchsia: '#e879f9', purple: '#c084fc', violet: '#a78bfa', indigo: '#818cf8',
  }), []);
  const accentValue = colorMap[accentHex] || accentColor;

  const html = useMemo(() => {
    try { return marked.parse(content, { async: false, renderer }); }
    catch { return content; }
  }, [content]);

  // Single delegated handler on the container — survives dangerouslySetInnerHTML re-renders
  // during streaming without needing to reattach on every html change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClick = (e) => {
      const btn = e.target.closest('.cb-btn');
      if (!btn) return;

      const code = decodeURIComponent(btn.dataset.code || '');

      const apply = (success) => {
        if (success) {
          btn.textContent = '✓ Copied';
          btn.style.color = '#4ade80';
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.color = '';
          }, 1500);
        }
      };

      // Try modern clipboard API first, fall back to execCommand
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => apply(true)).catch(() => {
          try { fallbackCopy(code); apply(true); } catch { apply(false); }
        });
      } else {
        try { fallbackCopy(code); apply(true); } catch { apply(false); }
      }
    };

    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []); // attach once — delegation handles dynamic buttons

  // Apply accent + hr styles whenever html updates
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Inline code accent
    el.querySelectorAll(':not(pre) > code').forEach((node) => {
      node.style.color = accentValue;
      node.style.background = accentValue + '15';
      node.style.fontWeight = '500';
    });

    // Horizontal rules
    el.querySelectorAll('hr').forEach((node) => {
      node.style.borderColor = accentValue + '30';
      node.style.margin = '12px 0';
    });
  }, [html, accentValue]);

  const fs = Math.max(fontSize * 0.75, 11);

  return (
    <div
      ref={ref}
      className={
        'prose prose-invert max-w-none font-sans leading-relaxed break-words select-text ' +
        '[&_.cb-wrap]:my-3.5 [&_.cb-wrap]:rounded-lg [&_.cb-wrap]:overflow-hidden [&_.cb-wrap]:border [&_.cb-wrap]:border-white/[0.06] [&_.cb-wrap]:bg-black/30 ' +
        '[&_.cb-head]:flex [&_.cb-head]:items-center [&_.cb-head]:justify-between [&_.cb-head]:px-3 [&_.cb-head]:py-0.5 [&_.cb-head]:text-[9px] [&_.cb-head]:text-white/10 [&_.cb-head]:font-mono ' +
        '[&_.cb-btn]:text-[10px] [&_.cb-btn]:text-white/25 [&_.cb-btn]:hover:text-white/50 [&_.cb-btn]:bg-transparent [&_.cb-btn]:border-0 [&_.cb-btn]:cursor-pointer [&_.cb-btn]:transition-colors [&_.cb-btn]:font-sans [&_.cb-btn]:outline-none [&_.cb-btn]:p-0 ' +
        '[&_.cb-wrap_pre]:m-0 [&_.cb-wrap_pre]:bg-transparent [&_.cb-wrap_pre]:p-3 [&_.cb-wrap_pre]:overflow-x-auto [&_.cb-wrap_pre]:rounded-none ' +
        '[&_.cb-wrap_code]:text-[11px] [&_.cb-wrap_code]:font-mono [&_.cb-wrap_code]:leading-relaxed ' +
        '[&_pre_code]:text-inherit [&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
        '[&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono ' +
        '[&_p]:my-2 ' +
        '[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-300 [&_a]:transition-colors ' +
        '[&_hr]:border-white/[0.06] [&_hr]:my-3 ' +
        '[&_ul]:list-disc [&_ul]:my-1.5 [&_ul]:pl-5 ' +
        '[&_ol]:list-decimal [&_ol]:my-1.5 [&_ol]:pl-5 ' +
        '[&_li]:my-0.5 [&_li]:pl-1 ' +
        '[&_strong]:font-semibold [&_strong]:text-white/90 ' +
        '[&_em]:italic [&_em]:text-white/70 ' +
        '[&_del]:line-through [&_del]:text-white/40 ' +
        '[&_img]:rounded-lg [&_img]:my-2 [&_img]:max-w-full ' +
        '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4 ' +
        '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 ' +
        '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2.5 ' +
        '[&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-white/50 [&_blockquote]:my-2 ' +
        '[&_table]:w-full [&_table]:text-left [&_table]:my-2 [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/[0.06] ' +
        '[&_th]:bg-white/[0.03] [&_th]:border-b [&_th]:border-white/[0.06] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-[10px] [&_th]:text-white/50 [&_th]:font-medium [&_th]:text-left ' +
        '[&_td]:border-b [&_td]:border-white/[0.04] [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-[11px] ' +
        '[&_tbody_tr:nth-child(even)_td]:bg-white/[0.01] ' +
        '[&_tr:last-child_td]:border-b-0 ' +
        '[&_hr]:border-white/[0.06] [&_hr]:my-3'
      }
      style={{ fontSize: fs + 'px' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Markdown;
