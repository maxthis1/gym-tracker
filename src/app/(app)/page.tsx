export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, Dumbbell, TrendingUp, Zap, ChevronRight, Clock, Scale } from "lucide-react";
import Link from "next/link";
import { getWeekStats, getStreak, getLastSession } from "@/lib/stats";
import { formatDuration } from "@/lib/fitness";
import { ResumeSessionBanner } from "@/components/workout/resume-session-banner";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  return `${Math.round(kg)} kg`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const [weekStats, streak, lastSession] = await Promise.all([
    getWeekStats(),
    getStreak(),
    getLastSession(),
  ]);

  const weekVolume = weekStats.volume;
  const weekCount = weekStats.count;

  const lastVolume = lastSession
    ? lastSession.sets.reduce((acc, s) => acc + s.weightKg * s.reps, 0)
    : 0;

  return (
    <div className="space-y-1 pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-1">
        <h1 className="text-xl font-bold">{greeting()}, Mathis 👋</h1>
        <p className="text-sm text-muted-foreground">Prêt pour la séance ?</p>
      </div>

      {/* Resume in-progress session (client — reads localStorage) */}
      <div className="pt-2">
        <ResumeSessionBanner />
      </div>

      {/* CTA */}
      <div className="px-4 pt-2 space-y-2">
        <Link href="/workout/new">
          <Button className="w-full h-14 text-base font-semibold bg-brand text-brand-foreground hover:bg-brand/90 gap-2 rounded-2xl">
            <Zap size={20} />
            Démarrer une séance
          </Button>
        </Link>
        <Link href="/measurements">
          <Button
            variant="outline"
            className="w-full h-10 text-sm border-border/50 rounded-2xl gap-2 text-muted-foreground hover:text-foreground"
          >
            <Scale size={16} />
            Ajouter une mesure
          </Button>
        </Link>
      </div>

      {/* Stats semaine */}
      <div className="px-4 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Cette semaine
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Flame} label="Streak" value={`${streak}j`} color="text-orange-400" />
          <StatCard icon={Dumbbell} label="Séances" value={String(weekCount)} color="text-brand" />
          <StatCard icon={TrendingUp} label="Volume" value={formatVolume(weekVolume)} color="text-emerald-400" />
        </div>
      </div>

      {/* Séances cette semaine */}
      {weekStats.sessions.length > 0 && (
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Séances cette semaine
          </p>
          <div className="space-y-2">
            {weekStats.sessions.slice(0, 3).map((s) => {
              const vol = s.sets.reduce((a, set) => a + set.weightKg * set.reps, 0);
              return (
                <Link key={s.id} href={`/history/${s.id}`}>
                  <Card className="flex items-center gap-3 px-4 py-3 border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.template?.name ?? "Séance libre"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.completedAt ? formatDate(s.completedAt) : "—"} · {formatVolume(vol)}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Dernière séance */}
      <div className="px-4 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Dernière séance
        </p>
        {lastSession ? (
          <Link href={`/history/${lastSession.id}`}>
            <Card className="p-4 border-border/50 hover:bg-muted/20 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{lastSession.template?.name ?? "Séance libre"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lastSession.completedAt ? formatDate(lastSession.completedAt) : "—"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground mt-0.5" />
              </div>
              <div className="flex gap-4">
                <MiniStat label="volume" value={formatVolume(lastVolume)} />
                <MiniStat label="séries" value={String(lastSession.sets.length)} />
                {lastSession.durationMinutes && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    {formatDuration(lastSession.durationMinutes)}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Aucune séance enregistrée</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Lance ta première séance pour commencer le suivi
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <Card className="p-3 border-border/50 flex flex-col gap-1">
      <Icon size={18} className={color} />
      <p className="text-lg font-bold leading-none mt-1">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{value}</span> {label}
    </span>
  );
}
