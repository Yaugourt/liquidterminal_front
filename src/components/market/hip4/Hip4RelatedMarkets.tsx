"use client";

import { useMemo } from "react";
import { Layers } from "lucide-react";
import { categorizeQuestion } from "@/lib/hip4-category";
import { effectiveStatus, type Hip4EffectiveStatus } from "@/lib/hip4/market-formatter";
import { Hip4QuestionCard } from "./Hip4QuestionCard";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";

interface Hip4RelatedMarketsProps {
  /** The full merged question list (same source as the grid). */
  questions: Hip4QuestionWithOutcomesRow[];
  /** The market currently being viewed — excluded, and used for relatedness. */
  current: Hip4QuestionWithOutcomesRow | null;
  max?: number;
}

function categoryOf(q: Hip4QuestionWithOutcomesRow) {
  return categorizeQuestion(
    { class: q.class, underlying: q.underlying },
    q.outcomes.length > 1 ? q.outcomes.map((o) => ({ name: o.display_name })) : null
  );
}

const STATUS_RANK: Record<Hip4EffectiveStatus, number> = {
  live: 0,
  expired_unresolved: 1,
  settled: 2,
};

/**
 * Related markets — our value-add over the competitor: surfaces other markets in
 * the same category (crypto/macro/…) so users can hop between them. Data is the
 * same merged question list the grid uses, so no extra fetch. Live markets rank
 * first, then by volume.
 */
export function Hip4RelatedMarkets({ questions, current, max = 4 }: Hip4RelatedMarketsProps) {
  const related = useMemo(() => {
    if (!current) return [];
    const cat = categoryOf(current);
    return questions
      .filter((q) => q !== current)
      .map((q) => ({ q, eff: effectiveStatus(q), cat: categoryOf(q) }))
      .filter((x) => x.cat === cat)
      .sort((a, b) => {
        const d = STATUS_RANK[a.eff] - STATUS_RANK[b.eff];
        if (d !== 0) return d;
        return (b.q.total_volume ?? 0) - (a.q.total_volume ?? 0);
      })
      .slice(0, max)
      .map((x) => x.q);
  }, [questions, current, max]);

  if (related.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
        <Layers size={11} className="text-brand" />
        Related Markets
        <span className="mono text-text-tertiary/70">· {related.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {related.map((q, i) => (
          <Hip4QuestionCard key={q.primary_coin ?? q.question_id ?? `rel-${i}`} question={q} />
        ))}
      </div>
    </section>
  );
}
