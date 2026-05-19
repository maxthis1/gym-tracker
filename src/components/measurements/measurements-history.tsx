"use client";

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Scale } from "lucide-react";

interface Measurement {
  id: string;
  date: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  neckCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  bicepLeftCm: number | null;
  bicepRightCm: number | null;
  thighLeftCm: number | null;
  thighRightCm: number | null;
  notes: string | null;
}

const LABELS: { key: keyof Measurement; label: string; unit: string }[] = [
  { key: "bodyFatPct", label: "Masse grasse", unit: "%" },
  { key: "neckCm", label: "Cou", unit: "cm" },
  { key: "chestCm", label: "Poitrine", unit: "cm" },
  { key: "waistCm", label: "Taille", unit: "cm" },
  { key: "hipsCm", label: "Hanches", unit: "cm" },
  { key: "bicepLeftCm", label: "Biceps G", unit: "cm" },
  { key: "bicepRightCm", label: "Biceps D", unit: "cm" },
  { key: "thighLeftCm", label: "Cuisse G", unit: "cm" },
  { key: "thighRightCm", label: "Cuisse D", unit: "cm" },
];

interface Props {
  measurements: Measurement[];
}

export function MeasurementsHistory({ measurements }: Props) {
  if (measurements.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground px-1">Historique</h2>
      {measurements.map((m) => {
        const extras = LABELS.filter((l) => m[l.key] != null);
        return (
          <div
            key={m.id}
            className="rounded-2xl border border-border/50 bg-card p-4 space-y-2"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center">
                  <Scale size={14} className="text-brand" />
                </div>
                <span className="text-sm font-semibold capitalize">
                  {format(parseISO(m.date as string), "d MMMM yyyy", { locale: fr })}
                </span>
              </div>
              {m.weightKg != null && (
                <span className="text-lg font-bold text-brand">{m.weightKg} kg</span>
              )}
            </div>

            {/* Detail chips */}
            {extras.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {extras.map((l) => (
                  <span
                    key={l.key}
                    className="text-xs rounded-lg bg-muted/60 px-2 py-0.5 text-muted-foreground"
                  >
                    {l.label}: <span className="text-foreground font-medium">{String(m[l.key])}{l.unit}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            {m.notes && (
              <p className="text-xs text-muted-foreground/70 italic">{m.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
