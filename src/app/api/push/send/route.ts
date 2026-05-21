import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  // Simple auth check — only allow from internal cron
  const auth = req.headers.get("x-cron-secret");
  if (auth !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, url } = await req.json().catch(() => ({
    title: "GymTracker 💪",
    body: "C'est l'heure de s'entraîner !",
    url: "/workout/new",
  }));

  // Lazy import so module-level init never runs at build time
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails("mailto:mathisbouyer1650@gmail.com", publicKey, privateKey);

  const subs = await prisma.pushSubscription.findMany({ where: { userId: "default-user" } });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url, tag: "reminder" })
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: subs.length });
}
