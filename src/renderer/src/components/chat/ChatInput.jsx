import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, CornerDownLeft, Copy, Check } from 'lucide-react';
import Markdown from './Markdown';

/* ── Copy button ─────────────────────────────────────────── */
const CopyButton = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const handle = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      className={`opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium
        ${copied
          ? 'text-green-400 bg-green-400/10'
          : 'text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
        } ${className}`}
    >
      {copied
        ? <><Check className="w-2.5 h-2.5" /><span>Copied</span></>
        : <><Copy className="w-2.5 h-2.5" /><span>Copy</span></>
      }
    </button>
  );
};

/* ── Typing dots (shown while streaming empty response) ──── */
const TypingDots = () => (
  <span className="inline-flex items-center gap-[3px] h-3 px-0.5">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-1 h-1 rounded-full bg-black/30 dark:bg-white/30 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
      />
    ))}
  </span>
);

/* ── Single message bubble ───────────────────────────────── */
export const ChatMessage = ({ message, fontSize = 14, accentColor = '' }) => {
  const isUser = message.role === 'user';
  const fs = Math.max(fontSize * 0.78, 11);
  const isEmpty = !message.content;

  if (isUser) {
    return (
      <div className="group flex flex-col items-end px-4 py-1">
        <div
          className="max-w-[75%] bg-black/[0.06] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06] text-black/85 dark:text-white/85
            rounded-2xl rounded-br-sm px-3.5 py-2 leading-relaxed whitespace-pre-wrap
            shadow-sm"
          style={{ fontSize: fs }}
        >
          {message.content}
        </div>
        {/* copy sits below the bubble, right-aligned */}
        <div className="flex justify-end mt-0.5">
          <CopyButton text={message.content} />
        </div>
      </div>
    );
  }

  /* assistant */
  return (
    <div className="group flex flex-col px-4 py-1">
      <div
        className={`w-full leading-relaxed ${message.error ? 'text-red-400/90' : 'text-black/80 dark:text-white/80'}`}
        style={{ fontSize: fs }}
      >
        {isEmpty
          ? <TypingDots />
          : <Markdown content={message.content} fontSize={fontSize} accentColor={accentColor} />
        }
      </div>

      {/* action row — fades in on hover below the response */}
      {!isEmpty && (
        <div className="flex items-center gap-0.5 mt-0.5">
          <CopyButton text={message.content} />
        </div>
      )}
    </div>
  );
};

/* ── Input area ──────────────────────────────────────────── */
const ChatInput = ({ onSend, onStop, loading, disabled, placeholder = 'Message...' }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { if (!loading) textareaRef.current?.focus(); }, [loading]);

  // Auto-resize only on user input
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
      <div className="max-w-xl mx-auto">
        <div
          className="flex flex-col rounded-xl overflow-hidden border transition-all duration-200
            bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.07] dark:border-white/[0.07]
            focus-within:bg-black/[0.04] dark:focus-within:bg-white/[0.055] focus-within:border-black/[0.14] dark:focus-within:border-white/[0.14]
            focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder={disabled && !loading ? 'Add an API key in Settings → AI' : placeholder}
            disabled={disabled && !loading}
            rows={2}
            className="w-full bg-transparent px-3.5 pt-3 pb-2 text-[13px] text-black/90 dark:text-white/90
              outline-none placeholder:text-black/20 dark:placeholder:text-white/20 resize-none disabled:opacity-30
              select-text leading-relaxed"
            spellCheck={false}
            style={{ minHeight: '56px', maxHeight: '140px' }}
          />

          {/* Footer bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-black/[0.05] dark:border-white/[0.05]">
            <span className="text-[9px] text-black/20 dark:text-white/20 select-none flex items-center gap-1 leading-none">
              <CornerDownLeft className="w-2.5 h-2.5 opacity-40 shrink-0" />
              <span>Enter to send</span>
              <span className="text-black/10 dark:text-white/10">·</span>
              <span>Shift+Enter newline</span>

(Showing lines 149-155 of 197. Use offset=156 to continue.)

            </span>

            <div className="flex items-center gap-1.5">
              {/* char count — only visible when typing */}
              {hasText && !loading && (
                <span className="text-[9px] text-black/20 dark:text-white/20 tabular-nums">
                  {value.length}
                </span>
              )}

              {loading ? (
                <button
                  onClick={onStop}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                      bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.10] dark:hover:bg-white/[0.13] border border-black/[0.08] dark:border-white/[0.08]
                      text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 text-[10px] font-medium
                    transition-all duration-150 shrink-0"
                >
                  <Square className="w-2.5 h-2.5 shrink-0" fill="currentColor" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!hasText || disabled}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                    text-[10px] font-semibold transition-all duration-150 shrink-0
                    bg-blue-500 hover:bg-blue-400 text-white shadow-sm
                    disabled:opacity-20 disabled:cursor-not-allowed
                    disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-black/30 dark:disabled:text-white/30 disabled:shadow-none"
                >
                  <Send className="w-2.5 h-2.5 shrink-0" />
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
