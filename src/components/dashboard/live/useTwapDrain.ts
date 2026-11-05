"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { fullUsdParts } from "@/lib/formatters/numberFormatting";
import type { TwapProgressInput } from "@/services/market/order/twap-progress";
import { drainAt, nextDrain, type Drain } from "@/services/market/order/twap-drain";

/**
 * ~20 repaints a second, whatever the screen's refresh rate. The cents roll
 * just as continuously to the eye as at 30 or 60, and each repaint costs the
 * browser a pass over the whole (heavy) dashboard, whatever little changed:
 * measured on a prod build (headless Chromium, 2026-11-05), the page's main
 * thread went from 5 % to 14 % busy at 30 a second, almost all of it paint.
 * One loop for every row, so they all repaint on the same frames and the
 * frames in between cost nothing.
 */
const PAINT_EVERY_MS = 50;
const painters = new Set<(now: number) => void>();
let frameId = 0;
let lastPaint = -Infinity;

function frame(ts: number) {
  frameId = requestAnimationFrame(frame);
  // A few ms of slack: on a 60 Hz screen every third frame (50 ms apart) passes.
  if (ts - lastPaint < PAINT_EVERY_MS - 4) return;
  lastPaint = ts;
  const now = Date.now();
  painters.forEach((paint) => paint(now));
}

function onFrames(paint: (now: number) => void): () => void {
  painters.add(paint);
  if (painters.size === 1) frameId = requestAnimationFrame(frame);
  return () => {
    painters.delete(paint);
    if (painters.size === 0) {
      cancelAnimationFrame(frameId);
      lastPaint = -Infinity;
    }
  };
}

/** Rows on screen: one observer for all of them (a row scrolled out of its list, or the cards out of the page, is not repainted). */
let observer: IntersectionObserver | null = null;
const onView = new Map<Element, (visible: boolean) => void>();

function watchVisibility(el: Element, cb: (visible: boolean) => void): () => void {
  observer ??= new IntersectionObserver((entries) => entries.forEach((e) => onView.get(e.target)?.(e.isIntersecting)));
  onView.set(el, cb);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    onView.delete(el);
  };
}

/**
 * Drives a TWAP row's amount left and progress bar continuously (see
 * twap-drain.ts): repainted ~20 times a second while the row is on screen, to
 * the cent, straight into the DOM, so the drain costs no React render (the
 * browser stops the frames in a hidden tab). Each new board hands the row
 * fresh data and the drain carries on from what is on screen. With reduced
 * motion the row follows the board, once a second, as before.
 *
 * `rowRef` goes on the row (for visibility); the other refs go on empty
 * elements, which the hook alone writes.
 */
export function useTwapDrain(progress: TwapProgressInput, totalUsd: number) {
  const rowRef = useRef<HTMLDivElement>(null);
  const wholeRef = useRef<HTMLSpanElement>(null);
  const centsRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion() === true;
  const drain = useRef<Drain | null>(null);
  const visible = useRef(true);
  /** What the DOM holds, so a paint only writes what changed. */
  const written = useRef({ whole: "", cents: "", width: "" });

  const paint = useCallback((now: number) => {
    if (!drain.current) return;
    const { done, leftUsd } = drainAt(drain.current, now);
    const { whole, cents } = fullUsdParts(leftUsd);
    // 0.1 % steps: a fraction of a pixel on any bar, and fewer writes.
    const width = `${(done * 100).toFixed(1)}%`;
    const w = written.current;
    if (whole !== w.whole && wholeRef.current) {
      wholeRef.current.textContent = whole;
      w.whole = whole;
    }
    if (cents !== w.cents && centsRef.current) {
      centsRef.current.textContent = cents;
      w.cents = cents;
    }
    if (width !== w.width && barRef.current) {
      barRef.current.style.width = width;
      w.width = width;
    }
  }, []);

  // Fresh data: painted before the browser paints the new board.
  useLayoutEffect(() => {
    const now = Date.now();
    drain.current = nextDrain(drain.current, { progress, totalUsd }, now, !reduce);
    paint(now);
  }, [progress, totalUsd, reduce, paint]);

  useEffect(() => {
    if (reduce) return;
    const el = rowRef.current;
    const stopWatching = el
      ? watchVisibility(el, (v) => {
          visible.current = v;
        })
      : undefined;
    const stopFrames = onFrames((now) => {
      if (visible.current) paint(now);
    });
    return () => {
      stopFrames();
      stopWatching?.();
    };
  }, [reduce, paint]);

  return { rowRef, wholeRef, centsRef, barRef };
}
