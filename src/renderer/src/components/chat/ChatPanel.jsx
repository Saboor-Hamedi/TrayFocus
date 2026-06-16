import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, AlertCircle } from 'lucide-react';
import ChatInput, { ChatMessage } from './ChatInput';
import { getProvider, sendMessage } from '../../ai';

const ChatPanel = ({ apiKey, providerId, model }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages((p) => [...p, userMsg]);
    setError(null);
    setLoading(true);

    try {
      const allMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
      const result = await sendMessage(providerId, allMessages, apiKey, { model });
      setMessages((p) => [...p, { role: 'assistant', content: result.content }]);
    } catch (e) {
      setError(e.message);
      setMessages((p) => [...p, { role: 'assistant', content: `Error: ${e.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const provider = getProvider(providerId);

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium text-white/80">
            {provider?.name || 'AI'} Chat
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="size-7 flex items-center justify-center rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Sparkles className="w-5 h-5 text-white/10 mb-2" />
            <p className="text-xs text-white/20">Ask anything — your API key is stored locally</p>
          </div>
        ) : (
          messages.map((m, i) => <ChatMessage key={i} message={m} />)
        )}
      </div>

      {error && (
        <div className="px-4 py-1.5 border-t border-red-500/10 bg-red-500/5 flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-red-400" />
          <p className="text-[10px] text-red-400 truncate">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400 text-[10px]">Dismiss</button>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={loading || !apiKey}
        placeholder={!apiKey ? 'Set API key in Settings → AI' : 'Message...'}
      />
    </div>
  );
};

export default ChatPanel;
