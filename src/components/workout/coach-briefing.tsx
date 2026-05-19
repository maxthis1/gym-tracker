"use client";

import { useEffect, useState } from "react";
import { Bot, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachBriefingProps {
  templateId: string;
  templateName: string;
}

export function CoachBriefing({ templateId, templateName }: CoachBriefingProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBriefing = async () => {
      try {
        const res = await fetch("/api/coach/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        });

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          accumulated += decoder.decode(value, { stream: true });
          setText(accumulated);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBriefing();
    return () => { cancelled = true; };
  }, [templateId]);

  if (error || (!loading && !text)) return null;

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-brand/20 bg-brand/5 overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <div className="w-6 h-6 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
          {loading ? (
            <Loader2 size={13} className="text-brand animate-spin" />
          ) : (
            <Bot size={13} className="text-brand" />
          )}
        </div>
        <span className="text-xs font-semibold text-brand flex-1">
          Briefing coach
        </span>
        {!loading && (
          collapsed ? <ChevronDown size={14} className="text-brand/60" /> : <ChevronUp size={14} className="text-brand/60" />
        )}
      </button>

      {!collapsed && (
        <div className="px-3.5 pb-3">
          {loading && !text ? (
            <div className="flex gap-1 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:300ms]" />
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-foreground/80">
              {text}
              {loading && <span className="inline-block w-0.5 h-3 bg-brand ml-0.5 animate-pulse" />}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
