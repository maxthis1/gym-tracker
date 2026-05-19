"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Field { key: string; label: string; unit: string }

const FIELDS: Field[] = [
  { key: "weightKg", label: "Poids", unit: "kg" },
  { key: "bodyFatPct", label: "Masse grasse", unit: "%" },
  { key: "neckCm", label: "Cou", unit: "cm" },
  { key: "chestCm", label: "Poitrine", unit: "cm" },
  { key: "waistCm", label: "Taille", unit: "cm" },
  { key: "hipsCm", label: "Hanches", unit: "cm" },
  { key: "bicepLeftCm", label: "Biceps gauche", unit: "cm" },
  { key: "bicepRightCm", label: "Biceps droit", unit: "cm" },
  { key: "thighLeftCm", label: "Cuisse gauche", unit: "cm" },
  { key: "thighRightCm", label: "Cuisse droite", unit: "cm" },
];

export function MeasurementForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== "") data[k] = parseFloat(v);
    }
    if (Object.keys(data).length === 0) {
      toast.error("Remplis au moins un champ");
      return;
    }
    if (notes) data.notes = notes;
    setSaving(true);
    try {
      await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Mesure enregistrée");
      router.refresh();
      setValues({});
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, unit }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {label} ({unit})
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="—"
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="h-10 rounded-xl bg-muted/50 border-border/50 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Notes</Label>
        <Input
          placeholder="Note optionnelle..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-10 rounded-xl bg-muted/50 border-border/50 text-sm"
        />
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="w-full h-11 rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
      </Button>
    </form>
  );
}
