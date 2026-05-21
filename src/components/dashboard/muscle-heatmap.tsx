// Server component — no "use client" needed

const MUSCLE_GROUPS = [
  { id: "chest",        label: "Pecs",      emoji: "🫁" },
  { id: "back",         label: "Dos",       emoji: "🔙" },
  { id: "quads",        label: "Quadris",   emoji: "🦵" },
  { id: "hamstrings",   label: "Ischio",    emoji: "🦵" },
  { id: "glutes",       label: "Fessiers",  emoji: "🍑" },
  { id: "triceps",      label: "Triceps",   emoji: "💪" },
  { id: "biceps",       label: "Biceps",    emoji: "💪" },
  { id: "front_delt",   label: "Delt. av.", emoji: "🫷" },
  { id: "lateral_delt", label: "Delt. lat", emoji: "↔️" },
  { id: "core",         label: "Core",      emoji: "🎯" },
  { id: "calves",       label: "Mollets",   emoji: "🦶" },
  { id: "traps",        label: "Trapèzes",  emoji: "🏔️" },
];

function heatColor(vol: number, max: number): string {
  if (max === 0 || vol === 0) return "bg-muted/40 text-muted-foreground/50";
  const ratio = vol / max;
  if (ratio > 0.66) return "bg-brand/80 text-brand-foreground font-semibold";
  if (ratio > 0.33) return "bg-brand/40 text-brand";
  return "bg-brand/15 text-brand/70";
}

interface Props {
  volumeByMuscle: Record<string, number>;
}

export function MuscleHeatmap({ volumeByMuscle }: Props) {
  const maxVol = Math.max(...Object.values(volumeByMuscle), 1);
  const trained = MUSCLE_GROUPS.filter((m) => (volumeByMuscle[m.id] ?? 0) > 0);

  if (trained.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        Aucune séance cette semaine
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {MUSCLE_GROUPS.map((m) => {
        const vol = volumeByMuscle[m.id] ?? 0;
        return (
          <div
            key={m.id}
            className={`rounded-xl px-1 py-2 flex flex-col items-center gap-0.5 transition-colors ${heatColor(vol, maxVol)}`}
          >
            <span className="text-base leading-none">{m.emoji}</span>
            <span className="text-[10px] leading-tight text-center">{m.label}</span>
            {vol > 0 && (
              <span className="text-[9px] opacity-70">
                {vol >= 1000 ? `${(vol / 1000).toFixed(1)}T` : `${Math.round(vol)}kg`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
