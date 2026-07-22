/**
 * DataFlow — the flow field of the liquid layer (DESIGN_SYSTEM §13).
 *
 * A fan of streamlines poured from a single origin: the visual form of the
 * brand line "we treat data like water". One source, many currents, all of
 * them heading somewhere. Pair it with a `<LiquidMark>` sitting on the origin
 * and the mark reads as the emitter.
 *
 * Purely decorative, and strictly so: `aria-hidden`, no pointer events, and
 * content on top must carry `relative z-10` (same z-index rule as the page
 * halo, §3). Never encode information in it.
 *
 * Geometry comes from the props alone, no randomness, so server and client
 * render identical markup and hydration stays quiet.
 */

export interface DataFlowProps {
  /**
   * `"source"` (default) — a fan poured from `origin`. This is the emitter,
   * and a page gets at most one.
   * `"stream"` — the same water further downstream: near-parallel currents
   * crossing the box, no origin. Use it to carry the flow through the rest of
   * a page without opening a second source.
   */
  mode?: "source" | "stream";
  /**
   * Emission point in percent of the box. Default: top centre, just inside the
   * frame so the first segment is already visible. `"source"` mode only.
   */
  origin?: { x: number; y: number };
  /** Streamline count. Default 38. Above ~60 the field turns into a wash. */
  lines?: number;
  /**
   * Fan width at the far edge, in percent of the box width. Values over 100
   * are normal and wanted: the outer currents leave the frame instead of
   * stopping inside it. Default 190.
   */
  spread?: number;
  /** Stroke opacity of the brightest current. Default 0.22. */
  intensity?: number;
  /**
   * Where the light sits across the fan, as a distance from the axis (0 =
   * on the axis, 0.5 = at the outer edge). Default 0.3, which keeps the
   * middle channel dark so centered copy stays readable.
   */
  focus?: number;
  /** Slow current shimmer. Off by default (§1, restraint). */
  animated?: boolean;
  /** Fade the field in and out at both ends. Default true. */
  fade?: boolean;
  /** Classes on the wrapper. Set the color here, e.g. `text-brand`. */
  className?: string;
}

export function DataFlow({
  mode = "source",
  origin = { x: 50, y: 1 },
  lines = 38,
  spread = 190,
  intensity = 0.22,
  focus = 0.3,
  animated = false,
  fade = true,
  className = "",
}: DataFlowProps) {
  // Width of the bundle at birth. Small, so the currents leave the source as
  // one body of water rather than a pre-opened fan.
  const SEED = 1.2;

  const streams = [];
  for (let i = 0; i < lines; i++) {
    const t = lines === 1 ? 0.5 : i / (lines - 1);
    const signed = t - 0.5;
    // Irrational-ish step: every current gets its own undulation without a
    // repeating pattern across the fan.
    const phase = i * 0.79;

    const pts: string[] = [];
    if (mode === "stream") {
      // Downstream: the currents run flat across the box. Same two harmonics
      // as the source so it is recognisably the same water, just calmer.
      const lane = 6 + t * 88;
      const amp = 2.4 * (0.55 + 0.45 * Math.sin(phase));
      for (let x = 0; x <= 100; x += 2) {
        const y =
          lane +
          amp * Math.sin(x / 18 + phase) +
          amp * 0.4 * Math.sin(x / 8.5 + phase * 1.7);
        pts.push(`${x.toFixed(1)},${y.toFixed(2)}`);
      }
    } else {
      for (let y = origin.y; y <= 100; y += 2) {
        const u = (y - origin.y) / (100 - origin.y);
        // Ease-out, not ease-in: the fan opens fast then flattens, so the
        // currents fall roughly parallel instead of radiating. A linear or
        // ease-in profile draws a perspective star and reads as light rays.
        const open = 1 - Math.pow(1 - u, 2.2);
        // Two harmonics, both fading in from the source: one long swell, one
        // short chop. A single sine is too clean to pass for water.
        const amp = 4.6 * Math.pow(u, 0.6) * (0.55 + 0.45 * Math.sin(phase));
        const x =
          origin.x +
          signed * (SEED + spread * open) +
          amp * Math.sin(y / 15 + phase) +
          amp * 0.45 * Math.sin(y / 7.3 + phase * 1.7);
        pts.push(`${x.toFixed(2)},${y.toFixed(1)}`);
      }
    }

    // Triangular falloff around `focus`. Weighting on distance-from-axis
    // rather than along it is what keeps the bright currents spread through
    // the body of the fan instead of bunched on the emission line.
    const d = Math.abs(signed);
    const w = Math.max(0, 1 - Math.abs(d - focus) / focus);

    streams.push(
      <polyline
        key={i}
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeOpacity={(0.05 + intensity * w).toFixed(3)}
        strokeWidth={(0.8 + 0.9 * w).toFixed(2)}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...(animated
          ? {
              className: "liquid-current",
              style: { animationDelay: `${(i * 0.41).toFixed(2)}s` },
            }
          : {})}
      />
    );
  }

  // Source: hide the birth of the bundle (a hard seam under the mark
  // otherwise) and dissolve the tail instead of cutting it.
  // Stream: dissolve where the currents enter and leave the frame, so they
  // read as passing through rather than starting and stopping.
  const fadeMask =
    mode === "stream"
      ? "linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)"
      : "linear-gradient(to bottom, transparent 0%, #000 8%, #000 72%, transparent 98%)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={
        fade
          ? { maskImage: fadeMask, WebkitMaskImage: fadeMask }
          : undefined
      }
    >
      {/*
       * `preserveAspectRatio="none"` lets the field fill any box; the strokes
       * survive the non-uniform scale thanks to `vector-effect`.
       */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="liquid-flow h-full w-full"
      >
        {streams}
      </svg>
    </div>
  );
}
