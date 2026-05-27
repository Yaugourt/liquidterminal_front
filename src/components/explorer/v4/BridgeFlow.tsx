"use client";

import { memo, useMemo, useState } from "react";
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
import { chartPalette, TokenAvatar } from "@/components/common";
import {
  ModuleTable,
  ModuleTableRow,
} from "@/components/common";

/**
 * BridgeFlow — Hyperliquid USDC bridge dashboard.
 *
 * Two-column layout (1.4fr / 1fr):
 *  - Left: hero inflow/outflow + mirrored bar chart (green bars above 0 axis
 *    for deposits, red bars below for withdrawals), bucketed hourly over the
 *    fetched event window.
 *  - Right: compact `ModuleTable` of the most recent transfers, deduped by
 *    nonce (each user-facing transfer surfaces as several validator votes).
 *
 * The bridge handles USDC exclusively, so amounts always render with the
 * `USDC` `TokenAvatar` next to the value — no token/asset field in the API.
 */

const ROWS = 6;
const FETCH_LIMIT = 100; // upstream Zod cap
const WINDOW_HOURS = 24;
const BUCKET_COUNT = 24;

/** Human-readable label for each event-type lifecycle stage. */
const EVENT_LABEL: Record<string, string> = {
  deposit_vote: "Deposit",
  withdraw3: "Withdraw",
  withdrawal_sign: "Sign",
  withdrawal_finalized: "Finalized",
};

interface BridgeBucket {
  startMs: number;
  inflow: number;
  outflow: number;
}

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

