"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { MUSCLE_COLORS } from "@/lib/progress-data";

interface VolumeChartProps {
  data: Record<string, unknown>[];
  muscles: string[];
}

const muscleLabels: Record<string, string> = {
  chest: "Pectoraux",
  back: "Dos",
  quads: "Quadriceps",
  hamstrings: "Ischios",
  glutes: "Fessiers",
  front_delt: "Deltoïde ant.",
  lateral_delt: "Deltoïde lat.",
  rear_delt: "Deltoïde post.",
  triceps: "Triceps",
  biceps: "Biceps",
  calves: "Mollets",
  core: "Core",
  traps: "Trapèzes",
};

export function VolumeChart({ data, muscles }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Pas encore de données
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }} />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}T` : v}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.18 0 0)",
            border: "1px solid oklch(1 0 0 / 10%)",
            borderRadius: "12px",
            fontSize: 11,
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [
            Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}T` : `${Math.round(Number(v))} kg`,
            muscleLabels[String(name)] ?? name,
          ]}
        />
        <Legend
          formatter={(v) => (
            <span style={{ fontSize: 10, color: "oklch(0.7 0 0)" }}>
              {muscleLabels[v] ?? v}
            </span>
          )}
        />
        {muscles.map((muscle) => (
          <Bar
            key={muscle}
            dataKey={muscle}
            stackId="vol"
            fill={MUSCLE_COLORS[muscle] ?? "#6b7280"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
