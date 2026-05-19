export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { MeasurementForm } from "@/components/measurements/measurement-form";
import { WeightChart } from "@/components/measurements/weight-chart";
import { MeasurementsHistory } from "@/components/measurements/measurements-history";
import { Card } from "@/components/ui/card";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: "default-user" },
    orderBy: { date: "desc" },
    take: 30,
  });

  // Weight chart data (ascending order for chart)
  const withWeight = measurements
    .filter((m) => m.weightKg != null)
    .reverse()
    .map((m) => ({
      date: m.date.toISOString().split("T")[0],
      weight: Number(m.weightKg),
    }));

  // Latest stats
  const latest = measurements[0];
  const prev = measurements.find(
    (m) => m.id !== latest?.id && m.weightKg != null
  );
  const weightDelta =
    latest?.weightKg != null && prev?.weightKg != null
      ? +(Number(latest.weightKg) - Number(prev.weightKg)).toFixed(1)
      : null;

  // Serialise for client components
  const serialised = measurements.map((m) => ({
    id: m.id,
    date: m.date.toISOString().split("T")[0],
    weightKg: m.weightKg != null ? Number(m.weightKg) : null,
    bodyFatPct: m.bodyFatPct != null ? Number(m.bodyFatPct) : null,
    neckCm: m.neckCm != null ? Number(m.neckCm) : null,
    chestCm: m.chestCm != null ? Number(m.chestCm) : null,
    waistCm: m.waistCm != null ? Number(m.waistCm) : null,
    hipsCm: m.hipsCm != null ? Number(m.hipsCm) : null,
    bicepLeftCm: m.bicepLeftCm != null ? Number(m.bicepLeftCm) : null,
    bicepRightCm: m.bicepRightCm != null ? Number(m.bicepRightCm) : null,
    thighLeftCm: m.thighLeftCm != null ? Number(m.thighLeftCm) : null,
    thighRightCm: m.thighRightCm != null ? Number(m.thighRightCm) : null,
    notes: m.notes,
  }));

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold">Mesures</h1>
        <p className="text-sm text-muted-foreground">Poids &amp; mensurations</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Weight stat card */}
        {latest?.weightKg != null ? (
          <Card className="p-4 border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Poids actuel</p>
                <p className="text-3xl font-bold tabular-nums">
                  {Number(latest.weightKg).toFixed(1)}{" "}
                  <span className="text-lg font-normal text-muted-foreground">kg</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(latest.date, "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {weightDelta !== null && (
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${
                      weightDelta > 0
                        ? "text-amber-400"
                        : weightDelta < 0
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {weightDelta > 0 ? (
                      <TrendingUp size={16} />
                    ) : weightDelta < 0 ? (
                      <TrendingDown size={16} />
                    ) : (
                      <Minus size={16} />
                    )}
                    {weightDelta > 0 ? "+" : ""}
                    {weightDelta} kg
                  </div>
                )}
                {latest.bodyFatPct != null && (
                  <span className="text-xs text-muted-foreground">
                    {Number(latest.bodyFatPct).toFixed(1)}% MG
                  </span>
                )}
              </div>
            </div>

            {/* Weight chart */}
            {withWeight.length >= 2 && <WeightChart data={withWeight} />}
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center gap-3 p-8 border-border/50 text-center">
            <Scale size={32} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aucune mesure enregistrée pour l&apos;instant
            </p>
          </Card>
        )}

        {/* New measurement form */}
        <Card className="p-4 border-border/50 space-y-3">
          <h2 className="text-sm font-semibold">Nouvelle mesure</h2>
          <MeasurementForm />
        </Card>

        {/* History */}
        <MeasurementsHistory measurements={serialised} />
      </div>
    </div>
  );
}
