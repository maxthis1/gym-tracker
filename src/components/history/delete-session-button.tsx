"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  sessionId: string;
}

export function DeleteSessionButton({ sessionId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Séance supprimée");
      router.push("/history");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression");
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="flex items-center gap-1.5 text-xs text-destructive/70 hover:text-destructive px-2 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
        disabled={deleting}
      >
        {deleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        Supprimer
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
          <AlertDialogDescription>
            Toutes les séries enregistrées seront définitivement supprimées.
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
