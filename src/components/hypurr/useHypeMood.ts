"use client";

import { useHypeDayChange } from "@/services/market/hype/hooks/useHypePrice";
import { marketMood, type HypurrMood } from "./Hypurr";

interface HypeMoodResult {
  mood: HypurrMood | null;
  label: string | null;
  change24h: number | null;
}

/**
 * HYPE 24h move as a Hypurr mood, shared by the landing ribbon and the
 * dashboard PulseBar. Read from the HYPE spot socket (last trade against the
 * previous-day price), the same live source as the sidebar badge: it moves with
 * the price shown elsewhere on the page and costs no request.
 */
export function useHypeMood(): HypeMoodResult {
  const { change24hPct } = useHypeDayChange();
  const result = marketMood(change24hPct);
  return { mood: result?.mood ?? null, label: result?.label ?? null, change24h: change24hPct };
}
