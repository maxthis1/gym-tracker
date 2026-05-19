"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Point {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: Point[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">
        {format(parseISO(label), "d MMM", { locale: fr })}
      </p>
      <p className="font-bold text-foreground">{payload[0].value} kg</p>
    </div>
  );
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const first = data[0].weight;
  const last = data[data.length - 1].weight;
  const delta = +(last - first).toFixed(1);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <span className="text-sm font-semibold text-foreground">Évolution du poids</span>
        <span
          className={`text-xs font-semibold ${
            delta > 0 ? "text-amber-400" : delta < 0 ? "text-emerald-400" : "text-muted-foreground"
          }`}
        >
          {delta > 0 ? "+" : ""}{delta} kg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(parseISO(v), "d/M")}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[min - 1, max + 1]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={first} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.3} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--brand))"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(var(--brand))", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "hsl(var(--brand))", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
