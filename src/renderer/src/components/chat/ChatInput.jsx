import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Square } from 'lucide-react';

const ChatMessage = ({ message }) => (
  <div className={`flex gap-3 px-4 py-3 ${message.role === 'user' ? 'bg-white/[0.02]' : ''}`}>
    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
      message.role === 'user' ? 'bg-white/10 text-white/60' : 'bg-blue-500/20 text-blue-400'
    }`}>
      {message.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-white/30 font-medium mb-0.5">
        {message.role === 'user' ? 'You' : 'AI'}
      </p>
      <div className="text-xs text-white/80 whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </div>
    </div>
  </div>
);

const ChatInput = ({ onSend, onStop, loading, disabled, placeholder = 'Message...' }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);
  useEffect(() => { if (!loading) textareaRef.current?.focus(); }, [loading]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSend(text);
    setValue('');
    setTimeout(() => adjustHeight(), 0);
  };

  return (
    <div className="px-4 py-3 border-t border-white/[0.06]">
      <div className="relative">
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
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white outline-none placeholder:text-white/15 resize-none focus:border-white/10 transition-colors disabled:opacity-30 select-text"
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2">
          {loading ? (
            <button
              onClick={onStop}
              className="size-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
              title="Stop generation"
            >
              <Square className="w-3 h-3" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className="size-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
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
