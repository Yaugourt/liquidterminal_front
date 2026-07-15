"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { SearchBar } from "@/components/common";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import {
  categorizeQuestion,
  type Hip4Category,
} from "@/lib/hip4-category";
import { effectiveStatus, type Hip4EffectiveStatus } from "@/lib/hip4/market-formatter";
import { Hip4QuestionCard } from "./Hip4QuestionCard";
import { Hip4MarketCategoryTabs } from "./Hip4MarketCategoryTabs";

type SortKey = "volume" | "newest" | "outcomes";
type StatusKey = "live" | "pending" | "settled" | "all";

interface Hip4MarketGridProps {
  questions: Hip4QuestionWithOutcomesRow[];
  isLoading: boolean;
  /**
   * Row count of the settlements feed (the other source of "settled" on the
   * page). When the questions source carries no settled rows while this feed
   * does (degraded indexer), the "Settled 0" filter would contradict the
   * settlements table, so the pill is hidden instead.
   */
  settlementsCount?: number;
}

const PAGE_SIZE = 24;

export function Hip4MarketGrid({ questions, isLoading, settlementsCount = 0 }: Hip4MarketGridProps) {
  const [category, setCategory] = useState<Hip4Category>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("volume");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("live");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const augmented = useMemo(() => {
    return (Array.isArray(questions) ? questions : []).map((q) => ({
      q,
      eff: effectiveStatus(q),
      category: categorizeQuestion(
        { class: q.class, underlying: q.underlying },
        q.outcomes.length > 1 ? q.outcomes.map((o) => ({ name: o.display_name })) : null
      ),
    }));
  }, [questions]);

  const counts = useMemo(() => {
    const acc: Partial<Record<Hip4Category, number>> = { all: augmented.length };
    for (const a of augmented) {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
    }
    return acc;
  }, [augmented]);

  const statusCounts = useMemo(() => {
    let live = 0, pending = 0, settled = 0;
    for (const a of augmented) {
      if (a.eff === "settled") settled++;
      else if (a.eff === "expired_unresolved") pending++;
      else live++;
    }
    return { live, pending, settled, all: augmented.length };
  }, [augmented]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byCategory = category === "all" ? augmented : augmented.filter((a) => a.category === category);
    const statusMatch = (s: typeof statusFilter, eff: Hip4EffectiveStatus) => {
      if (s === "all") return true;
      if (s === "pending") return eff === "expired_unresolved";
      return eff === s;
    };
    const byStatus = byCategory.filter((a) => statusMatch(statusFilter, a.eff));
    const base = byStatus;
    const searched = q
      ? base.filter(({ q: question }) => {
          const haystack = [
            question.title ?? "",
            question.description ?? "",
            question.underlying ?? "",
            ...question.outcomes.map((o) => o.display_name),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : base;

    const sorted = [...searched];
    if (sort === "volume") {
      sorted.sort((a, b) => (b.q.total_volume ?? 0) - (a.q.total_volume ?? 0));
    } else if (sort === "newest") {
      // "Recent" means freshest event: settled markets sort by resolved_at,
      // live/pending markets sort by upcoming expiry (closest first). The
      // previous version only looked at resolved_at, which is always null for
      // live markets — so sorting was a silent no-op.
      const eventTime = (q: Hip4QuestionWithOutcomesRow): number => {
        if (q.resolved_at) return new Date(q.resolved_at).getTime();
        if (q.expiry) {
          const isoLike = /^\d{8}-\d{4}$/.test(q.expiry)
            ? `${q.expiry.slice(0,4)}-${q.expiry.slice(4,6)}-${q.expiry.slice(6,8)}T${q.expiry.slice(9,11)}:${q.expiry.slice(11,13)}:00Z`
            : q.expiry;
          const t = Date.parse(isoLike);
          return Number.isFinite(t) ? t : 0;
        }
        return 0;
      };
      sorted.sort((a, b) => eventTime(b.q) - eventTime(a.q));
    } else {
      sorted.sort((a, b) => b.q.outcome_count - a.q.outcome_count);
    }
    return sorted.map((a) => a.q);
  }, [augmented, category, search, sort, statusFilter]);

  const resetPage = () => setVisibleCount(PAGE_SIZE);
  const handleCategory = (c: Hip4Category) => { setCategory(c); resetPage(); };
  const handleSearch = (q: string) => { setSearch(q); resetPage(); };
  const handleSort = (s: SortKey) => { setSort(s); resetPage(); };
  const handleStatus = (s: StatusKey) => { setStatusFilter(s); resetPage(); };

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  if (isLoading && questions.length === 0) {
    return <LoadingState message="Loading markets..." withCard />;
  }

  return (
    <div className="space-y-3">
      {/* Status filter + category in one row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-0.5 rounded-md border border-border-subtle bg-surface-2 p-0.5">
          {(["live", "pending", "settled", "all"] as const)
            .filter((s) => s !== "settled" || statusCounts.settled > 0 || settlementsCount === 0)
            .map((s) => {
            const isActive = statusFilter === s;
            const label = s === "live" ? "Live" : s === "pending" ? "Pending" : s === "settled" ? "Settled" : "All";
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStatus(s)}
                className={`rounded px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-surface text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {label}
                <span className="mono ml-1.5 text-text-tertiary/70">{statusCounts[s]}</span>
              </button>
            );
          })}
        </div>

        <Hip4MarketCategoryTabs value={category} onChange={handleCategory} counts={counts} />
      </div>

      {/* Toolbar: search + sort + count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          <BarChart3 size={11} className="text-brand" />
          Markets
          <span className="mono text-text-tertiary/70">· {filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:max-w-xs">
          <SearchBar onSearch={handleSearch} placeholder="Search markets..." debounceMs={200} />
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-border-subtle bg-surface-2 p-0.5">
          {(["volume", "outcomes", "newest"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSort(s)}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                sort === s
                  ? "bg-surface text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {s === "volume" ? "Volume" : s === "outcomes" ? "Outcomes" : "Recent"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No markets found"
          description="Try a different filter, category or search term."
          icon={<BarChart3 className="h-6 w-6" />}
          withCard
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((q, i) => (
              <Hip4QuestionCard
                key={q.question_id ?? q.singleton_outcome_id ?? `idx-${i}`}
                question={q}
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="rounded-md border border-border-subtle bg-surface-2 hover:bg-surface-3 px-4 py-1.5 text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Load more <span className="text-text-tertiary">({filtered.length - visibleCount} left)</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
