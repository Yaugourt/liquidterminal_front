/**
 * LiquidMark — the Liquid Terminal mark as inline SVG (DESIGN_SYSTEM §13).
 *
 * Inline rather than `<Image src="/logo.svg">` for three reasons:
 *  - the two shapes can be colored independently, so the arc can glow while
 *    the peak stays neutral (the liquid layer needs that);
 *  - it inherits `currentColor` in `tone="current"`, so one asset covers cyan,
 *    white and muted contexts without shipping a file per variant;
 *  - the exported `public/logo.svg` carries generic `.cls-1/2/3` classes in a
 *    `<style>` block, which collide as soon as two copies are inlined on the
 *    same page.
 *
 * Geometry is lifted verbatim from `public/logo.svg`. Fill and stroke share a
 * color on both shapes, so keeping the stroke preserves the exact weight.
 */
interface LiquidMarkProps {
  /** Rendered square size in px. Default 22 (the nav size). */
  size?: number;
  /**
   * `"duo"` (default) — the logo: neutral peak over a cyan arc.
   * `"current"` — monochrome, inherits the surrounding color. Use it when the
   * mark sits on a colored surface or acts as the source of a flow field.
   */
  tone?: "duo" | "current";
  /** Extra classes on the svg (color for `tone="current"`, filters, margins). */
  className?: string;
  /** Decorative copy next to a real label. Default false (exposed as an img). */
  decorative?: boolean;
}

export function LiquidMark({
  size = 22,
  tone = "duo",
  className = "",
  decorative = false,
}: LiquidMarkProps) {
  const peak = tone === "duo" ? "text-text-primary" : "";
  const arc = tone === "duo" ? "text-brand" : "";

  return (
    <svg
      viewBox="-17 63 656 656"
      width={size}
      height={size}
      fill="none"
      className={className}
      style={{ width: size, height: size }}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "Liquid Terminal" })}
    >
      <polygon
        className={peak}
        points="462.14 405.28 437.5 405.28 386.14 311.63 310.14 173.05 234.15 311.63 182.79 405.28 158.15 405.28 234.15 266.7 310.14 128.13 386.14 266.7 462.14 405.28"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="28.92"
        strokeMiterlimit="10"
      />
      <path
        className={arc}
        d="m478.82,491.36c0,89.4-75.3,161.86-168.17,161.86s-168.18-72.46-168.18-161.86h26.62c0,74.76,62.98,135.35,140.65,135.35s140.63-60.59,140.63-135.35h28.44Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="30.43"
        strokeMiterlimit="10"
      />
    </svg>
  );
}
