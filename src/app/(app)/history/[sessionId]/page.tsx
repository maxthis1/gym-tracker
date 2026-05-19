import { getSessionDetail } from "@/lib/stats";
import { notFound } from "next/navigation";
import { formatDuration, estimate1RM, formatWeight } from "@/lib/fitness";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, Dumbbell, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { DeleteSessionButton } from "@/components/history/delete-session-button";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const session = await getSessionDetail(sessionId);
  if (!session) notFound();

  const workingSets = session.sets.filter((s) => !s.isWarmup);
  const totalVolume = workingSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
  const date = new Date(session.completedAt ?? session.date);

  // Group sets by exercise (in template order if possible)
  const templateOrder = session.template?.exercises.map((te) => te.exerciseId) ?? [];
  const setsByExercise = new Map<string, typeof session.sets>();

  for (const set of session.sets) {
    if (!setsByExercise.has(set.exerciseId)) setsByExercise.set(set.exerciseId, []);
    setsByExercise.get(set.exerciseId)!.push(set);
  }

  const exerciseIds = [
    ...templateOrder.filter((id) => setsByExercise.has(id)),
    ...[...setsByExercise.keys()].filter((id) => !templateOrder.includes(id)),
  ];

  return (
    <div className="pb-6">
      {/* Back + Delete */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link href="/history" className="flex items-center gap-1 text-muted-foreground text-sm">
          <ChevronLeft size={18} /> Historique
        </Link>
        <DeleteSessionButton sessionId={sessionId} />
      </div>

      {/* Header */}
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold">{session.template?.name ?? "Séance libre"}</h1>
        <p className="text-sm text-muted-foreground capitalize mt-0.5">
          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Summary stats */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-5">
        <SummaryCard
          icon={Dumbbell}
          label="Séries"
          value={String(workingSets.length)}
          color="text-brand"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Volume"
          value={totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}T` : `${Math.round(totalVolume)} kg`}
          color="text-emerald-400"
        />
        {session.durationMinutes ? (
          <SummaryCard
            icon={Clock}
            label="Durée"
            value={formatDuration(session.durationMinutes)}
            color="text-orange-400"
          />
        ) : (
          <SummaryCard icon={Trophy} label="PRs" value="—" color="text-yellow-400" />
        )}
      </div>

      {/* Exercises */}
      <div className="px-4 space-y-3">
        {exerciseIds.map((exId) => {
          const sets = setsByExercise.get(exId)!;
          const exercise = sets[0].exercise;
          const workingOnly = sets.filter((s) => !s.isWarmup);
          const best = workingOnly.reduce(
            (b, s) => (estimate1RM(s.weightKg, s.reps) > estimate1RM(b.weightKg, b.reps) ? s : b),
            workingOnly[0] ?? sets[0]
          );

          return (
            <Card key={exId} className="overflow-hidden border-border/50">
              <div className="px-4 py-3 border-b border-border/40">
                <p className="font-semibold text-sm">{exercise.nameFr}</p>
                {best && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Meilleur : {formatWeight(best.weightKg)} kg × {best.reps} reps
                    {best.rir !== null ? ` @ RIR ${best.rir}` : ""}
                    <span className="ml-1.5 text-muted-foreground/60">
                      (~{Math.round(estimate1RM(best.weightKg, best.reps))} kg 1RM)
                    </span>
                  </p>
                )}
              </div>

              <div className="divide-y divide-border/30">
                {sets.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">
                      {s.isWarmup ? "Écha." : `Série ${s.setNumber}`}
                    </span>
                    <span className="text-sm font-semibold flex-1">
                      {formatWeight(s.weightKg)} kg × {s.reps}
                    </span>
                    {s.rir !== null && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        RIR {s.rir}
                      </Badge>
                    )}
                    {s.isFailure && (
                      <Badge className="text-[10px] px-1.5 py-0.5 bg-orange-500/15 text-orange-400 border-0">
                        Échec
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <Card className="p-3 border-border/50 flex flex-col gap-1">
      <Icon size={16} className={color} />
      <p className="text-base font-bold leading-none mt-1">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
