"use client";

import { useState } from "react";
import { useWorkoutStore } from "@/store/workout-store";
import { Stepper } from "./stepper";
import { ChevronDown, ChevronUp, Plus, CheckCircle2, Circle, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

export function WarmupCard() {
  const [open, setOpen] = useState(false);
  const {
    warmup,
    setRunningKm,
    toggleRunningDone,
    updateWarmupReps,
    toggleWarmupSet,
    addWarmupSet,
  } = useWorkoutStore();

  // Count how many warmup items are done
  const runningDone = warmup.runningDone ? 1 : 0;
  const setsDone = warmup.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );
  const setsTotal = warmup.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalDone = runningDone + setsDone;
  const totalItems = 1 + setsTotal; // 1 for running
  const allDone = totalDone === totalItems && setsTotal > 0;

  return (
    <div className={cn(
      "mx-3 rounded-2xl border transition-colors",
      allDone ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/50 bg-card"
    )}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
          allDone ? "bg-emerald-500/20" : "bg-muted/60"
        )}>
          <Footprints size={15} className={allDone ? "text-emerald-400" : "text-muted-foreground"} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold">Échauffement</p>
          <p className="text-xs text-muted-foreground">
            {totalDone}/{totalItems} éléments · {warmup.runningKm > 0 ? `${warmup.runningKm} km` : "course + tractions + dips"}
          </p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/40 pt-3">

          {/* Running */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">km</span>
                  <Stepper
                    value={warmup.runningKm}
                    onChange={setRunningKm}
                    step={0.5}
                    min={0}
                    max={20}
                    decimals={1}
                    size="sm"
                    disabled={warmup.runningDone}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={toggleRunningDone}
                className="shrink-0 flex items-center gap-1.5 text-sm font-medium"
              >
                {warmup.runningDone ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <Circle size={22} className="text-muted-foreground/50" />
                )}
              </button>
            </div>
          </div>

          {/* Body exercises (tractions, dips, etc.) */}
          {warmup.exercises.map((ex, exIdx) => (
            <div key={ex.id} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {ex.name}
              </p>
              <div className="space-y-2">
                {ex.sets.map((s, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">
                      {setIdx + 1}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-muted-foreground text-xs shrink-0">reps</span>
                      <Stepper
                        value={s.reps}
                        onChange={(v) => updateWarmupReps(exIdx, setIdx, v)}
                        step={1}
                        min={1}
                        max={50}
                        size="sm"
                        disabled={s.done}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWarmupSet(exIdx, setIdx)}
                      className="shrink-0"
                    >
                      {s.done ? (
                        <CheckCircle2 size={22} className="text-emerald-400" />
                      ) : (
                        <Circle size={22} className="text-muted-foreground/50" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addWarmupSet(exIdx)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <Plus size={13} />
                Ajouter une série
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
