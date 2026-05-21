"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminderHour, setReminderHour] = useState(18);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setSupported(true);
      setEnabled(Notification.permission === "granted" && localStorage.getItem("push-enabled") === "1");
      setReminderHour(Number(localStorage.getItem("push-hour") ?? "18"));
    }
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission refusée", { description: "Active les notifications dans les réglages du navigateur." });
        return;
      }

      // Register service worker if not already
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), reminderHour }),
      });

      localStorage.setItem("push-enabled", "1");
      localStorage.setItem("push-hour", String(reminderHour));
      setEnabled(true);
      toast.success("Notifications activées !", { description: `Rappel quotidien à ${reminderHour}h00` });
    } catch (e) {
      toast.error("Erreur", { description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      localStorage.removeItem("push-enabled");
      setEnabled(false);
      toast.success("Notifications désactivées");
    } catch (e) {
      toast.error("Erreur", { description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("GymTracker 💪", {
      body: "Les notifications fonctionnent !",
      icon: "/icons/icon.svg",
    });
  };

  if (!supported) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${enabled ? "bg-brand/15" : "bg-muted"}`}>
            {enabled ? <Bell size={15} className="text-brand" /> : <BellOff size={15} className="text-muted-foreground" />}
          </div>
          <div>
            <p className="text-sm font-medium">Rappel d&apos;entraînement</p>
            <p className="text-xs text-muted-foreground">{enabled ? `Actif — rappel à ${reminderHour}h00` : "Désactivé"}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={enabled ? unsubscribe : subscribe}
          disabled={loading}
        />
      </div>

      {enabled && (
        <div className="space-y-3 pl-11">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Heure du rappel</label>
            <select
              value={reminderHour}
              onChange={(e) => {
                const h = Number(e.target.value);
                setReminderHour(h);
                localStorage.setItem("push-hour", String(h));
              }}
              className="text-sm bg-muted/50 border border-border/50 rounded-xl px-2 py-1 focus:outline-none"
            >
              {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => (
                <option key={h} value={h}>{h}h00</option>
              ))}
            </select>
          </div>
          <button
            onClick={testNotification}
            className="text-xs text-brand underline-offset-2 hover:underline"
          >
            Tester une notification
          </button>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Pour les rappels quotidiens, configure un cron gratuit sur{" "}
            <span className="text-muted-foreground">cron-job.org</span> pointant vers{" "}
            <code className="text-[11px] bg-muted px-1 rounded">/api/push/send</code>
          </p>
        </div>
      )}
    </div>
  );
}
