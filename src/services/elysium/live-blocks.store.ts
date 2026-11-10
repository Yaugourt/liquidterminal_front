import { useEffect } from "react";
import { create } from "zustand";
import { WebSocketClient, PING_HEARTBEAT, HIDDEN_TAB_PAUSE_MS } from "@/lib/websocket-client";
import { API_URLS } from "@/services/api/constants";

/** A new Elysium mainnet block header, pushed live from our /ws `elysium_blocks` channel. */
export interface ElysiumLiveBlock {
  number: number;
  /** Unix seconds. */
  timestamp: number;
  gasUsed: number;
  gasLimit: number;
}

const MAX_BLOCKS = 24;

/** `${NEXT_PUBLIC_API}` with http(s) swapped to ws(s), plus /ws. */
function wsUrl(): string {
  const base = (API_URLS.LOCAL_BACKEND || "").replace(/^http/i, "ws").replace(/\/+$/, "");
  return `${base}/ws`;
}

interface ElysiumLiveState {
  blocks: ElysiumLiveBlock[];
  connected: boolean;
}

const useStore = create<ElysiumLiveState>(() => ({ blocks: [], connected: false }));

// One socket shared by every consumer, reference-counted like the liquidations store.
let client: WebSocketClient | null = null;
let refCount = 0;

function ingest(batch: ElysiumLiveBlock[]): void {
  const byNum = new Map<number, ElysiumLiveBlock>();
  for (const b of batch) if (Number.isFinite(b?.number)) byNum.set(b.number, b);
  for (const b of useStore.getState().blocks) if (!byNum.has(b.number)) byNum.set(b.number, b);
  const blocks = [...byNum.values()].sort((a, b) => b.number - a.number).slice(0, MAX_BLOCKS);
  useStore.setState({ blocks });
}

function connect(): void {
  refCount += 1;
  if (client) {
    client.connect();
    return;
  }
  client = new WebSocketClient({
    url: wsUrl(),
    maxReconnectAttempts: 10,
    baseReconnectDelay: 1000,
    heartbeat: PING_HEARTBEAT,
    pauseWhenHidden: HIDDEN_TAB_PAUSE_MS,
    onClose: () => useStore.setState({ connected: false }),
    onMessage: (data: unknown) => {
      const msg = data as { type?: string; data?: ElysiumLiveBlock[] };
      if (msg?.type === "connected") {
        useStore.setState({ connected: true });
        client?.send({ method: "subscribe", subscription: { type: "elysium_blocks" } });
        return;
      }
      if (msg?.type === "elysium_blocks" && Array.isArray(msg.data)) ingest(msg.data);
    },
  });
  client.connect();
}

function disconnect(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && client) {
    client.disconnect();
    client = null;
    useStore.setState({ blocks: [], connected: false });
  }
}

/**
 * Live Elysium mainnet blocks pushed from the backend (which streams the
 * archive node's newHeads over /ws). `enabled` is false on testnet, where the
 * head comes from the public RPC instead; the socket only opens when enabled.
 */
export function useElysiumLiveBlocks(enabled: boolean): {
  liveHead: number | null;
  liveBlocks: ElysiumLiveBlock[];
  connected: boolean;
} {
  const blocks = useStore((s) => s.blocks);
  const connected = useStore((s) => s.connected);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => disconnect();
  }, [enabled]);

  return {
    liveHead: enabled && blocks.length > 0 ? blocks[0].number : null,
    liveBlocks: enabled ? blocks : [],
    connected: enabled && connected,
  };
}
