"use client";

import { useEffect } from "react";
import { cancelPendingLogin, hasPrivySessionHint, loadPrivy, usePrivyStore } from "./store";

// A signed-in visitor's first API calls wait for Privy's access token: start
// the download while the page hydrates rather than after it.
if (typeof window !== "undefined" && hasPrivySessionHint()) {
  void loadPrivy();
}

/** Anonymous visitors: Privy loads once the page is idle, at the latest after this. */
const IDLE_TIMEOUT_MS = 2_000;
/** Browsers without requestIdleCallback (Safari). */
const FALLBACK_DELAY_MS = 1_000;

/**
 * Mount point of the on-demand Privy SDK (see `./store`). Renders nothing
 * until the chunk is loaded, then the provider + bridge. Mounted once, as a
 * sibling of the app tree in `<Providers>`.
 */
export function LazyPrivy() {
  const Root = usePrivyStore((s) => s.Root);

  useEffect(() => {
    if (hasPrivySessionHint()) {
      void loadPrivy();
      return;
    }
    const load = () => {
      void loadPrivy();
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: IDLE_TIMEOUT_MS });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(load, FALLBACK_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // A "Connect" click queued while Privy was loading must not replay on a
  // later visit of the app shell.
  useEffect(() => cancelPendingLogin, []);

  return Root ? <Root /> : null;
}
