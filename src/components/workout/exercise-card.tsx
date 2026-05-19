"use client";

import { ExerciseState, useWorkoutStore } from "@/store/workout-store";
import { SetRow } from "./set-row";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MuscleMapMini } from "@/components/exercises/muscle-map-mini";

interface ExerciseCardProps {
  exercise: ExerciseState;
  exIdx: number;
  sessionId: string;
}

export function ExerciseCard({ exercise, exIdx, sessionId }: ExerciseCardProps) {
  const { updateSetField, validateSet, failSet, addSet } = useWorkoutStore();
  const [collapsed, setCollapsed] = useState(false);

  const doneCount = exercise.sets.filter((s) => s.status === "done").length;
  const totalCount = exercise.sets.length;
  const allDone = doneCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card transition-colors overflow-hidden",
        allDone ? "border-emerald-500/30" : "border-border/50"
      )}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Muscle map mini */}
          <MuscleMapMini
            primaryMuscle={exercise.primaryMuscle}
            secondaryMuscles={exercise.secondaryMuscles}
          />
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm leading-tight">{exercise.nameFr}</p>
              {allDone && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {exercise.targetSets} × {exercise.targetRepsMin}
              {exercise.targetRepsMax !== exercise.targetRepsMin
                ? `–${exercise.targetRepsMax}`
                : ""}{" "}
              · RIR {exercise.targetRir} · {exercise.restSeconds}s repos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-sm font-bold text-muted-foreground">
            {doneCount}/{totalCount}
          </span>
          {collapsed ? (
            <ChevronDown size={16} className="text-muted-foreground" />
          ) : (
            <ChevronUp size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Sets */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {exercise.sets.map((set, setIdx) => (
            <SetRow
              key={set.localId}
              set={set}
              exIdx={exIdx}
              setIdx={setIdx}
              equipment={exercise.equipment}
              onUpdate={(field, value) => updateSetField(exIdx, setIdx, field, value)}
              onValidate={() => validateSet(exIdx, setIdx, sessionId)}
              onFail={() => failSet(exIdx, setIdx, sessionId)}
            />
          ))}

          {exercise.notes && (
            <p className="text-xs text-muted-foreground italic px-1 pt-1">{exercise.notes}</p>
          )}

          {/* Add set */}
          <button
            onClick={() => addSet(exIdx)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
          >
            <Plus size={14} />
            Ajouter une série
          </button>
        </div>
      )}
    </div>
  );
}
