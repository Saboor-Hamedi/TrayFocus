import React, { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const Markdown = ({ content, fontSize = 14 }) => {
  const html = useMemo(() => {
    try {
      return marked.parse(content, { async: false });
    } catch {
      return content;
    }
  }, [content]);

  const fs = Math.max(fontSize * 0.75, 11);
  const fsCode = Math.max(fs * 0.9, 9);

  return (
    <div
      className="prose prose-invert max-w-none font-sans leading-relaxed break-words
        [&_pre]:bg-black/40 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2
        [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
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
