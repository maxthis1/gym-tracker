"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  nameFr: string;
  primaryMuscle: string;
  equipment: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  push: "bg-orange-500/15 text-orange-400",
  pull: "bg-blue-500/15 text-blue-400",
  legs: "bg-emerald-500/15 text-emerald-400",
  core: "bg-purple-500/15 text-purple-400",
  strength: "bg-brand/15 text-brand",
};

const CATEGORY_LABELS: Record<string, string> = {
  push: "Push", pull: "Pull", legs: "Jambes", core: "Core", strength: "Force",
};

const MUSCLE_FILTERS = [
  { id: "chest",        label: "Pecs" },
  { id: "back",         label: "Dos" },
  { id: "quads",        label: "Quadris" },
  { id: "hamstrings",   label: "Ischio" },
  { id: "glutes",       label: "Fessiers" },
  { id: "triceps",      label: "Triceps" },
  { id: "biceps",       label: "Biceps" },
  { id: "front_delt",   label: "Épaules" },
  { id: "core",         label: "Core" },
  { id: "calves",       label: "Mollets" },
];

interface Props {
  exercises: Exercise[];
}

export function ExerciseList({ exercises }: Props) {
  const [query, setQuery] = useState("");
  const [activeMuscle, setActiveMuscle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = !activeMuscle || ex.primaryMuscle === activeMuscle;
      if (!matchesMuscle) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        ex.nameFr.toLowerCase().includes(q) ||
        ex.primaryMuscle.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q)
      );
    });
  }, [exercises, query, activeMuscle]);

  return (
    <div>
      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 bg-muted/60 rounded-2xl px-3 h-11">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un exercice…"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="shrink-0">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Muscle filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveMuscle(null)}
          className={cn(
            "shrink-0 px-3 h-7 rounded-full text-xs font-medium transition-colors border",
            activeMuscle === null
              ? "bg-brand text-brand-foreground border-transparent"
              : "bg-muted/50 text-muted-foreground border-border/50 hover:border-brand/40"
          )}
        >
          Tous
        </button>
        {MUSCLE_FILTERS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMuscle(activeMuscle === m.id ? null : m.id)}
            className={cn(
              "shrink-0 px-3 h-7 rounded-full text-xs font-medium transition-colors border",
              activeMuscle === m.id
                ? "bg-brand text-brand-foreground border-transparent"
                : "bg-muted/50 text-muted-foreground border-border/50 hover:border-brand/40"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="px-4 pb-2 text-xs text-muted-foreground">
        {filtered.length} exercice{filtered.length !== 1 ? "s" : ""}
        {(query || activeMuscle) && (
          <button
            onClick={() => { setQuery(""); setActiveMuscle(null); }}
            className="ml-2 text-brand hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </p>

      {/* List */}
      <div className="px-4 space-y-1">
        {filtered.length === 0 ? (
          <Card className="p-6 border-border/50 text-center">
            <p className="text-sm text-muted-foreground">Aucun exercice trouvé</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Essaie un autre terme</p>
          </Card>
        ) : (
          filtered.map((ex) => (
            <Link key={ex.id} href={`/exercises/${ex.id}`}>
              <Card className="flex items-center gap-3 px-4 py-3 border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex.nameFr}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {ex.primaryMuscle.replace(/_/g, " ")}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] px-2 py-0.5 rounded-full border-0 shrink-0 ${
                    CATEGORY_COLORS[ex.category] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[ex.category] ?? ex.category}
                </Badge>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
