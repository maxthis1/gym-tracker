"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Analyse ma dernière séance",
  "Comment progresser au bench press ?",
  "Suis-je en surcharge ?",
  "Programme de déload ?",
];

export function CoachChat({ initialMessages = [] }: { initialMessages?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Placeholder for streaming assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const final = accumulated;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: final };
          return updated;
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1)); // remove empty assistant placeholder
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
              <Bot size={28} className="text-brand" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Coach IA</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Je connais ton historique d&apos;entraînement et je peux t&apos;aider à progresser.
              </p>
            </div>
            {/* Quick suggestions */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs text-left px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 hover:bg-muted hover:border-brand/30 transition-colors leading-tight"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} isStreaming={streaming && i === messages.length - 1} />
        ))}

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error.includes("ANTHROPIC_API_KEY")
              ? "⚠️ Clé API Anthropic manquante — ajoute ANTHROPIC_API_KEY dans .env"
              : `Erreur : ${error}`}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions (after first message) */}
      {messages.length > 0 && messages.length < 3 && (
        <div className="px-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SUGGESTIONS.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-muted/60 border border-border/40 hover:border-brand/30 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/40">
        <div className="flex gap-2 items-end bg-muted/50 rounded-2xl border border-border/50 focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/20 transition-all px-3 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question au coach..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[24px] max-h-32"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={streaming}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 self-end",
              input.trim() && !streaming
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {streaming ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-muted" : "bg-brand/15"
        )}
      >
        {isUser ? (
          <User size={14} className="text-muted-foreground" />
        ) : (
          <Bot size={14} className="text-brand" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand text-brand-foreground rounded-tr-sm"
            : "bg-muted/70 rounded-tl-sm"
        )}
      >
        {message.content || (
          <span className="flex gap-1 items-center text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
          </span>
        )}
        {isStreaming && message.content && (
          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
