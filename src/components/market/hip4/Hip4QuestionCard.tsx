"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Radio } from "lucide-react";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import { Hip4OutcomeBar } from "./Hip4OutcomeBar";

interface Hip4QuestionCardProps {
  question: Hip4QuestionWithOutcomesRow;
  index?: number;
}

function compactUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function categoryBadge(cls: string | null, underlying: string | null): string {
  const c = (cls ?? "").toLowerCase();
  if (!c || c === "custom") return "Custom";
  if (c === "pricebinary") return underlying ? `${underlying} · Price` : "Price Binary";
  return cls ?? "Custom";
}

export function Hip4QuestionCard({ question, index = 0 }: Hip4QuestionCardProps) {
  const settled = question.status === "settled";
  const isSingleton = question.question_id == null;
  const title = question.title || "Untitled market";
  const badge = categoryBadge(question.class, question.underlying);

  const primaryOutcome = question.outcomes[0];
  const primaryCoin = primaryOutcome != null ? `#${primaryOutcome.outcome_id}` : null;
  const href = primaryCoin ? `/market/hip4/${encodeURIComponent(primaryCoin)}` : null;

  const yesProb =
    primaryOutcome?.mid_price != null && Number.isFinite(primaryOutcome.mid_price)
      ? (primaryOutcome.mid_price * 100).toFixed(1)
      : null;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="glass-panel relative flex h-full flex-col gap-3 p-4 overflow-hidden hover:border-border-hover transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {title}
          </h3>
          {question.description && !isSingleton && (
            <p className="mt-1 text-[11px] text-text-muted line-clamp-2">{question.description}</p>
          )}
        </div>
        {settled ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Settled
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-brand-accent/25 bg-brand-accent/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-accent">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider">
        <span className="rounded-md border border-border-subtle bg-white/[0.03] px-1.5 py-0.5 text-text-secondary">
          {badge}
        </span>
        {!isSingleton && (
          <span className="rounded-md border border-border-subtle bg-white/[0.03] px-1.5 py-0.5 text-text-secondary">
            {question.outcome_count} outcomes
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {question.outcomes.map((o, i) => (
          <Hip4OutcomeBar
            key={o.outcome_id}
            outcome={o}
            colorIndex={i}
            delay={Math.min(i * 0.05, 0.25)}
          />
        ))}
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-text-muted border-t border-border-subtle">
        <span className="tabular-nums">{compactUsd(question.total_volume)} vol</span>
        {yesProb && !settled && (
          <span className="tabular-nums font-semibold text-emerald-400">{yesProb}% Yes</span>
        )}
        {question.resolved_at && settled && (
          <span className="tabular-nums">
            {new Date(question.resolved_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}
