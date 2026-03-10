import { FormEvent, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const WEBHOOK_URL = import.meta.env.VITE_CHAT_WEBHOOK_URL as string | undefined;

function extractReply(data: any): string {
  if (!data) return "El webhook respondió vacío.";
  if (typeof data === "string") return data;
  if (typeof data.reply === "string") return data.reply;
  if (typeof data.message === "string") return data.message;
  if (typeof data.output === "string") return data.output;
  if (typeof data.text === "string") return data.text;
  return JSON.stringify(data, null, 2);
}

export default function WebhookChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hola. Escribe un mensaje y lo enviaré al webhook.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const disabled = useMemo(() => !input.trim() || loading || !WEBHOOK_URL, [input, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const text = input.trim();
    if (!text || !WEBHOOK_URL) return;

    setError("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: text,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          source: "web-chat",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      const assistantReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: extractReply(data),
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: any) {
      const assistantError: ChatMessage = {
        id: crypto.randomUUID(),
        role: "system",
        content:
          err?.name === "AbortError"
            ? "La petición fue cancelada."
            : `Error conectando con el webhook: ${err?.message || "desconocido"}`,
      };

      setMessages((prev) => [...prev, assistantError]);
      setError(err?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border bg-background shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Chat con webhook</h2>
        <p className="text-sm text-muted-foreground">
          {WEBHOOK_URL ? "Webhook conectado." : "Falta VITE_CHAT_WEBHOOK_URL en .env"}
        </p>
      </div>

      <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : msg.role === "assistant"
                  ? "bg-muted"
                  : "bg-amber-100 text-amber-900",
              ].join(" ")}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              Pensando…
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 rounded-xl border px-4 py-3 outline-none"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl border px-4 py-3 font-medium disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      {error && <div className="px-4 pb-4 text-sm text-red-600">Error: {error}</div>}
    </section>
  );
}