"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileJson, FileText, Download, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ExportOption {
  type: "sessions" | "measurements";
  format: "json" | "csv";
  label: string;
  description: string;
  icon: React.ElementType;
}

const OPTIONS: ExportOption[] = [
  {
    type: "sessions",
    format: "json",
    label: "Séances — JSON",
    description: "Toutes les séances et séries au format JSON",
    icon: FileJson,
  },
  {
    type: "sessions",
    format: "csv",
    label: "Séances — CSV",
    description: "Toutes les séances et séries au format tableur",
    icon: FileText,
  },
  {
    type: "measurements",
    format: "json",
    label: "Mesures — JSON",
    description: "Poids et mensurations au format JSON",
    icon: FileJson,
  },
  {
    type: "measurements",
    format: "csv",
    label: "Mesures — CSV",
    description: "Poids et mensurations au format tableur",
    icon: FileText,
  },
];

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (opt: ExportOption) => {
    const key = `${opt.type}-${opt.format}`;
    setLoading(key);
    try {
      const res = await fetch(
        `/api/export?type=${opt.type}&format=${opt.format}`
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${opt.type}.${opt.format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${opt.label} téléchargé`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-full pb-8">
      <div className="flex items-center gap-2 px-4 pt-5 pb-4">
        <Link href="/settings" className="text-muted-foreground">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Exporter mes données</h1>
          <p className="text-sm text-muted-foreground">
            Télécharge tes données brutes
          </p>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {OPTIONS.map((opt) => {
          const key = `${opt.type}-${opt.format}`;
          const isLoading = loading === key;
          return (
            <Card
              key={key}
              className="flex items-center gap-3 px-4 py-3.5 border-border/50"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <opt.icon size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleExport(opt)}
                className="shrink-0 h-8 px-3 rounded-xl border-border/50 gap-1.5 text-xs"
              >
                {isLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                {isLoading ? "" : "Télécharger"}
              </Button>
            </Card>
          );
        })}

        <p className="text-xs text-muted-foreground/50 text-center pt-2">
          Les données exportées contiennent uniquement tes entraînements terminés.
        </p>
      </div>
    </div>
  );
}
