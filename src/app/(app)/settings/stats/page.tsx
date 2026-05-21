export const dynamic = "force-dynamic";

import { getAllTimeStats } from "@/lib/stats";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Trophy, Dumbbell, Clock, Flame, TrendingUp, BarChart2 } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/fitness";

function formatVolume(kg: number) {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}M kg`;
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  return `${Math.round(kg)} kg`;
}

export default async function AllTimeStatsPage() {
  const stats = await getAllTimeStats();

  const bigStats = [
    {
      icon: TrendingUp,
      label: "Volume total soulevé",
      value: formatVolume(stats.totalVolume),
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Dumbbell,
      label: "Séances complétées",
      value: String(stats.totalSessions),
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      icon: Clock,
      label: "Temps total en salle",
      value: formatDuration(stats.totalDurationMins),
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      icon: BarChart2,
      label: "Exercices différents",
      value: String(stats.uniqueExercises),
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Flame,
      label: "Meilleure série consécutive",
      value: `${stats.longestStreak} j`,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Link href="/settings" className="flex items-center gap-1 text-muted-foreground text-sm">
          <ChevronLeft size={18} /> Paramètres
        </Link>
      </div>

      <div className="px-4">
        <h1 className="text-xl font-bold">Stats all-time</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Depuis le début</p>
      </div>

      {stats.totalSessions === 0 ? (
        <div className="px-4 mt-6">
          <Card className="p-6 border-border/50 text-center">
            <p className="text-muted-foreground text-sm">Complète ta première séance pour voir tes stats !</p>
          </Card>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {/* Big numbers */}
          <div className="grid grid-cols-2 gap-3">
            {bigStats.map((s) => (
              <Card key={s.label} className="p-4 border-border/50 flex flex-col gap-2">
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Top PRs */}
          {stats.topPRs.length > 0 && (
            <Card className="p-4 border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={15} className="text-yellow-400" />
                <p className="text-sm font-semibold">Top Records personnels</p>
              </div>
              <div className="space-y-2.5">
                {stats.topPRs.map((pr, i) => (
                  <div key={pr.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base w-6 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                      </span>
                      <span className="text-sm truncate">{pr.exercise.nameFr}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-sm font-bold">{Math.round(pr.value)} kg</span>
                      <span className="text-xs text-muted-foreground ml-1">1RM</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
