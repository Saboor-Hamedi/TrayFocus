import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import Markdown from './Markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex px-3 py-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] leading-relaxed ${
        isUser
          ? 'bg-blue-500/15 text-white/90 rounded-tr-sm'
          : message.error
            ? 'bg-red-500/10 text-red-400 rounded-tl-sm'
            : 'bg-white/[0.04] text-white/80 rounded-tl-sm'
      }`}>
        {isUser ? message.content : <Markdown content={message.content} />}
      </div>
    </div>
  );
};

const ChatInput = ({ onSend, onStop, loading, disabled, placeholder = 'Message...' }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { if (!loading) textareaRef.current?.focus(); }, [loading]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSend(text);
    setValue('');
  };

  return (
    <div className="px-4 py-2 border-t border-white/[0.06]">
      <div className="relative max-w-lg mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder={disabled && !loading ? 'Set API key in Settings → AI' : placeholder}
          disabled={disabled && !loading}
          rows={1}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 pr-8 text-xs text-white outline-none placeholder:text-white/15 resize-none focus:border-white/10 transition-colors disabled:opacity-30 select-text"
          spellCheck={false}
        />
        <div className="absolute bottom-1.5 right-1.5">
          {loading ? (
            <button
              onClick={onStop}
              className="size-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
              title="Stop generation"
            >
              <Square className="w-2.5 h-2.5" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className="size-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Send className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[9px] text-white/15 mt-1.5 px-1">Enter to send, Shift+Enter for newline</p>
    </div>
  );
};

export default ChatInput;
export { ChatMessage };
