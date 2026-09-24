/**
 * Page Visibility helpers — a background tab shouldn't keep polling.
 *
 * Browsers only start throttling timers after several minutes in the
 * background, so without these a hidden dashboard kept firing its full
 * request budget.
 */

/** True when the tab is in the background (always false server-side). */
export function isDocumentHidden(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

/**
 * `setInterval` that doesn't tick while the tab is hidden.
 *
 * If at least one tick was skipped, it ticks once as soon as the tab is visible
 * again and restarts the cadence from there, so the catch-up and the next
 * regular tick don't fire back to back. Returns the cleanup function.
 */
export function setVisibleInterval(tick: () => void, ms: number): () => void {
  let missed = false;
  let id: ReturnType<typeof setInterval> | undefined;

  const run = () => {
    if (isDocumentHidden()) {
      missed = true;
      return;
    }
    tick();
  };

  const start = () => {
    id = setInterval(run, ms);
  };

  const onVisibilityChange = () => {
    if (isDocumentHidden() || !missed) return;
    missed = false;
    clearInterval(id);
    start();
    tick();
  };

  start();
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  return () => {
    clearInterval(id);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}