function bucketHour(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Parse the event ISO time once. */
function eventMs(e: EvmBridgeEvent): number {
  const iso = e.time.endsWith("Z") ? e.time : `${e.time}Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/** Dedupe by `nonce` so multiple validator votes for the same transfer
 *  collapse to a single row. Keeps the most "final" lifecycle stage. */
function dedupeByNonce(events: EvmBridgeEvent[]): EvmBridgeEvent[] {
  const lifecycleRank: Record<string, number> = {
    deposit_vote: 1,
    withdraw3: 1,
    withdrawal_sign: 2,
    withdrawal_finalized: 3,
  };
  const byNonce = new Map<string, EvmBridgeEvent>();
  for (const e of events) {
    const key = `${e.nonce ?? `${e.user_addr}-${e.time}`}`;
    const prev = byNonce.get(key);
    if (!prev) {
      byNonce.set(key, e);
      continue;
    }
    const prevRank = lifecycleRank[prev.event_type] ?? 0;
    const curRank = lifecycleRank[e.event_type] ?? 0;
    if (curRank > prevRank) {
      byNonce.set(key, e);
    }
  }
  return Array.from(byNonce.values()).sort(
    (a, b) => eventMs(b) - eventMs(a),
  );
}

/** Bucketise deduped events into `BUCKET_COUNT` inflow / outflow buckets.
 *  The bucket size is derived from the actual span of the fetched events:
 *  a busy bridge crammed into 1 minute would otherwise render as a single
 *  bar on a 24-bucket × 1-hour window. Window floor is 1 hour so the chart
 *  doesn't look microscopic when there are few events. */
function bucketise(events: EvmBridgeEvent[]): BridgeBucket[] {
  const now = Date.now();
  if (events.length === 0) {
    const fallback = 60 * 60 * 1000;
    return Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      startMs: now - (BUCKET_COUNT - i) * fallback,
      inflow: 0,
      outflow: 0,
    }));
  }

  const oldest = events.reduce((m, e) => Math.min(m, eventMs(e)), now);
  // Floor the window at 1 hour so we always have a reasonable visual baseline.
  const spanMs = Math.max(now - oldest, 60 * 60 * 1000);
  // Round bucket size up to the nearest minute so axis labels stay readable.
  const rawBucket = spanMs / BUCKET_COUNT;
  const bucketMs = Math.max(60_000, Math.ceil(rawBucket / 60_000) * 60_000);
  const startMs = now - BUCKET_COUNT * bucketMs;

  const buckets: BridgeBucket[] = Array.from(
    { length: BUCKET_COUNT },
    (_, i) => ({
      startMs: startMs + i * bucketMs,
      inflow: 0,
      outflow: 0,
    }),
  );

  for (const e of events) {
    const ms = eventMs(e);
    const idx = Math.floor((ms - startMs) / bucketMs);
    if (idx < 0 || idx >= BUCKET_COUNT) continue;
    if (isDepositEvent(e)) buckets[idx].inflow += e.amount;
    else if (isWithdrawalEvent(e)) buckets[idx].outflow += e.amount;
  }
  return buckets;
}

function BridgeBarChart({
  buckets,
  totalIn,
  totalOut,
}: {
  buckets: BridgeBucket[];
  totalIn: number;
  totalOut: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hovered = hoveredIdx != null ? buckets[hoveredIdx] : null;

  const maxMagnitude = useMemo(() => {
    let m = 0;
    for (const b of buckets) {
      m = Math.max(m, b.inflow, b.outflow);
    }
    return m;
  }, [buckets]);

  const tooltipLeftPct = hoveredIdx != null
    ? ((hoveredIdx + 0.5) / buckets.length) * 100
    : 50;

  return (
    <div className="flex flex-col h-full">
      {/* Hero — inflow / outflow side by side */}
      <div className="flex items-baseline gap-5">
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Inflow
          </div>
          <div className="mono text-[20px] font-semibold tracking-[-0.02em] text-success mt-0.5 leading-none">
            +{compactUsd(totalIn)}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Outflow
          </div>
          <div className="mono text-[20px] font-semibold tracking-[-0.02em] text-danger mt-0.5 leading-none">
            −{compactUsd(totalOut)}
          </div>
        </div>
        <div className="ml-auto flex gap-3 text-[10.5px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2 rounded-sm bg-success" />
            <span className="text-text-secondary">In</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2 rounded-sm bg-danger" />
            <span className="text-text-secondary">Out</span>
          </span>
        </div>
      </div>

      {/* Mirrored bar chart */}
      <div
        className="relative mt-4 flex-1 min-h-[160px]"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Floating tooltip */}
        <div
          className={`pointer-events-none absolute -top-1 z-20 transition-opacity duration-150 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `${tooltipLeftPct}%`,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          {hovered && (
            <div className="bg-surface-2 border border-border-default rounded px-2.5 py-1.5 min-w-[150px] shadow-xl">
              <div className="mono text-[9px] text-text-tertiary">
                {bucketHour(hovered.startMs)}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-success mono font-semibold">In</span>
                <span className="ml-auto mono text-text-primary">
                  +{compactUsd(hovered.inflow)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                <span className="text-danger mono font-semibold">Out</span>
                <span className="ml-auto mono text-text-primary">
                  −{compactUsd(hovered.outflow)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bars container — symmetric around a central axis */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top half — inflows above the axis */}
          <div className="flex-1 flex items-end gap-px cursor-crosshair">
            {buckets.map((b, i) => {
              const pct = maxMagnitude > 0 ? (b.inflow / maxMagnitude) * 100 : 0;
              const isHovered = i === hoveredIdx;
              const dim = hoveredIdx != null && !isHovered;
              return (
                <div
                  key={`in-${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className={`flex-1 h-full flex flex-col justify-end transition-opacity duration-150 ${
                    dim ? "opacity-35" : "opacity-100"
                  }`}
                >
                  <span
                    className={`block rounded-sm transition-colors duration-150 ${
                      isHovered ? "bg-success" : "bg-success/75"
                    }`}
                    style={{ height: b.inflow > 0 ? `max(2px, ${pct}%)` : "0" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Central axis */}
          <div className="h-px bg-border-default" />

          {/* Bottom half — outflows below the axis */}
          <div className="flex-1 flex items-start gap-px cursor-crosshair">
            {buckets.map((b, i) => {
              const pct = maxMagnitude > 0 ? (b.outflow / maxMagnitude) * 100 : 0;
              const isHovered = i === hoveredIdx;
              const dim = hoveredIdx != null && !isHovered;
              return (
                <div
                  key={`out-${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className={`flex-1 h-full flex flex-col justify-start transition-opacity duration-150 ${
                    dim ? "opacity-35" : "opacity-100"
                  }`}
                >
                  <span
                    className={`block rounded-sm transition-colors duration-150 ${
                      isHovered ? "bg-danger" : "bg-danger/75"
                    }`}
                    style={{ height: b.outflow > 0 ? `max(2px, ${pct}%)` : "0" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time axis */}
      <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary mono px-px">
        <span>{buckets[0] ? bucketHour(buckets[0].startMs) : ""}</span>
        <span>
          {buckets[Math.floor(buckets.length / 2)]
            ? bucketHour(buckets[Math.floor(buckets.length / 2)].startMs)
            : ""}
        </span>
        <span>
          {buckets[buckets.length - 1]
            ? bucketHour(buckets[buckets.length - 1].startMs)
            : ""}
        </span>
      </div>
    </div>
  );
}

export const BridgeFlow = memo(function BridgeFlow() {
  const { events, isLoading } = useEvmBridgeEvents(FETCH_LIMIT, WINDOW_HOURS);

  const deduped = useMemo(() => dedupeByNonce(events), [events]);
  const rows = useMemo(() => deduped.slice(0, ROWS), [deduped]);
  const buckets = useMemo(() => bucketise(deduped), [deduped]);

  const { inflow, outflow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const e of deduped) {
      if (isDepositEvent(e)) inflow += e.amount;
      else if (isWithdrawalEvent(e)) outflow += e.amount;
    }
    return { inflow, outflow };
  }, [deduped]);

  const net = inflow - outflow;
  const netPositive = net >= 0;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <ArrowLeftRight size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">EVM Bridge</h3>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mono border ${
            netPositive
              ? "bg-success/10 text-success border-success/25"
              : "bg-danger/10 text-danger border-danger/25"
          }`}
        >
          {netPositive ? "+" : "−"}
          {compactUsd(Math.abs(net))} net
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle inline-flex items-center gap-1.5">
          <TokenAvatar assetName="USDC" kind="spot" size="xs" />
          USDC only
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {deduped.length} transfers
        </span>
        <Link
          href="/explorer"
          className="ml-auto shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && deduped.length === 0 ? (
        <div className="px-3.5 py-10 text-center text-[11px] text-text-tertiary">
          Loading bridge events…
        </div>
      ) : deduped.length === 0 ? (
        <div className="px-3.5 py-10 text-center text-[11px] text-text-tertiary">
          No recent bridge events
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* Left — bar chart */}
          <div className="p-4 lg:border-r border-border-subtle">
            <BridgeBarChart
              buckets={buckets}
              totalIn={inflow}
              totalOut={outflow}
            />
          </div>

          {/* Right — recent transfers */}
          <ModuleTable
            density="compact"
            columns={[
              { header: "Stage", align: "left", width: 84 },
              { header: "User", align: "left" },
              { header: "Amount", align: "right", width: 110 },
              { header: "Age", align: "right", width: 56 },
            ]}
          >
            {rows.map((e: EvmBridgeEvent, i: number) => {
              const isDeposit = isDepositEvent(e);
              const label = EVENT_LABEL[e.event_type] ?? e.event_type;
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
                    <span
                      key="amount"
                      className={`inline-flex items-center justify-end gap-1.5 mono font-semibold ${
                        isDeposit ? "text-success" : "text-danger"
                      }`}
                    >
                      <TokenAvatar assetName="USDC" kind="spot" size="xs" />
                      {isDeposit ? "+" : "−"}
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
        </div>
      )}
    </Card>
  );
});

// chartPalette is intentionally imported to keep the hard requirement that
// any future chart-color override must flow through it.
void chartPalette;
