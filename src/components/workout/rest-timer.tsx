"use client";

import { useWorkoutStore } from "@/store/workout-store";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function RestTimer() {
  const { restTimer, stopTimer, addRestTime } = useWorkoutStore();

  if (!restTimer.active) return null;

  const pct = restTimer.total > 0 ? restTimer.remaining / restTimer.total : 0;
  const mins = Math.floor(restTimer.remaining / 60);
  const secs = restTimer.remaining % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;

  const isUrgent = restTimer.remaining <= 10;

  return (
    <div
      className={cn(
        "fixed top-0 inset-x-0 z-40 px-4 pt-safe",
        "bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg",
        "transition-colors",
        isUrgent && "bg-orange-500/10 border-orange-500/30"
      )}
    >
      <div className="flex items-center gap-3 py-2.5">
        {/* Circular progress */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={radius} strokeWidth="3" className="stroke-muted fill-none" />
            <circle
              cx="24" cy="24" r={radius}
              strokeWidth="3"
              fill="none"
              stroke={isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.75 0.18 75)"}
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums",
            isUrgent ? "text-orange-400" : "text-brand"
          )}>
            {timeStr}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Repos</p>
          <p className="text-sm font-medium truncate">{restTimer.label}</p>
        </div>

        <button
          onClick={stopTimer}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Quick time buttons */}
      <div className="flex gap-2 pb-2.5">
        {[-30, +30, +60].map((delta) => (
          <button
            key={delta}
            onClick={() => addRestTime(delta)}
            className={cn(
              "flex-1 h-7 rounded-xl text-xs font-semibold transition-colors",
              delta < 0
                ? "bg-muted/60 text-muted-foreground hover:bg-muted"
                : "bg-brand/15 text-brand hover:bg-brand/25"
            )}
          >
            {delta > 0 ? `+${delta}s` : `${delta}s`}
          </button>
        ))}
        {/* Skip */}
        <button
          onClick={stopTimer}
          className="flex-1 h-7 rounded-xl text-xs font-semibold bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
