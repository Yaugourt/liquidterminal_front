"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardHead, Skeleton } from "@/components/common";
import { cn } from "@/lib/utils";
import type { InsightTone, WalletInsight } from "./walletInsights";

const INSIGHT_DOT: Record<InsightTone, string> = {
  good: "bg-success",
  warn: "bg-gold",
  neutral: "bg-brand",
};

/** Rule-derived findings — one line each, the crossed feeds in the tooltip. */
export function WalletInsightList({ insights, className }: { insights: WalletInsight[]; className?: string }) {
  if (insights.length === 0) return null;
  return (
    <ul className={cn("px-3.5 py-2.5 space-y-1", className)}>
      {insights.map((i) => (
        <li key={i.id} className="flex items-start gap-2 text-[11.5px] leading-[18px] text-text-secondary" title={i.source}>
          <span className={cn("mt-[6px] h-1.5 w-1.5 rounded-full shrink-0", INSIGHT_DOT[i.tone])} />
          <span className="min-w-0">
            {i.text}
            {i.href && (
              <>
                {" "}
                <Link href={i.href} className="text-brand hover:text-brand-hover whitespace-nowrap">
                  {i.hrefLabel ?? "Open"} →
                </Link>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The digest's findings as their own block, right under the KPI ribbon (beside
 * the performance chart on the tracker) — the crossed read of the wallet
 * before its holdings and transactions.
 */
export function WalletInsightsCard({
  insights,
  loading = false,
  className,
}: {
  insights: WalletInsight[];
  /** Feeds still resolving — placeholder lines instead of an empty verdict. */
  loading?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHead
        title="What the data says"
        tag={<span className="max-sm:hidden">hover a line for its sources</span>}
      />
      {insights.length > 0 ? (
        <WalletInsightList insights={insights} className="flex-1 overflow-y-auto" />
      ) : loading ? (
        <div className="px-3.5 py-3 space-y-2">
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      ) : (
        <p className="px-3.5 py-3 text-[11.5px] text-text-tertiary">Not enough history to cross yet.</p>
      )}
    </Card>
  );
}
