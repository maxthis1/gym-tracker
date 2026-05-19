export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAllSessions } from "@/lib/stats";
import { formatDuration, formatWeight } from "@/lib/fitness";
import { Calendar, ChevronRight, Clock, Dumbbell } from "lucide-react";
import Link from "next/link";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function weekLabel(date: Date): string {
  const now = new Date();
  const d = new Date(date);

  const nowMonday = getMonday(now);
  const dMonday = getMonday(d);
  const diffWeeks = Math.round((nowMonday.getTime() - dMonday.getTime()) / (7 * 86400000));

  if (diffWeeks === 0) return "Cette semaine";
  if (diffWeeks === 1) return "La semaine dernière";
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function HistoryPage() {
  const sessions = await getAllSessions();

  // Group by week label
  const groups: Map<string, typeof sessions> = new Map();
  for (const s of sessions) {
    const label = weekLabel(s.completedAt!);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(s);
  }

  return (
    <div>
      <PageHeader title="Historique" subtitle={`${sessions.length} séance${sessions.length !== 1 ? "s" : ""}`} />

      <div className="px-4 pt-2 space-y-5 pb-4">
        {sessions.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-3 p-10 border-border/50 text-center">
            <Calendar size={36} className="text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">Aucune séance</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Tes séances terminées apparaîtront ici</p>
            </div>
          </Card>
        )}

        {Array.from(groups.entries()).map(([weekLabel, weekSessions]) => (
          <div key={weekLabel}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {weekLabel}
            </p>
            <div className="space-y-2">
              {weekSessions.map((s) => {
                const volume = s.sets.reduce((acc, set) => acc + set.weightKg * set.reps, 0);
                const setsCount = s.sets.length;

                return (
                  <Link key={s.id} href={`/history/${s.id}`}>
                    <Card className="px-4 py-3.5 border-border/50 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {s.template?.name ?? "Séance libre"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {formatDate(s.completedAt!)}
                          </p>
                        </div>
                        <ChevronRight size={15} className="text-muted-foreground shrink-0 mt-0.5" />
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Dumbbell size={11} />
                          <span className="font-medium text-foreground">{setsCount}</span> séries
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {volume >= 1000 ? `${(volume / 1000).toFixed(1)}T` : `${Math.round(volume)} kg`}
                          </span>{" "}
                          volume
                        </span>
                        {s.durationMinutes && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} />
                            {formatDuration(s.durationMinutes)}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
