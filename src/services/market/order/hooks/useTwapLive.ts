import { useEffect, useState } from 'react';
import { isTwapLiveUp, isWithinFreshGrace, TWAP_FRESH_GRACE_MS, useTwapLiveStore } from '../twap-live.store';
import type { TwapLiveEntry } from '../types';

export interface UseTwapLiveResult {
  entries: ReadonlyMap<number, TwapLiveEntry>;
  /** Bumped by every feed message: dependency for memos that read `entries`. */
  version: number;
  /** Connected with the upstream up, or that was so less than 30 s ago (a short drop does not flicker the verdicts). */
  connected: boolean;
  /** Local time of the last snapshot or delta. */
  updatedAt: number | null;
}

/**
 * Holds the live TWAP store while `enabled` (connect on mount, release on
 * unmount; one socket per tab however many widgets hold it) and returns what
 * it knows. Disabled, it returns an empty, disconnected view.
 */
export function useTwapLive(enabled = true): UseTwapLiveResult {
  useEffect(() => {
    if (!enabled) return;
    const { connect, disconnect } = useTwapLiveStore.getState();
    connect();
    return disconnect;
  }, [enabled]);

  const entries = useTwapLiveStore((s) => s.entries);
  const version = useTwapLiveStore((s) => s.version);
  const updatedAt = useTwapLiveStore((s) => s.updatedAt);
  const lastFreshAt = useTwapLiveStore((s) => s.lastFreshAt);
  const freshNow = useTwapLiveStore(isTwapLiveUp);

  // The grace runs out with no store update: re-render once when it does.
  const [, setExpiry] = useState(0);
  useEffect(() => {
    if (!enabled || freshNow || lastFreshAt === null) return;
    const left = lastFreshAt + TWAP_FRESH_GRACE_MS - Date.now();
    if (left <= 0) return;
    const id = setTimeout(() => setExpiry((n) => n + 1), left + 50);
    return () => clearTimeout(id);
  }, [enabled, freshNow, lastFreshAt]);
  const connected = freshNow || isWithinFreshGrace(lastFreshAt);

  return enabled
    ? { entries, version, connected, updatedAt }
    : { entries: EMPTY, version: 0, connected: false, updatedAt: null };
}

const EMPTY: ReadonlyMap<number, TwapLiveEntry> = new Map();
