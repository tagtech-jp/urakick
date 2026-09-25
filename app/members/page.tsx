import { LiveMembersGrid } from "@/components/live-members-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MEMBERS / 裏キック団",
  description:
    "裏キック団 メンバー。配信中のメンバーは LIVE バッジ付きで表示し、クリックでそのまま配信ページへ移動できます。",
};

export default function MembersPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-border/60 pb-8">
        <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
          MEMBERS
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          メンバー
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          配信中のメンバーは{" "}
          <span className="font-bold text-[var(--accent-pink)]">LIVE</span>{" "}
          バッジが付きます。カードをクリックでそのまま配信ページへ。
        </p>
      </header>

      <LiveMembersGrid />
    </section>
  );
}
