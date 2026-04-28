"use client";

import Link from "next/link";
import { useValidators } from "@/services/explorer/validator/hooks/validator/useValidators";

function truncate(addr: string, chars = 8): string {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-4)}`;
}

function formatStake(stake: number): string {
  if (stake >= 1_000_000) return `${(stake / 1_000_000).toFixed(1)}M`;
  if (stake >= 1_000) return `${(stake / 1_000).toFixed(1)}K`;
  return stake.toFixed(0);
}

function ValidatorSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
          <div className="h-4 w-28 bg-white/5 animate-pulse rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-14 bg-white/5 animate-pulse rounded" />
            <div className="h-4 w-10 bg-white/5 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ValidatorsSample() {
  const { validators, isLoading } = useValidators();

  const top5 = validators.slice(0, 5);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Top Validators</h3>
        <Link
          href="/explorer/validator"
          className="text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-0">
        {isLoading && top5.length === 0 ? (
          <ValidatorSkeleton />
        ) : top5.length === 0 ? (
          <p className="text-text-secondary text-sm py-4 text-center">No validators found</p>
        ) : (
          top5.map((v) => (
            <div
              key={v.validator ?? v.address}
              className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
            >
              <span className="text-sm text-white truncate max-w-[140px]">
                {v.name || truncate(v.validator ?? v.address ?? "")}
              </span>
              <div className="flex gap-4 text-xs text-text-secondary shrink-0">
                <span>{formatStake(v.stake)} HYPE</span>
                <span className="text-brand-accent">
                  {v.apr !== undefined ? `${v.apr.toFixed(1)}%` : "-"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
