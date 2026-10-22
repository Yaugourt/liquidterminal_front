"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4QuestionWithOutcomesRow, Hip4WonBy } from "@/services/indexer/hip4";
import { Hip4OutcomeBar } from "./Hip4OutcomeBar";
import { Hip4WonMark } from "./Hip4WonMark";
import {
  effectiveStatus,
  formatExpiryCountdown,
  hip4QuestionHref,
  isBinaryQuestion,
  isPlaceholderMarketName,
  outcomePrice,
  questionLastTradeAt,
} from "@/lib/hip4/market-formatter";

interface Hip4QuestionCardProps {
  question: Hip4QuestionWithOutcomesRow;
}

function categoryBadge(cls: string | null, underlying: string | null): string {
  const c = (cls ?? "").toLowerCase();
  if (!c || c === "custom") return "Custom";
  if (c === "pricebinary") return underlying ? `${underlying} · Binary` : "Binary";
  if (c === "pricetouch") return underlying ? `${underlying} · Touch` : "Touch";
  if (c === "pricebucket") return underlying ? `${underlying} · Bucket` : "Bucket";
  return cls ?? "Custom";
}

interface ProbRowProps {
  label: string;
  pct: number | null;
  variant: "success" | "danger" | "brand";
  volume?: number | null;
  /** Once the market no longer trades: won, lost, or unknown. */
  won?: boolean | null;
  wonBy?: Hip4WonBy | null;
}

function ProbRow({ label, pct, variant, volume, won, wonBy }: ProbRowProps) {
  const barColor = variant === "success" ? "bg-success" : variant === "danger" ? "bg-danger" : "bg-brand";
  const textColor = variant === "success" ? "text-success" : variant === "danger" ? "text-danger" : "text-brand";
  const dotColor = variant === "success" ? "bg-success" : variant === "danger" ? "bg-danger" : "bg-brand";
  const hasPrice = pct != null && Number.isFinite(pct);
  const safePct = hasPrice ? Math.max(0, Math.min(100, pct as number)) : 0;
  return (
    <div className={`space-y-1${won === false ? " opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
          <span className="min-w-0 text-[12px] font-semibold text-text-primary truncate" title={label}>{label}</span>
          {won && <Hip4WonMark wonBy={wonBy} />}
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
  const closed = eff === "closed";
  const expiredUnresolved = eff === "expired_unresolved";
  // Never render the upstream placeholder name; fall back to an id/ticker label.
  const title = question.title && !isPlaceholderMarketName(question.title)
    ? question.title
    : question.primary_coin
      ? `Market ${question.primary_coin}`
      : question.question_id != null
        ? `Question #${question.question_id}`
        : "Untitled market";
  const badge = categoryBadge(question.class, question.underlying);
  const binary = isBinaryQuestion(question);
  const href = hip4QuestionHref(question);

  const countdown = !settled && !closed ? formatExpiryCountdown(question.expiry ?? null) : null;
  // A closed market's prices are its last trades: say when.
  const lastTradeAt = closed ? questionLastTradeAt(question) : null;

  const inner = (
    <Card className="h-full flex flex-col p-3.5 gap-3 hover:border-border-default transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 flex-1" title={title}>
          {title}
        </h3>
        {settled ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-surface-2 border border-border-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            <CheckCircle2 size={10} />
            Settled
          </span>
        ) : closed ? (
          <span className="shrink-0 inline-flex items-center gap-1 rounded bg-surface-2 border border-border-subtle px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            <Lock size={10} />
            Closed
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
          // Keyed with the index too: a standalone market's two sides share its
          // raw outcome_id (their coins differ).
          question.outcomes.map((o, i) => {
            const isYes = o.display_name === "Yes";
            const isNo = o.display_name === "No";
            const price = outcomePrice(o);
            const variant: "success" | "danger" | "brand" = isYes ? "success" : isNo ? "danger" : "brand";
            return (
              <ProbRow
                key={`${o.outcome_id}-${i}`}
                label={o.display_name}
                pct={price != null ? price * 100 : null}
                variant={variant}
                volume={o.total_volume}
                won={o.won}
                wonBy={question.won_by}
              />
            );
          })
        ) : (
          question.outcomes.map((o, i) => (
            <Hip4OutcomeBar key={`${o.outcome_id}-${i}`} outcome={o} colorIndex={i} wonBy={question.won_by} />
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
          {lastTradeAt && (
            <span>
              Last trade <span className="mono">{new Date(lastTradeAt).toLocaleDateString()}</span>
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
