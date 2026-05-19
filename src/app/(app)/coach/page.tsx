import { CoachChat } from "@/components/coach/chat";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function clearHistory() {
  "use server";
  await prisma.coachMessage.deleteMany({ where: { userId: "default-user" } });
  revalidatePath("/coach");
}

export default async function CoachPage() {
  const history = await prisma.coachMessage.findMany({
    where: { userId: "default-user" },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/40 shrink-0">
        <div>
          <h1 className="text-lg font-bold">Coach IA</h1>
          <p className="text-xs text-muted-foreground">Basé sur ton historique</p>
        </div>
        {history.length > 0 && (
          <form action={clearHistory}>
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              Effacer
            </button>
          </form>
        )}
      </div>
      <CoachChat
        initialMessages={history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
