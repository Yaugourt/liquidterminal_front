"use client";

import { Check } from "lucide-react";
import type { Hip4WonBy } from "@/services/indexer/hip4";

const SOURCE: Record<Hip4WonBy, string> = {
  settlement: "Settled on-chain",
  final_price: "From the last trades: no on-chain settlement on record",
};

/**
 * The winning outcome's chip on a market that no longer trades. Neutral
 * tokens: green and red stay for Yes and No. Says how the win is known.
 */
export function Hip4WonMark({ wonBy }: { wonBy: Hip4WonBy | null | undefined }) {
  const source = wonBy ? SOURCE[wonBy] : undefined;
  return (
    <span
      title={source}
      className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border-subtle bg-surface-2 px-1 py-px text-[9.5px] font-semibold uppercase tracking-wider text-text-secondary"
    >
      <Check size={9} aria-hidden />
      Won
      {source && <span className="sr-only">: {source}</span>}
    </span>
  );
}
