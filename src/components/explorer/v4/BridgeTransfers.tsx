"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEvmBridgeEvents } from "@/services/indexer/evm";
import {
  isDepositEvent,
  isWithdrawalEvent,
  type EvmBridgeEvent,
} from "@/services/indexer/evm";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { TokenAvatar } from "@/components/common";
import {
  ModuleTable,
  ModuleTableRow,
} from "@/components/common";

/**
 * BridgeTransfers — recent USDC bridge transfers (Arbitrum ↔ Hyperliquid L1).
 *
 * Lightweight version of the old `BridgeFlow` (no bar chart). Shows the last
 * N deduplicated user transfers as a compact `ModuleTable` so it can sit
 * beside Token Deploys in the same 2-column grid.
 *
 * The bridge handles USDC exclusively — no token/asset field in the payload.
 * Each user-facing transfer surfaces as several validator votes, deduped by
 * `nonce`, keeping the most "final" lifecycle stage.
 */

const ROWS = 8; // aligned with TokenDeploys so the two cards share row count
const FETCH_LIMIT = 100;
const WINDOW_HOURS = 24;

const EVENT_LABEL: Record<string, string> = {
  deposit_vote: "Deposit",
  withdraw3: "Withdraw",
  withdrawal_sign: "Sign",
  withdrawal_finalized: "Finalized",
};

function truncateAddr(addr: string | null | undefined, start = 6, end = 4): string {
  if (!addr) return "—";
  if (addr.length <= start + end + 2) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const ms = Date.parse(iso.endsWith("Z") ? iso : `${iso}Z`);
  if (!Number.isFinite(ms)) return "—";
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function eventMs(e: EvmBridgeEvent): number {
  const iso = e.time.endsWith("Z") ? e.time : `${e.time}Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/** Dedupe by `nonce`, keeping the most advanced lifecycle stage (finalized > sign > vote). */
function dedupeByNonce(events: EvmBridgeEvent[]): EvmBridgeEvent[] {
  const rank: Record<string, number> = {
    deposit_vote: 1,
    withdraw3: 1,
    withdrawal_sign: 2,
    withdrawal_finalized: 3,
  };
  const byNonce = new Map<string, EvmBridgeEvent>();
  for (const e of events) {
    const key = `${e.nonce ?? `${e.user_addr}-${e.time}`}`;
    const prev = byNonce.get(key);
    if (!prev || (rank[e.event_type] ?? 0) > (rank[prev.event_type] ?? 0)) {
      byNonce.set(key, e);
    }
  }
  return Array.from(byNonce.values()).sort(
    (a, b) => eventMs(b) - eventMs(a),
  );
}

export const BridgeTransfers = memo(function BridgeTransfers() {
  const { events, isLoading } = useEvmBridgeEvents(FETCH_LIMIT, WINDOW_HOURS);

  const deduped = useMemo(() => dedupeByNonce(events), [events]);
  const rows = useMemo(() => deduped.slice(0, ROWS), [deduped]);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <ArrowLeftRight size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Bridge Transfers
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle inline-flex items-center gap-1.5">
          <TokenAvatar assetName="USDC" kind="spot" size="xs" />
          USDC only
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Last {ROWS}
        </span>
        <Link
          href="/explorer"
          className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          Loading bridge transfers…
        </div>
      ) : rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          No recent bridge transfers
        </div>
      ) : (
        <ModuleTable
          density="compact"
          columns={[
            { header: "Stage",  align: "left" },
            { header: "User",   align: "left" },
            { header: "Amount", align: "right" },
            { header: "Age",    align: "right" },
          ]}
        >
          {rows.map((e: EvmBridgeEvent, i: number) => {
            const isDeposit = isDepositEvent(e);
            const isWithdrawal = isWithdrawalEvent(e);
            const label = EVENT_LABEL[e.event_type] ?? e.event_type;
            const signClass = isDeposit
              ? "text-success"
              : isWithdrawal
              ? "text-danger"
              : "text-text-primary";
            const sign = isDeposit ? "+" : isWithdrawal ? "−" : "";
            return (
              <ModuleTableRow
                key={`${e.event_type}-${e.nonce ?? "_"}-${e.user_addr ?? "_"}-${e.time}-${i}`}
                cells={[
                  <span
                    key="stage"
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                      isDeposit
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {label}
                  </span>,
                  <span key="user" className="mono text-brand">
                    {truncateAddr(e.user_addr)}
                  </span>,
                  <span key="amount" className={`mono font-semibold ${signClass}`}>
                    {sign}
                    {compactUsd(e.amount)}
                  </span>,
                  <span key="age" className="mono text-text-tertiary">
                    {timeAgo(e.time)}
                  </span>,
                ]}
              />
            );
          })}
        </ModuleTable>
      )}
    </Card>
  );
});
