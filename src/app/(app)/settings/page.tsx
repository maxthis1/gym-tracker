import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { User, Download, ChevronRight, Dumbbell, Scale } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Profil",
    items: [
      { label: "Mon profil", description: "Nom, taille, poids, objectif", icon: User, href: "/settings/profile" },
    ],
  },
  {
    title: "Entraînement",
    items: [
      { label: "Programmes", description: "Gérer mes programmes", icon: Dumbbell, href: "/programs" },
      { label: "Exercices", description: "Bibliothèque d'exercices", icon: Dumbbell, href: "/exercises" },
    ],
  },
  {
    title: "Corps",
    items: [
      { label: "Mesures corporelles", description: "Poids & mensurations", icon: Scale, href: "/measurements" },
    ],
  },
  {
    title: "Données",
    items: [
      { label: "Exporter mes données", description: "CSV / JSON", icon: Download, href: "/settings/export" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Paramètres" />
      <div className="px-4 space-y-5 pt-2">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {section.title}
            </p>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </Link>
              ))}
            </Card>
          </div>
        ))}

        <p className="text-center text-xs text-muted-foreground/50 py-4">
          GymTracker v0.1.0
        </p>
      </div>
    </div>
  );
}
