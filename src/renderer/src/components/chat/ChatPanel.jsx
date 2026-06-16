import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, AlertCircle } from 'lucide-react';
import ChatInput, { ChatMessage } from './ChatInput';
import { getProvider, streamMessage } from '../../ai';

const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are a helpful, concise assistant. Always respond in English. Be accurate, direct, and helpful. Use clear markdown formatting for code blocks, lists, and emphasis.',
};

const ChatPanel = ({ apiKey, providerId, model, fontSize = 14 }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const handleSend = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages((p) => [...p, userMsg]);
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Add an empty assistant message that we'll stream into
    const assistantIndex = messages.length + 1;
    setMessages((p) => [...p, { role: 'assistant', content: '' }]);

    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      const payload = [SYSTEM_PROMPT, ...history, { role: 'user', content: text }];

      let fullContent = '';
      for await (const chunk of streamMessage(providerId, payload, apiKey, {
        model,
        signal: controller.signal,
      })) {
        fullContent += chunk;
        setMessages((p) => {
          const copy = [...p];
          copy[assistantIndex] = { role: 'assistant', content: fullContent };
          return copy;
        });
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message);
        setMessages((p) => {
          const copy = [...p];
          copy[assistantIndex] = { role: 'assistant', content: `Error: ${e.message}`, error: true };
          return copy;
        });
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const provider = getProvider(providerId);
  const providerName = provider?.name || 'AI';

  return (
    <div className="flex flex-col h-full items-center">
      <div className="flex flex-col h-full w-full max-w-lg">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium text-white/60">{providerName} Chat</span>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="size-6 flex items-center justify-center rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors" title="Clear">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Sparkles className="w-6 h-6 text-white/8 mb-3" />
              <p className="text-xs text-white/20">Ask {providerName} anything</p>
              <p className="text-[10px] text-white/10 mt-1">API keys stored locally in AppData</p>
            </div>
          ) : (
            messages.map((m, i) => <ChatMessage key={i} message={m} />)
          )}
        </div>

        {error && (
          <div className="px-3 py-1 border-t border-red-500/5 bg-red-500/[0.03] flex items-center gap-2 shrink-0">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <p className="text-[10px] text-red-400/80 truncate flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400/40 hover:text-red-400 text-[10px]">Dismiss</button>
          </div>
        )}

        <ChatInput onSend={handleSend} onStop={handleStop} loading={loading} disabled={!apiKey} />
      </div>
    </div>
  );
};

export default ChatPanel;
