"use client";

import { Check, X } from "lucide-react";
import { Stepper } from "./stepper";
import { LocalSet, SetStatus } from "@/store/workout-store";
import { cn } from "@/lib/utils";

interface SetRowProps {
  set: LocalSet;
  exIdx: number;
  setIdx: number;
  equipment: string;
  onUpdate: (field: "weightKg" | "reps" | "rir", value: number) => void;
  onValidate: () => void;
  onFail: () => void;
}

const weightStep = (equipment: string) => {
  if (equipment === "barbell") return 2.5;
  if (equipment === "dumbbell") return 1;
  return 2.5;
};

const statusBorder: Record<SetStatus, string> = {
  pending: "border-border/40",
  done: "border-emerald-500/40 bg-emerald-500/5",
  failed: "border-orange-500/40 bg-orange-500/5",
};

export function SetRow({ set, equipment, onUpdate, onValidate, onFail }: SetRowProps) {
  const isDone = set.status === "done";
  const isFailed = set.status === "failed";
  const isLocked = isDone || isFailed;

  return (
    <div className={cn("rounded-2xl border px-3 py-2.5 transition-colors", statusBorder[set.status])}>
      {/* Row 1: set label + status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Série {set.setNumber}{set.isWarmup ? " · Écha." : ""}
        </span>
        {isDone && <span className="text-xs font-semibold text-emerald-400">✓ Validé</span>}
        {isFailed && <span className="text-xs font-semibold text-orange-400">✗ Échec</span>}
      </div>

      {/* Row 2: Weight × Reps — full width, two steppers side by side */}
      <div className="flex items-center gap-2 mb-2">
        <Stepper
          value={set.weightKg}
          onChange={(v) => onUpdate("weightKg", v)}
          step={weightStep(equipment)}
          min={0}
          max={500}
          decimals={1}
          size="sm"
          className="flex-1"
          disabled={isLocked}
        />
        <span className="text-muted-foreground text-sm font-light shrink-0">×</span>
        <Stepper
          value={set.reps}
          onChange={(v) => onUpdate("reps", v)}
          step={1}
          min={1}
          max={100}
          size="sm"
          className="flex-1"
          disabled={isLocked}
        />
      </div>

      {/* Row 3: labels under weight/reps */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] text-muted-foreground flex-1 text-center">kg</span>
        <span className="text-[10px] text-transparent w-4 shrink-0">×</span>
        <span className="text-[10px] text-muted-foreground flex-1 text-center">reps</span>
      </div>

      {/* Row 4: RIR (left) + validate/fail buttons (right) */}
      <div className="flex items-center gap-2">
        {/* RIR compact */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">RIR</span>
          <Stepper
            value={set.rir}
            onChange={(v) => onUpdate("rir", v)}
            step={1}
            min={0}
            max={10}
            size="sm"
            disabled={isLocked}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Validate / Fail */}
        {!isLocked && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onFail}
              className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Échec"
            >
              <X size={18} className="text-orange-400" strokeWidth={2.5} />
            </button>
            <button
              onClick={onValidate}
              className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Valider"
            >
              <Check size={18} className="text-emerald-400" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
