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

const Markdown = ({ content, fontSize = 14 }) => {
  const ref = useRef(null);

  const html = useMemo(() => {
    try { return marked.parse(content, { async: false, renderer }); }
    catch { return content; }
  }, [content]);

  // Attach copy handlers to code block buttons after each render
  useEffect(() => {
    if (!ref.current) return;
    const handlers = [];
    const btns = ref.current.querySelectorAll('.cb-btn');
    btns.forEach((btn) => {
      const handler = () => {
        const code = decodeURIComponent(btn.dataset.code || '');
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        }).catch(() => {});
      };
      btn.addEventListener('click', handler);
      handlers.push([btn, handler]);
    });
    return () => handlers.forEach(([b, h]) => b.removeEventListener('click', h));
  }, [html]);

  const fs = Math.max(fontSize * 0.75, 11);

  return (
    <div
      ref={ref}
      className="prose prose-invert max-w-none font-sans leading-relaxed break-words
        [&_.cb-wrap]:my-2 [&_.cb-wrap]:rounded-lg [&_.cb-wrap]:overflow-hidden [&_.cb-wrap]:border [&_.cb-wrap]:border-white/[0.06]
        [&_.cb-head]:flex [&_.cb-head]:items-center [&_.cb-head]:justify-between [&_.cb-head]:px-3 [&_.cb-head]:py-1 [&_.cb-head]:bg-white/[0.03] [&_.cb-head]:border-b [&_.cb-head]:border-white/[0.04] [&_.cb-head]:text-[10px] [&_.cb-head]:text-white/30 [&_.cb-head]:font-mono
        [&_.cb-btn]:text-[10px] [&_.cb-btn]:text-white/25 [&_.cb-btn]:hover:text-white/50 [&_.cb-btn]:bg-transparent [&_.cb-btn]:border-0 [&_.cb-btn]:cursor-pointer [&_.cb-btn]:transition-colors [&_.cb-btn]:font-sans [&_.cb-btn]:outline-none
        [&_.cb-wrap_pre]:m-0 [&_.cb-wrap_pre]:bg-black/30 [&_.cb-wrap_pre]:p-3 [&_.cb-wrap_pre]:overflow-x-auto [&_.cb-wrap_pre]:rounded-none
        [&_.cb-wrap_code]:text-[11px] [&_.cb-wrap_code]:font-mono [&_.cb-wrap_code]:leading-relaxed
        [&_pre_code]:text-inherit [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono
        [&_p]:my-1.5 [&_ul]:my-1 [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:pl-4
        [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
        [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2.5
        [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-white/50 [&_blockquote]:my-2
        [&_table]:w-full [&_table]:text-left [&_table]:my-2
        [&_th]:border-b [&_th]:border-white/10 [&_th]:px-2 [&_th]:py-1 [&_th]:text-[10px] [&_th]:text-white/40
        [&_td]:border-b [&_td]:border-white/[0.04] [&_td]:px-2 [&_td]:py-1
        [&_hr]:border-white/[0.06] [&_hr]:my-3
      "
      style={{ fontSize: `${fs}px` }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Markdown;
