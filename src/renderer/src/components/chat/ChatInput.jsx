import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';

const ChatInput = ({ onSend, disabled, placeholder = 'Message...' }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    inputRef.current?.focus();
  }, [value, disabled, onSend]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-white/[0.06]">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/15 disabled:opacity-30"
        spellCheck={false}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="size-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default ChatInput;

const ChatMessage = ({ message }) => (
  <div className={`flex gap-3 px-4 py-3 ${message.role === 'user' ? 'bg-white/[0.02]' : ''}`}>
    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
      message.role === 'user' ? 'bg-white/10 text-white/60' : 'bg-blue-500/20 text-blue-400'
    }`}>
      {message.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white/40 font-medium mb-0.5">
        {message.role === 'user' ? 'You' : 'AI'}
      </p>
      <div className="text-xs text-white/80 whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </div>
    </div>
  </div>
);

export { ChatMessage };
