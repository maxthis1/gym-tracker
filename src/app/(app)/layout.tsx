import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {/* Main scrollable content — bottom padding = nav height + safe area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="page-enter">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
