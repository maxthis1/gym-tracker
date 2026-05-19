"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface DataPoint { date: string; oneRM: number }

interface OrmChartProps {
  data: DataPoint[];
  exerciseName: string;
}

export function OrmChart({ data, exerciseName }: OrmChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Pas encore de données pour cet exercice
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.oneRM));
  const first = data[0]?.oneRM ?? 0;
  const last = data[data.length - 1]?.oneRM ?? 0;
  const diff = last - first;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-2xl font-bold">{last} kg</p>
          <p className="text-xs text-muted-foreground">1RM estimé actuel</p>
        </div>
        {data.length > 1 && (
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
            diff >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}>
            {diff >= 0 ? "+" : ""}{diff} kg
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
            tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.18 0 0)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "12px",
              fontSize: 12,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [`${v} kg`, "1RM"]}
            labelFormatter={(l) => new Date(l).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          />
          <ReferenceLine y={max} stroke="oklch(0.75 0.18 75 / 30%)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="oneRM"
            stroke="oklch(0.75 0.18 75)"
            strokeWidth={2.5}
            dot={{ fill: "oklch(0.75 0.18 75)", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
