"use client";

import { useState, useEffect, useRef } from "react";
import { useWorkoutStore } from "@/store/workout-store";
import { buildExerciseState } from "@/lib/build-exercise-state";
import { Search, X, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseOption {
  id: string;
  nameFr: string;
  primaryMuscle: string;
  secondaryMuscles: string;
  equipment: string;
  category: string;
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Pecs", back: "Dos", quads: "Quadris", hamstrings: "Ischio",
  glutes: "Fessiers", triceps: "Triceps", biceps: "Biceps",
  front_delt: "Delt. avant", lateral_delt: "Delt. latéral", rear_delt: "Delt. arrière",
  core: "Core", calves: "Mollets", traps: "Trapèzes",
};

const MUSCLE_COLORS: Record<string, string> = {
  chest: "bg-orange-500/15 text-orange-400",
  back: "bg-blue-500/15 text-blue-400",
  quads: "bg-emerald-500/15 text-emerald-400",
  hamstrings: "bg-emerald-500/15 text-emerald-400",
  glutes: "bg-pink-500/15 text-pink-400",
  triceps: "bg-red-500/15 text-red-400",
  biceps: "bg-purple-500/15 text-purple-400",
  front_delt: "bg-amber-500/15 text-amber-400",
  lateral_delt: "bg-cyan-500/15 text-cyan-400",
  rear_delt: "bg-teal-500/15 text-teal-400",
  core: "bg-gray-500/15 text-gray-400",
  calves: "bg-lime-500/15 text-lime-400",
  traps: "bg-yellow-500/15 text-yellow-400",
};

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ExercisePicker({ open, onClose, sessionId }: ExercisePickerProps) {
  const { addExercise, exercises: storeExercises } = useWorkoutStore();
  const [allExercises, setAllExercises] = useState<ExerciseOption[]>([]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch exercise list once
  useEffect(() => {
    if (allExercises.length === 0) {
      fetch("/api/exercises")
        .then((r) => r.json())
        .then((d) => setAllExercises(d.exercises ?? []));
    }
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  // Already added exercise ids
  const addedIds = new Set(storeExercises.map((e) => e.exerciseId));

  // Filter
  const filtered = allExercises.filter((ex) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      ex.nameFr.toLowerCase().includes(q) ||
      (MUSCLE_LABELS[ex.primaryMuscle] ?? ex.primaryMuscle).toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    );
  });

  // Group by primary muscle
  const grouped = filtered.reduce<Record<string, ExerciseOption[]>>((acc, ex) => {
    const label = MUSCLE_LABELS[ex.primaryMuscle] ?? ex.primaryMuscle;
    if (!acc[label]) acc[label] = [];
    acc[label].push(ex);
    return acc;
  }, {});

  const handleAdd = async (ex: ExerciseOption) => {
    setAdding(ex.id);
    try {
      // Fetch last performance for pre-fill
      const r = await fetch(`/api/exercises/${ex.id}/last-sets`);
      const { sets: lastSets } = await r.json();

      const secondaryMuscles = (() => {
        try { return JSON.parse(ex.secondaryMuscles ?? "[]"); }
        catch { return []; }
      })();

      const exerciseState = buildExerciseState(
        {
          id: `free-${ex.id}-${Date.now()}`,
          exerciseId: ex.id,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetRir: 2,
          restSeconds: 120,
          notes: "",
          exercise: {
            nameFr: ex.nameFr,
            equipment: ex.equipment,
            primaryMuscle: ex.primaryMuscle,
            secondaryMuscles: ex.secondaryMuscles,
          },
        },
        lastSets
      );

      addExercise(exerciseState);
      onClose();
    } finally {
      setAdding(null);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card rounded-t-3xl border-t border-border/50 max-h-[90dvh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 shrink-0">
          <h2 className="text-base font-bold flex-1">Ajouter un exercice</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-muted/60 rounded-2xl px-3 h-11">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, muscle, équipement…)"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 pb-safe">
          {Object.entries(grouped).map(([muscle, exList]) => (
            <div key={muscle}>
              <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 sticky top-0">
                {muscle}
              </p>
              {exList.map((ex) => {
                const isAdded = addedIds.has(ex.id);
                const isLoading = adding === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => !isAdded && handleAdd(ex)}
                    disabled={isAdded || isLoading}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 border-b border-border/20 text-left transition-colors",
                      isAdded
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-muted/30 active:bg-muted/50"
                    )}
                  >
                    {/* Muscle color dot */}
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      MUSCLE_COLORS[ex.primaryMuscle]?.includes("orange") ? "bg-orange-400" :
                      MUSCLE_COLORS[ex.primaryMuscle]?.includes("blue") ? "bg-blue-400" :
                      MUSCLE_COLORS[ex.primaryMuscle]?.includes("emerald") ? "bg-emerald-400" :
                      MUSCLE_COLORS[ex.primaryMuscle]?.includes("red") ? "bg-red-400" :
                      MUSCLE_COLORS[ex.primaryMuscle]?.includes("purple") ? "bg-purple-400" :
                      "bg-muted-foreground/40"
                    )} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ex.nameFr}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {ex.equipment.replace(/_/g, " ")}
                      </p>
                    </div>

                    {isLoading ? (
                      <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin shrink-0" />
                    ) : isAdded ? (
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0">Ajouté</span>
                    ) : (
                      <Plus size={16} className="text-brand shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-muted-foreground text-sm">Aucun exercice trouvé</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Essaie un autre terme</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
