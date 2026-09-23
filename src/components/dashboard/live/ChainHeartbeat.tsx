"use client";

import { memo } from "react";
import { HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading, DataStatus } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import type { ChainPulse } from "@/services/dashboard/live/useChainPulse";

function Area({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="h-[64px] rounded-md bg-surface-2/50 animate-pulse" />;
  }
  const w = 240;
  const h = 64;
  const pad = 3;
  const mx = Math.max(...values) || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
    const y = h - pad - (v / mx) * (h - 2 * pad);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h} L${pts[0][0].toFixed(1)} ${h} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[64px] text-brand" aria-hidden>
      <path d={area} fill="currentColor" fillOpacity={0.1} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2.2} fill="currentColor" />
    </svg>
  );
}

/** HyperCore heartbeat: transaction rate over the last minute and the action mix. */
export const ChainHeartbeat = memo(function ChainHeartbeat({ pulse }: { pulse: ChainPulse }) {
  const peak = pulse.txSeries.length ? Math.max(...pulse.txSeries) : null;
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<HeartPulse size={13} className="text-brand" />}
        title="Chain heartbeat"
        status={<DataStatus variant="live" connected={pulse.connected} />}
        href="/explorer"
        viewAllLabel="Explorer"
      />
      <div className="p-3.5 space-y-3">
        <div>
          <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
            <span>Transactions / second · 60s</span>
            {peak != null && <span className="mono normal-case tracking-normal">peak {compactCount(peak)}</span>}
          </div>
          <Area values={pulse.txSeries} />
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Action mix · sampled stream
          </div>
          {pulse.mix.length === 0 ? (
            <div className="text-[12px] text-text-tertiary">Sampling transactions…</div>
          ) : (
            pulse.mix.map((a, i) => (
              <div key={`${a.type}-${i}`} className="flex items-center gap-2 mono text-[11px]">
                <span className="w-[96px] shrink-0 text-text-secondary truncate">{a.type}</span>
                <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <span className="block h-full bg-brand/70" style={{ width: `${a.share * 100}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right text-text-tertiary">{Math.round(a.share * 100)}%</span>
              </div>
            ))
          )}
          {pulse.mixSample > 0 && (
            <div className="text-[10px] text-text-tertiary">Shares of {pulse.mixSample} sampled transactions in the last minute.</div>
          )}
        </div>
      </div>
    </Card>
  );
});
