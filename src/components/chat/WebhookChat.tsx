import { FormEvent, useMemo, useRef, useState } from 'react';
import { Bot, SendHorizonal, Sparkles } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const WEBHOOK_URL = import.meta.env.VITE_CHAT_WEBHOOK_URL as string | undefined;

function extractReply(data: unknown): string {
  if (!data) return 'El webhook respondio vacio.';
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) {
    const replyData = data as Record<string, unknown>;
    if (typeof replyData.response === 'string') return replyData.response;
    if (typeof replyData.reply === 'string') return replyData.reply;
    if (typeof replyData.message === 'string') return replyData.message;
    if (typeof replyData.output === 'string') return replyData.output;
    if (typeof replyData.text === 'string') return replyData.text;
  }
  return JSON.stringify(data, null, 2);
}

export default function WebhookChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Hola. Haz una pregunta sobre el panel y la enviaremos al webhook.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const disabled = useMemo(() => !input.trim() || loading || !WEBHOOK_URL, [input, loading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const text = input.trim();
    if (!text || !WEBHOOK_URL) return;

    setError('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: text,
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
          source: 'web-chat',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      const assistantReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: extractReply(data),
      };

      setMessages((previous) => [...previous, assistantReply]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      const isAbort = err instanceof DOMException && err.name === 'AbortError';

      const assistantError: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: isAbort ? 'La peticion fue cancelada.' : `Error conectando con el webhook: ${message}`,
      };

      setMessages((previous) => [...previous, assistantError]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-100">
            <Bot className="h-3.5 w-3.5" />
            Webhook Chat
          </div>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {WEBHOOK_URL ? 'Connected' : 'Missing VITE_CHAT_WEBHOOK_URL'}
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Conversational assistant</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ask follow-up questions while keeping the dashboard context visible.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={[
                'max-w-[88%] rounded-[24px] px-4 py-3 text-sm leading-7 whitespace-pre-wrap',
                message.role === 'user'
                  ? 'border border-cyan-300/20 bg-cyan-300/15 text-cyan-50'
                  : message.role === 'assistant'
                    ? 'border border-white/10 bg-slate-950/35 text-slate-100'
                    : 'border border-amber-300/20 bg-amber-300/10 text-amber-100',
              ].join(' ')}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-[24px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse text-cyan-200" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-5">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 rounded-[22px] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-cyan-300/30"
          />
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-[22px] border border-cyan-300/20 bg-cyan-300/15 px-4 py-3 text-sm font-medium text-cyan-50 transition-colors hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
            Enviar
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-rose-200">Error: {error}</div>}
      </form>
    </section>
  );
}
