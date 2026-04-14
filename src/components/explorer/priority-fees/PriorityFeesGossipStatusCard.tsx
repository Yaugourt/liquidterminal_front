"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PriorityFeesGossipRecord } from "@/services/explorer/priority-fees";
import { formatPriorityFeeNumber } from "./priority-fees-format";

export interface PriorityFeesGossipStatusCardProps {
  slots: PriorityFeesGossipRecord[] | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

function slotId(slot: PriorityFeesGossipRecord): string {
  const id = slot.slot_id ?? slot.slotId;
  return id !== undefined && id !== null ? String(id) : "—";
}

function currentGas(slot: PriorityFeesGossipRecord): unknown {
  return slot.current_gas ?? slot.currentGas;
}

export function PriorityFeesGossipStatusCard({
  slots,
  isLoading,
  error,
  onRetry,
}: PriorityFeesGossipStatusCardProps) {
  return (
    <Card className="p-5 border-border-subtle bg-brand-secondary/40 backdrop-blur-md h-full flex flex-col">
      <div className="mb-4">
        <h2 className="font-outfit text-lg font-semibold text-white tracking-tight">
          Gossip auctions (live)
        </h2>
        <p className="text-xs text-text-muted mt-1">
          HIP-3 priority-fee auction slots. Fields depend on indexer payload.
        </p>
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
            No live slots returned. The indexer may use a different shape — check raw payload in devtools.
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
                <div className="text-sm text-white font-mono">
                  Gas: {formatPriorityFeeNumber(currentGas(slot))}
                </div>
                {(slot.end_time || slot.endTime) && (
                  <div className="text-xs text-text-muted truncate">
                    Ends: {String(slot.end_time ?? slot.endTime)}
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
