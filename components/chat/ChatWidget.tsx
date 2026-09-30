'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('chat-session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('chat-session', id);
    }
    return id;
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId, channel: 'web' }),
      });

      if (!res.ok) {
        let errText = 'Unable to connect to support assistant.';
        try {
          const errJson = await res.json();
          if (errJson.error) errText = errJson.error;
        } catch {
          // Ignore JSON parse failure
        }
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ Error: ${errText}` }]);
        setLoading(false);
        return;
      }

      setMessages((m) => [...m, { role: 'assistant', content: '' }]);

      if (!res.body) {
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: 'assistant',
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '⚠️ Network error: Could not reach the AI service.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#C4F82A] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50 focus:outline-none"
        aria-label="Toggle chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
          <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C4F82A] text-black flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm">DevIgnite Support</p>
                <p className="text-xs text-lime-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-700 mx-auto flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm">Hi there! 👋</h4>
                <p className="text-xs text-slate-500 mt-1">
                  How can I help you today? Ask me about our services, pricing, or book a demo call.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[#C4F82A] text-slate-950 font-medium rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              className="flex-1 px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4F82A] text-slate-800"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#C4F82A] text-black flex items-center justify-center hover:brightness-95 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}