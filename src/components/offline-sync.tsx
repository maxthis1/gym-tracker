"use client";

import { useEffect } from "react";
import { useWorkoutStore } from "@/store/workout-store";

/** Déclenche la synchronisation des sets en attente dès que le réseau revient */
export function OfflineSync() {
  const syncPendingSets = useWorkoutStore((s) => s.syncPendingSets);
  const pendingSets = useWorkoutStore((s) => s.pendingSets);

  useEffect(() => {
    // Sync on first mount (in case we were offline and came back)
    if (pendingSets.length > 0) syncPendingSets();

    const handleOnline = () => syncPendingSets();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
