import { create } from "zustand";
import { WebSocketClient, HIDDEN_TAB_PAUSE_MS, PING_HEARTBEAT } from "@/lib/websocket-client";

const WS_URL = "wss://api.hyperliquid.xyz/ws";
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 2000;
/**
 * The socket outlives its last widget by this long: a route change between
 * two HIP-4 pages unmounts one widget and mounts the next within a moment,
 * which must not close and reopen the connection.
 */
const RELEASE_GRACE_MS = 5_000;

export interface Hip4MidsStore {
  /** `#<encoding>` → mid, the outcome coins of the last `allMids` frame. */
  mids: Record<string, string>;
  /** Epoch ms the last frame arrived; null until the first one. */
  updatedAt: number | null;
  connected: boolean;
}

export const useHip4MidsStore = create<Hip4MidsStore>(() => ({
  mids: {},
  updatedAt: null,
  connected: false,
}));

interface AllMidsFrame {
  channel?: string;
  data?: { mids?: Record<string, string> };
}

let client: WebSocketClient | null = null;
let holders = 0;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

function open(): void {
  if (client) {
    client.connect();
    return;
  }
  client = new WebSocketClient({
    url: WS_URL,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    baseReconnectDelay: BASE_RECONNECT_DELAY,
    // Every frame is a full snapshot of the mids: a background tab loses
    // nothing by dropping the stream and gets a frame as soon as it is shown.
    pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
    heartbeat: PING_HEARTBEAT,
    onOpen: () => {
      useHip4MidsStore.setState({ connected: true });
      client?.send({ method: "subscribe", subscription: { type: "allMids" } });
    },
    onClose: () => {
      useHip4MidsStore.setState({ connected: false });
    },
    onMessage: (raw) => {
      const frame = raw as AllMidsFrame;
      if (frame.channel !== "allMids" || !frame.data?.mids) return;
      // The frame carries every market (~25 KB): keep the outcome coins only.
      const mids: Record<string, string> = {};
      for (const [coin, mid] of Object.entries(frame.data.mids)) {
        if (coin.startsWith("#")) mids[coin] = mid;
      }
      useHip4MidsStore.setState({ mids, updatedAt: Date.now() });
    },
  });
  client.connect();
}

function close(): void {
  client?.disconnect();
  client = null;
  useHip4MidsStore.setState({ connected: false });
}

/**
 * Takes a hold on the shared `allMids` socket and returns the function that
 * gives it back. The socket opens with the first hold and closes
 * `RELEASE_GRACE_MS` after the last one: it exists only while a HIP-4 widget is
 * mounted, and a tab holds at most this one connection for them whatever the
 * number of widgets.
 */
export function acquireHip4Mids(): () => void {
  if (typeof window === "undefined") return () => {};
  holders += 1;
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  open();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders > 0 || releaseTimer) return;
    releaseTimer = setTimeout(() => {
      releaseTimer = null;
      if (holders === 0) close();
    }, RELEASE_GRACE_MS);
  };
}
