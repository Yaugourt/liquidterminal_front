import Image from "next/image";

/** Every optimized mood under public/hypurr-web (400px WebP, 13-40KB). */
export const HYPURR_MOODS = [
  "calls", "cash", "cheers", "cry", "crystalball", "dafuq", "dead",
  "fire-panic", "fire-smirk", "gm", "handshake", "happy", "hearteyes",
  "hypurr", "in-my-lane", "karate", "liquid", "meditation", "meowdy",
  "notes", "photo", "purrfessor", "saiyan", "samurai", "sherlock",
  "shook", "shrug", "ski", "sleepy", "smoking", "snowboard", "sweating",
  "teacher-angry", "teacher-bow", "theories", "this-is-fine", "throne",
  "thumbs-down", "thumbs-up-sad", "thumbs-up", "tired",
] as const;

export type HypurrMood = (typeof HYPURR_MOODS)[number];

/** Micro-animations defined in globals.css; all transform-only and
 *  disabled under prefers-reduced-motion. */
export type HypurrAnimation = "float" | "peek" | "sway" | "pop";

interface HypurrProps {
  mood: HypurrMood;
  /** Rendered height in px; width follows the 4:3 source ratio. */
  height?: number;
  className?: string;
  title?: string;
  animation?: HypurrAnimation;
}

/**
 * Hypurr, the Hyperliquid mascot. Rule of the house: Hypurr lives in the
 * states around the data (loading, empty, degraded, celebration) and as a
 * mood companion; it never covers or replaces a number.
 */
export function Hypurr({ mood, height = 80, className, title, animation }: HypurrProps) {
  const animationClass = animation ? `hypurr-${animation}` : "";
  return (
    <Image
      src={`/hypurr-web/${mood}.webp`}
      alt={`Hypurr ${mood.replace(/-/g, " ")}`}
      title={title}
      width={Math.round((height * 4) / 3)}
      height={height}
      className={[animationClass, className].filter(Boolean).join(" ")}
      style={{ height, width: "auto" }}
    />
  );
}

/** Map a 24h % move to Hypurr's market mood. */
export function marketMood(change24hPct: number | null | undefined): { mood: HypurrMood; label: string } | null {
  if (change24hPct == null || !Number.isFinite(change24hPct)) return null;
  if (change24hPct <= -10) return { mood: "dead", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct <= -3) return { mood: "cry", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct < 3) return { mood: "meowdy", label: `HYPE ${change24hPct.toFixed(1)}% 24h` };
  if (change24hPct < 10) return { mood: "cheers", label: `HYPE +${change24hPct.toFixed(1)}% 24h` };
  return { mood: "saiyan", label: `HYPE +${change24hPct.toFixed(1)}% 24h` };
}
