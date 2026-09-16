"use client";

import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { classifyHyperfolioError, type HyperfolioErrorKind } from "@/services/market/tracker/hyperfolio";

interface HyperfolioNoticeProps {
  error?: unknown;
  /** Pre-classified kind (used by the positions store, which has no Error object). */
  kind?: HyperfolioErrorKind;
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

const COPY: Record<HyperfolioErrorKind, { title: string; body: string }> = {
  "rate-limited": {
    title: "HyperEVM data is rate limited",
    body: "Hyperfolio is throttling requests right now. Cached data stays visible; retry in a few seconds.",
  },
  "not-configured": {
    title: "HyperEVM data unavailable",
    body: "This instance has no Hyperfolio access configured.",
  },
  "bad-input": {
    title: "Address not supported",
    body: "Hyperfolio could not resolve this address on HyperEVM.",
  },
  error: {
    title: "Failed to load HyperEVM data",
    body: "The Hyperfolio upstream did not answer. Try again in a moment.",
  },
};

/**
 * Inline error banner for the HyperEVM panels — distinguishes an upstream
 * rate limit (expected, transient) from a real failure. Compact on purpose:
 * it sits inside a tab body, above whatever cached rows are still shown.
 */
export function HyperfolioNotice({ error, kind, message, onRetry, className = "" }: HyperfolioNoticeProps) {
  const resolved = kind ?? classifyHyperfolioError(error);
  const copy = COPY[resolved];
  const throttled = resolved === "rate-limited";
  const Icon = throttled ? Clock : AlertTriangle;
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 ${
        throttled ? "border-gold/30 bg-gold/5" : "border-danger/30 bg-danger/5"
      } ${className}`}
    >
      <Icon size={15} className={`mt-0.5 shrink-0 ${throttled ? "text-gold" : "text-danger"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text-primary">{copy.title}</p>
        <p className="text-xs text-text-secondary">{message && resolved === "bad-input" ? message : copy.body}</p>
      </div>
      {onRetry && resolved !== "not-configured" && (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs shrink-0" onClick={onRetry}>
          <RefreshCw size={12} className="mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
