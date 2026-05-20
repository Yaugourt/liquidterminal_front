"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Radio, Clock } from "lucide-react";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import { Hip4OutcomeBar } from "./Hip4OutcomeBar";
import { formatExpiryCountdown } from "@/lib/hip4/market-formatter";

interface Hip4QuestionCardProps {
  question: Hip4QuestionWithOutcomesRow;
  index?: number;
}

function categoryBadge(cls: string | null, underlying: string | null): string {
  const c = (cls ?? "").toLowerCase();
  if (!c || c === "custom") return "Custom";
  if (c === "pricebinary") return underlying ? `${underlying} · Price` : "Price Binary";
  return cls ?? "Custom";
}

interface ProbRowProps {
  label: string;
  pct: number;
  color: "emerald" | "rose" | "brand";
  volume?: number | null;
}

function ProbRow({ label, pct, color, volume }: ProbRowProps) {
  const barColor = color === "emerald" ? "bg-emerald-500" : color === "rose" ? "bg-rose-500" : "bg-brand";
  const textColor = color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-brand";
  const dotColor = color === "emerald" ? "bg-emerald-400" : color === "rose" ? "bg-rose-400" : "bg-brand";
  const safePct = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {volume != null && (
            <span className="text-[10px] text-text-tertiary tabular-nums">{compactUsd(volume)}</span>
          )}
          <span className={`text-sm font-bold tabular-nums ${textColor}`}>{safePct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safePct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 rounded-full ${barColor} opacity-70`}
        />
      </div>
    </div>
  );
}

function isBinaryMarket(question: Hip4QuestionWithOutcomesRow): boolean {
  if (question.outcomes.length !== 2) return false;
  const names = question.outcomes.map((o) => o.display_name);
  return names.includes("Yes") || names.includes("No");
}

export function Hip4QuestionCard({ question, index = 0 }: Hip4QuestionCardProps) {
  const settled = question.status === "settled";
  const title = question.title || "Untitled market";
  const badge = categoryBadge(question.class, question.underlying);
  const binary = isBinaryMarket(question);

  const primaryOutcome = question.outcomes[0];
  const primaryCoin = primaryOutcome != null ? `#${primaryOutcome.outcome_id}` : null;
  const href = primaryCoin ? `/market/hip4/${encodeURIComponent(primaryCoin)}` : null;

  const countdown = !settled ? formatExpiryCountdown(question.expiry ?? null) : null;

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="bg-surface border border-border-subtle rounded-lg relative flex h-full flex-col gap-3 p-4 overflow-hidden hover:border-border-default transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
        {settled ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Settled
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-brand/25 bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wider">
        <span className="rounded-md border border-border-subtle bg-white/[0.03] px-1.5 py-0.5 text-text-secondary">
          {badge}
        </span>
        {!binary && question.outcome_count > 1 && (
          <span className="rounded-md border border-border-subtle bg-white/[0.03] px-1.5 py-0.5 text-text-secondary">
            {question.outcome_count} outcomes
          </span>
        )}
      </div>

      {/* Outcomes */}
      <div className="flex flex-col gap-2.5 mt-1">
        {binary ? (
          question.outcomes.map((o) => {
            const isYes = o.display_name === "Yes";
            const isNo = o.display_name === "No";
            const pct = o.mid_price != null && Number.isFinite(o.mid_price)
              ? o.mid_price * 100
              : 0;
            const color: "emerald" | "rose" | "brand" = isYes ? "emerald" : isNo ? "rose" : "brand";
            return (
              <ProbRow
                key={o.outcome_id}
                label={o.display_name}
                pct={pct}
                color={color}
                volume={o.total_volume}
              />
            );
          })
        ) : (
          question.outcomes.map((o, i) => (
            <Hip4OutcomeBar
              key={o.outcome_id}
              outcome={o}
              colorIndex={i}
              delay={Math.min(i * 0.05, 0.25)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-text-tertiary border-t border-border-subtle">
        <span className="tabular-nums">{compactUsd(question.total_volume)} vol</span>
        <div className="flex items-center gap-2">
          {countdown && !settled && (
            <span className="flex items-center gap-1 text-text-tertiary/70">
              <Clock className="h-3 w-3" />
              {countdown}
            </span>
          )}
          {question.resolved_at && settled && (
            <span className="tabular-nums">
              {new Date(question.resolved_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}
