import type { ReactNode } from "react";
import { tileColors, tileHalo } from "./tileTheme";

/**
 * Shared branded frame for every share-tile.
 *
 * The tile has to read as a Liquid Terminal *card*, not a generic poster: V4 is
 * analytics-first, dense and restrained (DefiLlama / Token Terminal), so the
 * content sits inside a real surface card with the V4 card-head grammar (brand
 * icon square + title + tag pill), a contained mono hero, and a provenance
 * footer. The navy base + single cyan halo frame it exactly like the app shell,
 * so a screenshot of the tile looks like a card screenshotted from the app.
 *
 * Colors come from `tileTheme` (Satori resolves no tokens); type is Inter +
 * JetBrains Mono via `loadTileFonts()`, passed to `ImageResponse({ fonts })`.
 */

const C = tileColors;
const BRAND_TINT = "rgba(131, 233, 255, 0.10)";
const BORDER_DEFAULT = "#2C354A";

/** The LiquidMark as inline SVG (paths only, for resvg compatibility). */
function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-17 63 656 656" fill="none" style={{ display: "flex" }}>
      <path
        d="M462.14 405.28 L437.5 405.28 L386.14 311.63 L310.14 173.05 L234.15 311.63 L182.79 405.28 L158.15 405.28 L234.15 266.7 L310.14 128.13 L386.14 266.7 Z"
        fill={C.textPrimary}
        stroke={C.textPrimary}
        strokeWidth="28.92"
        strokeMiterlimit="10"
      />
      <path
        d="m478.82,491.36c0,89.4-75.3,161.86-168.17,161.86s-168.18-72.46-168.18-161.86h26.62c0,74.76,62.98,135.35,140.65,135.35s140.63-60.59,140.63-135.35h28.44Z"
        fill={C.brand}
        stroke={C.brand}
        strokeWidth="30.43"
        strokeMiterlimit="10"
      />
    </svg>
  );
}

export interface TileFrameProps {
  /** Metric name in the card-head, e.g. "Protocol revenue". */
  title: string;
  /** Optional top-right pill, e.g. a timeframe. */
  pill?: string;
  /** Small uppercase label above the hero (category / context). */
  eyebrow: string;
  /** The hero value, rendered in mono. */
  hero: string;
  /** Hero text color (default: primary). Use a semantic token for win/loss. */
  heroColor?: string;
  /** Context line under the hero. */
  heroSub?: string;
  /** Provenance / method line (left of the footer). Keep source names generic. */
  footLeft: string;
  /** Second footer line (e.g. sources and timestamp). */
  footNote?: string;
  /** Optional caveat, rendered in the warn color. */
  warn?: string;
  /** Optional Hypurr mascot as a data URI (from `loadHypurr`), shown in the head. */
  mascot?: string | null;
  /** The tile-specific visual (bars, legend, chart). */
  children?: ReactNode;
}

export function TileFrame({
  title,
  pill,
  eyebrow,
  hero,
  heroColor,
  heroSub,
  footLeft,
  footNote,
  warn,
  mascot,
  children,
}: TileFrameProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: C.base,
        backgroundImage: tileHalo,
        padding: 40,
      }}
    >
      {/* the tile is one surface card, framed by the app's navy + halo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: C.surface,
          border: `1px solid ${BORDER_DEFAULT}`,
          borderRadius: 16,
          padding: "30px 40px 26px",
          color: C.textPrimary,
          fontFamily: "Inter",
        }}
      >
        {/* V4 card-head: brand icon square + title + tag, wordmark pushed right */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: BRAND_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrandMark size={24} />
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, marginLeft: 14 }}>
            {title}
          </div>
          {pill ? (
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 1,
                color: C.textSecondary,
                border: `1px solid ${C.borderSubtle}`,
                borderRadius: 8,
                padding: "4px 12px",
                background: C.surface2,
                marginLeft: 16,
              }}
            >
              {pill}
            </div>
          ) : null}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                color: C.textTertiary,
              }}
            >
              LIQUID TERMINAL
            </div>
            {mascot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mascot} width={40} height={40} alt="" style={{ display: "flex", marginLeft: 14 }} />
            ) : null}
          </div>
        </div>

        {/* separator, as under every V4 card-head */}
        <div style={{ display: "flex", height: 1, background: C.borderSubtle, marginTop: 24 }} />

        {/* hero: small uppercase label, then a contained mono figure */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 2,
              color: C.brand,
            }}
          >
            {eyebrow.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 56,
                fontWeight: 600,
                letterSpacing: -1,
                color: heroColor ?? C.textPrimary,
              }}
            >
              {hero}
            </div>
            {heroSub ? (
              <div style={{ display: "flex", fontSize: 18, color: C.textTertiary, marginLeft: 16 }}>
                {heroSub}
              </div>
            ) : null}
          </div>
        </div>

        {/* tile-specific body */}
        {children}

        {/* provenance footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "auto",
            paddingTop: 18,
            borderTop: `1px solid ${C.borderSubtle}`,
            fontSize: 14,
            color: C.textTertiary,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex" }}>{footLeft}</div>
            <div
              style={{
                display: "flex",
                marginLeft: "auto",
                fontFamily: "JetBrains Mono",
                color: C.brand,
                letterSpacing: 1,
              }}
            >
              liquidterminal.xyz
            </div>
          </div>
          {footNote ? <div style={{ display: "flex", marginTop: 6 }}>{footNote}</div> : null}
          {warn ? <div style={{ display: "flex", marginTop: 6, color: C.warn }}>{warn}</div> : null}
        </div>
      </div>
    </div>
  );
}
