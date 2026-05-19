"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface StartWorkoutButtonProps {
  templateId: string;
  children: React.ReactNode;
  className?: string;
}

export function StartWorkoutButton({ templateId, children, className }: StartWorkoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const { sessionId } = await res.json();
      router.push(`/workout/${sessionId}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleStart} disabled={loading} className={className}>
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
