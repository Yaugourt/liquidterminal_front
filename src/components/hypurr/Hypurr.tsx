import Image from "next/image";

/** Optimized moods available under public/hypurr-web (400px WebP, 13-40KB). */
export type HypurrMood =
  | "shrug"
  | "sherlock"
  | "this-is-fine"
  | "meditation"
  | "dead"
  | "cry"
  | "meowdy"
  | "cheers"
  | "saiyan"
  | "purrfessor"
  | "teacher-bow";

interface HypurrProps {
  mood: HypurrMood;
  /** Rendered height in px; width follows the 4:3 source ratio. */
  height?: number;
  className?: string;
  title?: string;
}

/**
 * Hypurr, the Hyperliquid mascot. Rule of the house: Hypurr only shows up
 * where there is no data to read (empty/error states) or as a small mood
 * companion; it never competes with numbers.
 */
export function Hypurr({ mood, height = 80, className, title }: HypurrProps) {
  return (
    <Image
      src={`/hypurr-web/${mood}.webp`}
      alt={`Hypurr ${mood.replace(/-/g, " ")}`}
      title={title}
      width={Math.round((height * 4) / 3)}
      height={height}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}

/** Map a 24h % move to Hypurr's market mood (B2 thresholds). */
export function marketMood(change24hPct: number | null | undefined): { mood: HypurrMood; label: string } | null {
  if (change24hPct == null || !Number.isFinite(change24hPct)) return null;
  if (change24hPct <= -10) return { mood: "dead", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct <= -3) return { mood: "cry", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct < 3) return { mood: "meowdy", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct < 10) return { mood: "cheers", label: `HYPE +${change24hPct.toFixed(1)}% 24h` };
  return { mood: "saiyan", label: `HYPE +${change24hPct.toFixed(1)}% 24h` };
}
