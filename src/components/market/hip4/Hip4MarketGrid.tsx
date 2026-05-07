"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import {
  categorizeQuestion,
  type Hip4Category,
} from "@/lib/hip4-category";
import { Hip4QuestionCard } from "./Hip4QuestionCard";
import { Hip4MarketCategoryTabs } from "./Hip4MarketCategoryTabs";

type SortKey = "volume" | "newest" | "outcomes";

interface Hip4MarketGridProps {
  questions: Hip4QuestionWithOutcomesRow[];
  isLoading: boolean;
}

const PAGE_SIZE = 24;

export function Hip4MarketGrid({ questions, isLoading }: Hip4MarketGridProps) {
  const [category, setCategory] = useState<Hip4Category>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("volume");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const augmented = useMemo(() => {
    return (Array.isArray(questions) ? questions : []).map((q) => ({
      q,
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = category === "all" ? augmented : augmented.filter((a) => a.category === category);
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
      sorted.sort((a, b) => {
        const ta = a.q.resolved_at ? new Date(a.q.resolved_at).getTime() : 0;
        const tb = b.q.resolved_at ? new Date(b.q.resolved_at).getTime() : 0;
        return tb - ta;
      });
    } else {
      sorted.sort((a, b) => b.q.outcome_count - a.q.outcome_count);
    }
    return sorted.map((a) => a.q);
  }, [augmented, category, search, sort]);

  const handleCategory = (c: Hip4Category) => {
    setCategory(c);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSort = (s: SortKey) => {
    setSort(s);
    setVisibleCount(PAGE_SIZE);
  };

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  if (isLoading && questions.length === 0) {
    return <LoadingState message="Loading markets..." withCard />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="space-y-4"
    >
      <Hip4MarketCategoryTabs value={category} onChange={handleCategory} counts={counts} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <span className="h-1 w-1 rounded-full bg-brand-accent" />
          Markets
          <span className="text-text-muted/60">· {filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:max-w-sm">
          <SearchBar onSearch={handleSearch} placeholder="Search markets..." debounceMs={200} />
        </div>
        <div className="flex items-center gap-1">
          {(["volume", "outcomes", "newest"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSort(s)}
              className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                sort === s
                  ? "bg-white/[0.06] text-white"
                  : "text-text-muted hover:text-text-secondary"
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
          description="Try a different search or category."
          icon={<BarChart3 className="h-6 w-6" />}
          withCard
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map((q, i) => (
              <Hip4QuestionCard
                key={q.question_id ?? q.singleton_outcome_id ?? `idx-${i}`}
                question={q}
                index={i}
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-xs font-semibold text-text-secondary hover:border-border-hover hover:text-white transition-colors"
              >
                Load more ({filtered.length - visibleCount} left)
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
