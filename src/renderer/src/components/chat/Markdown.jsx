import React, { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const Markdown = ({ content }) => {
  const html = useMemo(() => {
    try {
      return marked.parse(content, { async: false });
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="prose prose-invert prose-sm max-w-none text-[11px] leading-relaxed whitespace-pre-wrap break-words
        [&_pre]:bg-black/40 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_pre]:my-2
        [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
        [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:pl-4
        [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic
        [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h1_h2_h3]:font-semibold [&_h1_h2_h3]:my-2
        [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-white/50 [&_blockquote]:my-2
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Markdown;
