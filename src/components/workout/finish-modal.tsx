"use client";

import { useWorkoutStore } from "@/store/workout-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/fitness";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trophy, Dumbbell, Clock, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  startedAt: Date;
  lastSessionVolume?: number | null;
}

export function FinishModal({ open, onOpenChange, sessionId, startedAt, lastSessionVolume }: FinishModalProps) {
  const { exercises, finishSession } = useWorkoutStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const doneSets = exercises.flatMap((ex) => ex.sets.filter((s) => s.status === "done"));
  const totalSets = doneSets.length;
  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.filter((s) => s.status === "done").reduce((a, s) => a + s.weightKg * s.reps, 0),
    0
  );
  const durationMins = Math.round((Date.now() - startedAt.getTime()) / 60000);

  // Volume delta vs last session
  const volumeDelta = lastSessionVolume != null && lastSessionVolume > 0
    ? ((totalVolume - lastSessionVolume) / lastSessionVolume) * 100
    : null;

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          durationMinutes: durationMins,
          notes: notes.trim() || undefined,
        }),
      });
      finishSession();
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  const formatVol = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}T` : `${Math.round(v)} kg`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Séance terminée 🎉</DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 my-2">
          <Stat icon={Clock} label="Durée" value={formatDuration(durationMins)} />
          <Stat icon={Dumbbell} label="Séries" value={String(totalSets)} />
          <Stat icon={Trophy} label="Volume" value={formatVol(totalVolume)} />
        </div>

        {/* Volume comparison */}
        {volumeDelta !== null && (
          <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
            volumeDelta > 0
              ? "bg-emerald-500/10 text-emerald-400"
              : volumeDelta < 0
              ? "bg-orange-500/10 text-orange-400"
              : "bg-muted/50 text-muted-foreground"
          }`}>
            {volumeDelta > 0 ? (
              <TrendingUp size={15} />
            ) : volumeDelta < 0 ? (
              <TrendingDown size={15} />
            ) : (
              <Minus size={15} />
            )}
            <span className="font-semibold">
              {volumeDelta > 0 ? "+" : ""}{Math.round(volumeDelta)}%
            </span>
            <span className="text-xs opacity-75">vs dernière séance</span>
          </div>
        )}

        {/* Per-exercise summary */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {exercises.map((ex) => {
            const done = ex.sets.filter((s) => s.status === "done");
            if (done.length === 0) return null;
            const best = done.reduce((b, s) => (s.weightKg > b.weightKg ? s : b), done[0]);
            return (
              <div key={ex.exerciseId} className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate text-sm">{ex.nameFr}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {done.length} × {best.weightKg} kg
                </span>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (facultatif) — fatigue, ressenti, idées…"
          rows={2}
          className="w-full rounded-2xl bg-muted/50 border border-border/50 px-3 py-2.5 text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand/50"
        />

        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            Continuer
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleFinish}
            disabled={saving}
          >
            {saving ? "Sauvegarde…" : "Terminer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-2xl p-3 flex flex-col gap-1">
      <Icon size={16} className="text-brand" />
      <p className="text-base font-bold leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
