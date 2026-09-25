"use client";

import { useEffect, useMemo, useState } from "react";
import { members, type Member } from "@/content/members";
import type { LiveStatus } from "@/lib/live-status";
import { MemberCard } from "@/components/member-card";

const POLL_INTERVAL_MS = 60_000;

type ApiResponse = {
  statuses: Record<string, LiveStatus>;
  fetchedAt: number;
};

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LiveMembersGrid({
  initialStatuses,
}: {
  initialStatuses?: Record<string, LiveStatus>;
}) {
  const [statuses, setStatuses] = useState<Record<string, LiveStatus>>(
    initialStatuses ?? {},
  );
  const [loading, setLoading] = useState(!initialStatuses);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialStatuses ? new Date() : null,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatuses() {
      try {
        const res = await fetch("/api/live-status", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as ApiResponse;
        if (cancelled) return;
        setStatuses(data.statuses);
        setLastUpdated(new Date(data.fetchedAt));
        setError(false);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchStatuses();
    const interval = setInterval(fetchStatuses, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sortedMembers = useMemo<Member[]>(() => {
    return [...members].sort((a, b) => {
      const aLive = statuses[a.slug]?.isLive ?? false;
      const bLive = statuses[b.slug]?.isLive ?? false;
      if (aLive === bLive) return 0;
      return aLive ? -1 : 1;
    });
  }, [statuses]);

  const liveCount = Object.values(statuses).filter((s) => s.isLive).length;

  return (
    <>
      <p className="mt-3 text-xs text-muted-foreground/80">
        {loading ? (
          <span className="text-foreground/70">取得中...</span>
        ) : error ? (
          <span className="text-[var(--accent-pink)]">
            ● 配信状態の取得に失敗しました
          </span>
        ) : liveCount > 0 ? (
          <span className="font-bold text-[var(--accent-pink)]">
            ● {liveCount}名 配信中
          </span>
        ) : (
          <span>○ 現在配信中のメンバーはいません</span>
        )}
        <span className="mx-2 text-border">/</span>
        <span>全 {members.length} 名</span>
        <span className="mx-2 text-border">/</span>
        <span>最終更新 {formatTime(lastUpdated)}</span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedMembers.map((member) => (
          <MemberCard
            key={member.slug}
            member={member}
            status={statuses[member.slug] ?? { isLive: false }}
          />
        ))}
      </div>
    </>
  );
}
