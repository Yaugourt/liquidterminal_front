"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PriorityFeesGossipRecord } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber } from "./priority-fees-format";

export interface PriorityFeesGossipStatusCardProps {
  slots: PriorityFeesGossipRecord[] | null;
  previousWinners: (string | null)[] | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

function slotId(slot: PriorityFeesGossipRecord): string {
  const id = slot.slot_id ?? slot.slotId;
  return id !== undefined && id !== null ? String(id) : "—";
}

export function PriorityFeesGossipStatusCard({
  slots,
  previousWinners,
  isLoading,
  error,
  onRetry,
}: PriorityFeesGossipStatusCardProps) {
  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-inter text-lg font-semibold text-white tracking-tight">
          Gossip auctions (live)
        </h2>
        <p className="text-xs text-text-muted mt-1">
          HIP-3 priority-fee Dutch auction slots (3-minute cycle). Gas fields from HypeDexer{" "}
          <code className="text-[10px] text-text-secondary">current_auctions</code>.
        </p>
        {previousWinners && previousWinners.length > 0 && (
          <p className="text-[11px] text-text-secondary mt-2 font-mono break-all">
            Previous cycle:{" "}
            {previousWinners.map((w, i) => (w === null || w === "" ? `slot ${i}: —` : `${i}: ${w}`)).join(" · ")}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-400 flex flex-col gap-2">
          <span>{error.message}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-brand-accent hover:underline w-fit"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="flex-1">
        {isLoading && (!slots || slots.length === 0) ? (
          <div className="flex h-[200px] items-center justify-center flex-col gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
            <span className="text-text-muted text-sm">Loading gossip status…</span>
          </div>
        ) : !slots || slots.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-center text-sm text-text-secondary px-2">
            No live slots in <code className="text-xs">current_auctions</code>. Upstream may be empty
            or the payload shape changed.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slots.map((slot, i) => (
              <div
                key={`${slotId(slot)}-${i}`}
                className="rounded-xl border border-border-subtle bg-brand-primary/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                    Slot {slotId(slot)}
                  </span>
                  {typeof slot.status === "string" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent">
                      {slot.status}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary space-y-1 font-mono">
                  <div className="flex justify-between gap-2">
                    <span>Current</span>
                    <span className="text-white">
                      {formatPriorityFeeNumber(slot.currentGas ?? slot.current_gas)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Start</span>
                    <span className="text-white">
                      {formatPriorityFeeNumber(slot.startGas ?? slot.start_gas)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>End</span>
                    <span className="text-white">
                      {slot.endGas !== undefined && slot.endGas !== null
                        ? formatPriorityFeeNumber(slot.endGas)
                        : "—"}
                    </span>
                  </div>
                </div>
                {(slot.lastUpdate || slot.startTime) && (
                  <div className="text-[10px] text-text-muted truncate space-y-0.5">
                    {slot.startTime && <div>Start: {String(slot.startTime)}</div>}
                    {slot.lastUpdate && <div>Updated: {String(slot.lastUpdate)}</div>}
                  </div>
                )}
                {typeof slot.winner === "string" && slot.winner && (
                  <div className="text-xs text-text-secondary truncate">Winner: {slot.winner}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
