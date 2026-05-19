export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    where: { userId: "default-user" },
    include: { templates: { orderBy: { orderIndex: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Programmes" subtitle="Tes plans d'entraînement" />
      <div className="px-4 pt-2 space-y-3">
        {programs.map((prog) => (
          <Card key={prog.id} className="p-4 border-border/50 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{prog.name}</p>
                  {prog.isActive && (
                    <CheckCircle2 size={16} className="text-brand shrink-0" />
                  )}
                </div>
                {prog.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {prog.description}
                  </p>
                )}
              </div>
              {prog.isActive && (
                <Badge className="bg-brand/15 text-brand border-0 text-xs shrink-0">
                  Actif
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {prog.templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2.5 py-1.5"
                >
                  <ChevronRight size={12} />
                  {tpl.name}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
