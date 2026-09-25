"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LiveStatus } from "@/lib/live-status";
import { members } from "@/content/members";

type ApiResponse = {
  statuses: Record<string, LiveStatus>;
  fetchedAt: number;
};

export function LiveStatusCard() {
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/live-status", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setLiveCount(0);
          return;
        }
        const data = (await res.json()) as ApiResponse;
        if (cancelled) return;
        setLiveCount(
          Object.values(data.statuses).filter((s) => s.isLive).length,
        );
      } catch {
        if (!cancelled) setLiveCount(0);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="card-elevated flex flex-col items-start justify-between gap-4 rounded-lg bg-card p-6 sm:flex-row sm:items-center sm:p-8">
      <div>
        <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
          LIVE STATUS
        </p>
        <p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          {liveCount === null ? (
            <span className="text-foreground/60">取得中...</span>
          ) : liveCount > 0 ? (
            <span>
              <span className="text-[var(--accent-pink)]">{liveCount}名</span>
              が配信中
            </span>
          ) : (
            <span className="text-foreground/85">
              現在、配信中のメンバーはいません
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          全 {members.length} 名 / 1分ごとに自動更新
        </p>
      </div>
      <Link
        href="/members"
        className="rounded-md border border-[var(--accent-kick)]/60 bg-[var(--accent-kick)]/10 px-5 py-2.5 text-sm font-bold tracking-wider text-[var(--accent-kick)] transition-all hover:bg-[var(--accent-kick)]/20"
      >
        メンバー →
      </Link>
    </div>
  );
}
