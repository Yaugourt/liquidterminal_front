"use client";

import { useId } from "react";

/**
 * FlowConfluence — tributaries joining one river, sized by real share.
 *
 * This is the liquid language's SECOND register, and the distinction matters
 * (DESIGN_SYSTEM §13):
 *
 *   - `DataFlow` is **weather**. Decorative, carries nothing, and is therefore
 *     banned from any surface where a number is read.
 *   - `FlowConfluence` is **plumbing**. Every stream stands for a real
 *     quantity, so it is a chart drawn in the brand's own hand, and it is
 *     allowed wherever a chart is allowed.
 *
 * That is also why it is held to chart rules, not decoration rules: the stream
 * count per source is its actual share of the total (never invented, never
 * padded), and the figures render as text next to the graphic so the
 * information never lives only in the picture.
 *
 * Geometry is deterministic — no randomness — so server and client agree.
 */

export interface FlowSegment {
  key: string;
  label: string;
  /** Absolute value in the same unit as its siblings. */
  value: number;
  /** Stroke color. Pass a `chartPalette` entry so the confluence and the chart
   *  it sits above agree on what each source looks like. */
  color: string;
}

export interface FlowConfluenceProps {
  segments: FlowSegment[];
  /** Height of the graphic in px. */
  height?: number;
  /**
   * Total number of streams shared out between the sources. Each source gets
   * at least one, so a source worth 0.3% still shows up as a trickle instead
   * of disappearing.
   */
  streams?: number;
  /** Label for the trunk, e.g. "Total". */
  trunkLabel?: string;
  /** Pre-formatted total, rendered as text at the mouth. */
  trunkValue?: string;
  className?: string;
}

/** Smootherstep, so tributaries hold their lane then merge without a kink. */
function ease(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

export function FlowConfluence({
  segments,
  height = 190,
  streams = 44,
  trunkLabel = "Total",
  trunkValue,
  className = "",
}: FlowConfluenceProps) {
  const gradientId = useId();
  const total = segments.reduce((acc, s) => acc + Math.max(0, s.value), 0);
  if (total <= 0 || segments.length === 0) return null;

  /*
   * Share out the streams largest-remainder style: floor everything, floor at
   * one stream per source, then hand the leftovers to the largest fractions.
   * Rounding each share independently would drift the total.
   */
  const raw = segments.map((s) => (Math.max(0, s.value) / total) * streams);
  const counts = raw.map((r) => Math.max(1, Math.floor(r)));
  let spare = streams - counts.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; spare > 0; k = (k + 1) % order.length, spare--) {
    counts[order[k].i] += 1;
  }

  // Vertical band each source occupies at the intake, proportional to its
  // stream count so the left edge already reads as the breakdown.
  const GAP = 3; // percent of height between tributaries
  const usable = 100 - GAP * (segments.length - 1);
  const bands: { top: number; size: number }[] = [];
  let cursor = 0;
  counts.forEach((c) => {
    const size = (c / streams) * usable;
    bands.push({ top: cursor, size });
    cursor += size + GAP;
  });

  // The trunk: a narrow band on the right that every stream funnels into.
  const TRUNK_TOP = 42;
  const TRUNK_SIZE = 16;

  const paths: React.ReactElement[] = [];
  let streamIndex = 0;
  segments.forEach((seg, si) => {
    const band = bands[si];
    const count = counts[si];
    for (let j = 0; j < count; j++) {
      const laneT = count === 1 ? 0.5 : j / (count - 1);
      const yIn = band.top + laneT * band.size;
      const yOut = TRUNK_TOP + (streamIndex / Math.max(1, streams - 1)) * TRUNK_SIZE;
      const phase = streamIndex * 0.79;

      const pts: string[] = [];
      for (let x = 0; x <= 100; x += 2) {
        const u = x / 100;
        // Hold the lane, merge late: the eye should read the breakdown before
        // it reads the join.
        const k = ease((u - 0.24) / 0.68);
        // Same two harmonics as DataFlow, damped as the water settles into the
        // trunk. A confluence that keeps chopping at the mouth reads as noise.
        const calm = 1 - 0.85 * k;
        const amp = 2.1 * calm;
        const y =
          yIn +
          (yOut - yIn) * k +
          amp * Math.sin(x / 17 + phase) +
          amp * 0.4 * Math.sin(x / 8.1 + phase * 1.7);
        pts.push(`${x},${y.toFixed(2)}`);
      }

      paths.push(
        <polyline
          key={`${seg.key}-${j}`}
          points={pts.join(" ")}
          fill="none"
          stroke={seg.color}
          strokeOpacity={0.42}
          strokeWidth={1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      );
      streamIndex++;
    }
  });

  return (
    <div className={className}>
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            {/* Fades the intake so the streams arrive rather than start. */}
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="0.08" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <mask id={`${gradientId}-m`}>
              <rect x="0" y="0" width="100" height="100" fill={`url(#${gradientId})`} />
            </mask>
          </defs>
          <g mask={`url(#${gradientId}-m)`}>{paths}</g>
        </svg>
      </div>

      {/*
       * The numbers, as text. The graphic is aria-hidden and decorative on top
       * of this: a reader that cannot see the currents still gets every figure.
       */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
        {segments.map((seg, i) => (
          <span key={seg.key} className="inline-flex items-baseline gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full translate-y-[1px]"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[11px] text-text-secondary">{seg.label}</span>
            <span className="mono text-[11px] text-text-primary">
              {((Math.max(0, seg.value) / total) * 100).toFixed(1)}%
            </span>
            <span className="sr-only">
              {counts[i]} of {streams} streams
            </span>
          </span>
        ))}
        {trunkValue && (
          <span className="ml-auto inline-flex items-baseline gap-1.5">
            <span className="text-[11px] text-text-tertiary">{trunkLabel}</span>
            <span className="mono text-[12px] font-semibold text-gold">{trunkValue}</span>
          </span>
        )}
      </div>
    </div>
  );
}
