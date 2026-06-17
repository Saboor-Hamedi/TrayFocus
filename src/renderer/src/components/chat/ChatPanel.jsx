import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, AlertCircle, Bot } from 'lucide-react';
import ChatInput, { ChatMessage } from './ChatInput';
import { getProvider, streamMessage } from '../../ai';

const SYSTEM_PROMPT = {
  role: 'system',
  content: 'You are a helpful, concise assistant. Always respond in English. Be accurate, direct, and helpful. Use clear markdown formatting for code blocks, lists, and emphasis.',
};

/* ── Scroll-to-bottom button ─────────────────────────── */
const ScrollButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute bottom-2 right-3 z-10 flex items-center justify-center
      w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 border border-black/10 dark:border-white/10
      text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition-all duration-150 shadow-md"
    title="Scroll to bottom"
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

/* ── Empty state ─────────────────────────────────────── */
const EmptyState = ({ providerName }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-8 select-none">
    <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center mb-4 shadow-inner">
      <Bot className="w-5 h-5 text-black/20 dark:text-white/20" strokeWidth={1.5} />
    </div>
    <p className="text-[12px] font-medium text-black/30 dark:text-white/30 mb-1">
      Ask {providerName} anything
    </p>
    <p className="text-[10px] text-black/15 dark:text-white/15 leading-relaxed max-w-[180px]">
      API keys are stored locally and never leave your device
    </p>
  </div>
);

/* ── Date / session divider ──────────────────────────── */
const SessionDivider = () => (
  <div className="flex items-center gap-3 px-4 py-2">
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
    <span className="text-[9px] text-black/15 dark:text-white/15 select-none">New session</span>
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
  </div>
);

/* ── Main panel ──────────────────────────────────────── */
const ChatPanel = ({ apiKey, providerId, model, fontSize = 14, accentColor = '' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // Show scroll-to-bottom button when user scrolls up
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 80);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

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

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const provider = getProvider(providerId);
  const providerName = provider?.name || 'AI';

  return (
    <div className="flex flex-col h-full items-center overflow-hidden">
      <div className="flex flex-col h-full w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-black/[0.05] dark:border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-blue-400" strokeWidth={1.5} />
            </div>
            <span className="text-[11px] font-medium text-black/50 dark:text-white/50 tracking-wide">{providerName}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* loading pulse */}
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1" />
            )}
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="size-6 flex items-center justify-center rounded-md
                  text-black/20 dark:text-white/20 hover:text-black/50 dark:hover:text-white/50 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]
                  transition-all duration-150"
                title="Clear conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto py-3 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.06) transparent' }}
          >
            {messages.length === 0 ? (
              <EmptyState providerName={providerName} />
            ) : (
              <>
                <SessionDivider />
                {messages.map((m, i) => (
                  <ChatMessage
                    key={i}
                    message={m}
                    fontSize={fontSize}
                    accentColor={accentColor}
                  />
                ))}
                {/* invisible anchor for scroll-to-bottom */}
                <div ref={bottomRef} className="h-2" />
              </>
            )}
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && <ScrollButton onClick={scrollToBottom} />}
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-3.5 py-1.5 border-t border-red-500/10 bg-red-500/[0.04] flex items-center gap-2 shrink-0">
            <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
            <p className="text-[10px] text-red-400/80 truncate flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400/40 hover:text-red-400 text-[10px] transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          loading={loading}
          disabled={!apiKey}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
