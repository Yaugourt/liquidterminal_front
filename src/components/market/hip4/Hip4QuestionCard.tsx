"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4QuestionWithOutcomesRow } from "@/services/indexer/hip4";
import { Hip4OutcomeBar } from "./Hip4OutcomeBar";
import { effectiveStatus, formatExpiryCountdown, isBinaryQuestion } from "@/lib/hip4/market-formatter";

interface Hip4QuestionCardProps {
  question: Hip4QuestionWithOutcomesRow;
}

function categoryBadge(cls: string | null, underlying: string | null): string {
  const c = (cls ?? "").toLowerCase();
  if (!c || c === "custom") return "Custom";
  if (c === "pricebinary") return underlying ? `${underlying} · Binary` : "Binary";
  if (c === "pricebucket") return underlying ? `${underlying} · Bucket` : "Bucket";
  return cls ?? "Custom";
}

interface ProbRowProps {
  label: string;
  pct: number | null;
  variant: "success" | "danger" | "brand";
  volume?: number | null;
}

function ProbRow({ label, pct, variant, volume }: ProbRowProps) {
  const barColor = variant === "success" ? "bg-success" : variant === "danger" ? "bg-danger" : "bg-brand";
  const textColor = variant === "success" ? "text-success" : variant === "danger" ? "text-danger" : "text-brand";
  const dotColor = variant === "success" ? "bg-success" : variant === "danger" ? "bg-danger" : "bg-brand";
  const hasPrice = pct != null && Number.isFinite(pct);
  const safePct = hasPrice ? Math.max(0, Math.min(100, pct as number)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          <span className="text-[12px] font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {volume != null && volume > 0 && (
            <span className="mono text-[10px] text-text-tertiary">{compactUsd(volume)}</span>
          )}
          <span className={`mono text-[12.5px] font-semibold ${hasPrice ? textColor : "text-text-tertiary"}`}>
            {hasPrice ? `${safePct.toFixed(1)}%` : "—"}
          </span>
        </div>
      </div>
      <div className="relative h-1 w-full rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor} opacity-70 transition-[width] duration-500 ease-out`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  );
}

export function Hip4QuestionCard({ question }: Hip4QuestionCardProps) {
  const eff = effectiveStatus(question);
  const settled = eff === "settled";
  const expiredUnresolved = eff === "expired_unresolved";
  const title = question.title || "Untitled market";
  const badge = categoryBadge(question.class, question.underlying);
  const binary = isBinaryQuestion(question);

  const primaryOutcome = question.outcomes[0];
  // Prefer the merge-computed tradeable coin (encoded `#<10*outcome+side>`);
  // fall back to the raw outcome coin for legacy callers.
  const primaryCoin =
    question.primary_coin ?? (primaryOutcome != null ? `#${primaryOutcome.outcome_id}` : null);
  const href = primaryCoin ? `/market/hip4/${encodeURIComponent(primaryCoin)}` : null;

  const countdown = !settled ? formatExpiryCountdown(question.expiry ?? null) : null;

  const inner = (
    <Card className="h-full flex flex-col p-3.5 gap-3 hover:border-border-default transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        {settled ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-surface-2 border border-border-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            <CheckCircle2 size={10} />
            Settled
          </span>
        ) : expiredUnresolved ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-gold/10 border border-gold/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
            <Clock size={10} />
            Awaiting resolution
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-success/10 border border-success/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {badge}
        </span>
        {!binary && question.outcome_count > 1 && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            {question.outcome_count} outcomes
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 mt-1 flex-1">
        {binary ? (
          question.outcomes.map((o) => {
            const isYes = o.display_name === "Yes";
            const isNo = o.display_name === "No";
            const pct = o.mid_price != null && Number.isFinite(o.mid_price)
              ? o.mid_price * 100
              : null;
            const variant: "success" | "danger" | "brand" = isYes ? "success" : isNo ? "danger" : "brand";
            return (
              <ProbRow
                key={o.outcome_id}
                label={o.display_name}
                pct={pct}
                variant={variant}
                volume={o.total_volume}
              />
            );
          })
        ) : (
          question.outcomes.map((o, i) => (
            <Hip4OutcomeBar key={o.outcome_id} outcome={o} colorIndex={i} />
          ))
        )}
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between text-[10.5px] text-text-tertiary border-t border-border-subtle">
        <span className="mono">{compactUsd(question.total_volume)} vol</span>
        <div className="flex items-center gap-2">
          {countdown && !settled && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {countdown}
            </span>
          )}
          {question.resolved_at && settled && (
            <span className="mono">
              {new Date(question.resolved_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}
