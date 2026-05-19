"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const GOALS = [
  { value: "hypertrophy", label: "Hypertrophie" },
  { value: "strength", label: "Force" },
  { value: "endurance", label: "Endurance" },
  { value: "weight_loss", label: "Perte de poids" },
  { value: "maintenance", label: "Maintien" },
];

const LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function ProfilePage() {
  const [name, setName] = useState("Mathis");
  const [heightCm, setHeightCm] = useState("185");
  const [weightKg, setWeightKg] = useState("80");
  const [goal, setGoal] = useState("hypertrophy");
  const [level, setLevel] = useState("intermediate");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400)); // optimistic UX
    setSaving(false);
    toast.success("Profil mis à jour");
  };

  return (
    <div className="min-h-full pb-8">
      <div className="flex items-center gap-2 px-4 pt-5 pb-4">
        <Link href="/settings" className="text-muted-foreground">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Mon profil</h1>
          <p className="text-sm text-muted-foreground">Informations personnelles</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Avatar placeholder */}
        <div className="flex justify-center py-2">
          <div className="w-20 h-20 rounded-full bg-brand/15 flex items-center justify-center">
            <User size={36} className="text-brand" />
          </div>
        </div>

        <Card className="p-4 border-border/50 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Prénom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl bg-muted/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Taille (cm)</Label>
              <Input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="h-10 rounded-xl bg-muted/50 border-border/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Poids (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="h-10 rounded-xl bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border/50 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Objectif</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                    goal === g.value
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-border/50 text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Niveau</Label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors ${
                    level === l.value
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-border/50 text-muted-foreground hover:border-brand/40"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
