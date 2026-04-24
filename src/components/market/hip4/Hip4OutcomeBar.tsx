"use client";

import { motion } from "framer-motion";
import type { Hip4QuestionOutcome } from "@/services/indexer/hip4";

interface Hip4OutcomeBarProps {
  outcome: Hip4QuestionOutcome;
  /** 0–9; for distinct colors when a question has multiple named outcomes. */
  colorIndex?: number;
  /** Animation delay (seconds) for staggering children in a card. */
  delay?: number;
}

const PALETTE = [
  { from: "rgba(131,233,255,0.8)", to: "rgba(131,233,255,0.25)", text: "text-brand-accent" },
  { from: "rgba(249,227,112,0.8)", to: "rgba(249,227,112,0.25)", text: "text-brand-gold" },
  { from: "rgba(167,139,250,0.8)", to: "rgba(167,139,250,0.25)", text: "text-violet-300" },
  { from: "rgba(16,185,129,0.8)",  to: "rgba(16,185,129,0.25)",  text: "text-emerald-300" },
  { from: "rgba(244,63,94,0.8)",   to: "rgba(244,63,94,0.25)",   text: "text-rose-300" },
  { from: "rgba(251,146,60,0.8)",  to: "rgba(251,146,60,0.25)",  text: "text-orange-300" },
  { from: "rgba(236,72,153,0.8)",  to: "rgba(236,72,153,0.25)",  text: "text-pink-300" },
  { from: "rgba(34,211,238,0.8)",  to: "rgba(34,211,238,0.25)",  text: "text-cyan-300" },
  { from: "rgba(234,179,8,0.8)",   to: "rgba(234,179,8,0.25)",   text: "text-yellow-300" },
  { from: "rgba(139,92,246,0.8)",  to: "rgba(139,92,246,0.25)",  text: "text-purple-300" },
];

function priceToCents(px: number | null): string {
  if (px == null || !Number.isFinite(px)) return "—";
  const pct = Math.max(0, Math.min(1, px)) * 100;
  return `${pct.toFixed(0)}¢`;
}

export function Hip4OutcomeBar({ outcome, colorIndex = 0, delay = 0 }: Hip4OutcomeBarProps) {
  const color = PALETTE[colorIndex % PALETTE.length];
  const ratio = outcome.mid_price != null && Number.isFinite(outcome.mid_price)
    ? Math.max(0, Math.min(1, outcome.mid_price))
    : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 min-w-0 truncate text-xs font-semibold text-white">
        {outcome.display_name || `#${outcome.outcome_id}`}
      </span>
      <div className="relative h-1.5 w-24 sm:w-32 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color.to}, ${color.from})` }}
        />
      </div>
      <span className={`shrink-0 tabular-nums text-[11px] font-bold ${color.text} w-10 text-right`}>
        {priceToCents(outcome.mid_price)}
      </span>
    </div>
  );
}
