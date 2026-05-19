export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { StartWorkoutButton } from "@/components/workout/start-workout-button";
import { Clock, ChevronRight } from "lucide-react";

const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function NewWorkoutPage() {
  const program = await prisma.program.findFirst({
    where: { userId: "default-user", isActive: true },
    include: {
      templates: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  return (
    <div>
      <PageHeader title="Nouvelle séance" subtitle="Choisis ton entraînement" />
      <div className="px-4 pt-2 space-y-3">
        {!program && (
          <Card className="p-4 border-border/50 text-center text-sm text-muted-foreground">
            Aucun programme actif.
          </Card>
        )}
        {program?.templates.map((tpl) => {
          const totalSets = tpl.exercises.reduce((acc, te) => acc + te.targetSets, 0);
          const estMins = Math.round(
            tpl.exercises.reduce(
              (acc, te) => acc + te.targetSets * ((te.restSeconds + 45) / 60),
              0
            )
          );

          return (
            <StartWorkoutButton
              key={tpl.id}
              templateId={tpl.id}
              className="w-full text-left"
            >
              <Card className="p-4 border-border/50 hover:border-brand/40 hover:bg-muted/10 transition-all active:scale-[.98] cursor-pointer w-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{tpl.name}</p>
                      {tpl.dayOfWeek !== null && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          {dayNames[tpl.dayOfWeek]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tpl.exercises.map((te) => te.exercise.nameFr).slice(0, 3).join(" · ")}
                      {tpl.exercises.length > 3 && ` +${tpl.exercises.length - 3}`}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground mt-0.5" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Stat label="exercices" value={tpl.exercises.length} />
                  <Stat label="séries" value={totalSets} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    ~{estMins} min
                  </div>
                </div>
              </Card>
            </StartWorkoutButton>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{value}</span> {label}
    </span>
  );
}
