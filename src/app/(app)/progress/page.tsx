export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { get1RMHistory, getWeeklyVolumeByMuscle, getTrainedExercises } from "@/lib/progress-data";
import { OrmChart } from "@/components/progress/orm-chart";
import { VolumeChart } from "@/components/progress/volume-chart";
import { ExerciseSelector } from "@/components/progress/exercise-selector";
import { Suspense } from "react";
import { TrendingUp } from "lucide-react";

interface Props {
  searchParams: Promise<{ ex?: string }>;
}

export default async function ProgressPage({ searchParams }: Props) {
  const { ex } = await searchParams;

  const [trainedExercises, weeklyVolume] = await Promise.all([
    getTrainedExercises(),
    getWeeklyVolumeByMuscle(8),
  ]);

  const selectedId = ex ?? trainedExercises[0]?.id;
  const ormData = selectedId ? await get1RMHistory(selectedId, 16) : [];

  // Collect all muscle groups present in volume data
  const muscles = Array.from(
    new Set(weeklyVolume.flatMap((w) => Object.keys(w).filter((k) => k !== "week")))
  );

  return (
    <div className="pb-6">
      <PageHeader title="Progrès" subtitle="Évolution dans le temps" />

      <div className="px-4 space-y-5 pt-2">
        {/* 1RM evolution */}
        <Card className="p-4 border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-brand" />
            <p className="font-semibold text-sm">Évolution 1RM estimé</p>
          </div>

          {trainedExercises.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Complète des séances pour voir tes progrès
            </p>
          ) : (
            <>
              <Suspense fallback={null}>
                <ExerciseSelector exercises={trainedExercises} />
              </Suspense>
              <OrmChart
                data={ormData}
                exerciseName={trainedExercises.find((e) => e.id === selectedId)?.nameFr ?? ""}
              />
            </>
          )}
        </Card>

        {/* Weekly volume by muscle */}
        <Card className="p-4 border-border/50 space-y-3">
          <div>
            <p className="font-semibold text-sm">Volume hebdo par muscle</p>
            <p className="text-xs text-muted-foreground">8 dernières semaines (kg soulevés)</p>
          </div>
          <VolumeChart data={weeklyVolume} muscles={muscles} />
        </Card>

        {/* Personal records */}
        <Card className="p-4 border-border/50">
          <p className="font-semibold text-sm mb-3">Records personnels</p>
          <PersonalRecords exerciseId={selectedId} />
        </Card>
      </div>
    </div>
  );
}

async function PersonalRecords({ exerciseId }: { exerciseId?: string }) {
  if (!exerciseId) return <p className="text-sm text-muted-foreground">Sélectionne un exercice</p>;

  const { prisma } = await import("@/lib/prisma");
  const records = await prisma.personalRecord.findMany({
    where: { userId: "default-user", exerciseId },
    orderBy: { value: "desc" },
    take: 5,
    include: { exercise: { select: { nameFr: true } } },
  });

  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun PR enregistré pour cet exercice</p>;
  }

  return (
    <div className="space-y-2">
      {records.map((r, i) => (
        <div key={r.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {i === 0 && <span className="text-yellow-400">🏆</span>}
            <span className="text-muted-foreground capitalize">{r.recordType}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold">{Math.round(r.value)} kg</span>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
