"use client";

import { useWorkoutStore } from "@/store/workout-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/fitness";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trophy, Dumbbell, Clock, CheckCircle2 } from "lucide-react";

interface FinishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  startedAt: Date;
}

export function FinishModal({ open, onOpenChange, sessionId, startedAt }: FinishModalProps) {
  const { exercises, finishSession } = useWorkoutStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.status === "done").length, 0);
  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.filter((s) => s.status === "done").reduce((a, s) => a + s.weightKg * s.reps, 0),
    0
  );
  const durationMins = Math.round((Date.now() - startedAt.getTime()) / 60000);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          durationMinutes: durationMins,
        }),
      });
      finishSession();
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Séance terminée</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 my-2">
          <Stat icon={Clock} label="Durée" value={formatDuration(durationMins)} />
          <Stat icon={Dumbbell} label="Séries" value={String(totalSets)} />
          <Stat icon={Trophy} label="Volume" value={`${Math.round(totalVolume / 1000)}T`} />
        </div>

        {/* Per-exercise summary */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {exercises.map((ex) => {
            const doneSets = ex.sets.filter((s) => s.status === "done");
            if (doneSets.length === 0) return null;
            const best = doneSets.reduce((b, s) => (s.weightKg > b.weightKg ? s : b), doneSets[0]);
            return (
              <div key={ex.exerciseId} className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate text-sm">{ex.nameFr}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {doneSets.length} × {best.weightKg} kg
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-2">
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
            {saving ? "Sauvegarde..." : "Terminer"}
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
