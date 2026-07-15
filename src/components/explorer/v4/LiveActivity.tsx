"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Activity,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useExplorerStore } from "@/services/explorer";
import type { Block, Transaction } from "@/services/explorer/types";
import {
  ModuleTable,
  ModuleTableRow,
} from "@/components/common";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";

/**
 * LiveActivity — paired Latest Blocks + Latest Transactions cards feeding off
 * the HyperCore L1 websocket (`useExplorerStore`).
 *
 * Each card supports:
 *  - **Pause / Play** — pauses the rendered list (the websocket keeps filling
 *    the store in the background; clicking Play resyncs to current state).
 *  - **Pagination** — `ROWS_PER_PAGE` rows per page, navigable as long as the
 *    store has more buffered (`MAX_PAGES * ROWS_PER_PAGE` ceiling).
 *
 * Both cards consume the same Zustand store via selectors so renders only
 * fire on actual data changes.
 */

const ROWS_PER_PAGE = 10;
const MAX_PAGES = 5; // cap pagination so the user can scroll back ~50 events

function LivePill({
  connected,
  paused,
}: {
  connected: boolean;
  paused: boolean;
}) {
  if (paused) {
    return (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1.5 border bg-gold/10 text-gold border-gold/25">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        PAUSED
      </span>
    );
  }
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1.5 border ${
        connected
          ? "bg-success/10 text-success border-success/25"
          : "bg-danger/10 text-danger border-danger/25"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? "bg-success animate-pulse" : "bg-danger"
        }`}
      />
      {connected ? "LIVE" : "OFF"}
    </span>
  );
}

/** Toolbar shared by Blocks and Tx cards — pause toggle + pagination chevrons. */
function StreamToolbar({
  paused,
  onTogglePause,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  paused: boolean;
  onTogglePause: () => void;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Resume stream" : "Pause stream"}
        className="w-6 h-6 rounded-md grid place-items-center bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors"
      >
        {paused ? <Play size={11} /> : <Pause size={11} />}
      </button>
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        aria-label="Previous page"
        className="w-6 h-6 rounded-md grid place-items-center bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:hover:bg-surface-2 disabled:hover:text-text-secondary"
      >
        <ChevronLeft size={12} />
      </button>
      <span className="mono text-[10px] text-text-tertiary px-1 min-w-[34px] text-center">
        {page + 1}/{totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
        className="w-6 h-6 rounded-md grid place-items-center bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:hover:bg-surface-2 disabled:hover:text-text-secondary"
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

function BlocksCard({
  blocks,
  connected,
}: {
  blocks: Block[];
  connected: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState<Block[] | null>(null);
  const [page, setPage] = useState(0);

  // Capture / release the frozen snapshot when the user toggles pause.
  useEffect(() => {
    if (paused) setFrozen([...blocks]);
    else setFrozen(null);
    // We only react to `paused` flips; consuming `blocks` here would refreeze
    // the snapshot on every websocket tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const view = frozen ?? blocks;
  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGES, Math.ceil(view.length / ROWS_PER_PAGE)),
  );
  const safePage = Math.min(page, totalPages - 1);
  const rows = view.slice(
    safePage * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Boxes size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Latest blocks</h3>
        <LivePill connected={connected} paused={paused} />
        <div className="ml-auto flex items-center gap-2">
          <StreamToolbar
            paused={paused}
            onTogglePause={() => {
              setPaused((p) => !p);
              setPage(0);
            }}
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          Waiting for blocks…
        </div>
      ) : (
        <ModuleTable
          density="compact"
          columns={[
            { header: "Block",    align: "left" },
            { header: "Age",      align: "left" },
            { header: "Txs",      align: "right" },
            { header: "Proposer", align: "right" },
          ]}
        >
          {rows.map((b) => (
            <ModuleTableRow
              key={b.height}
              href={`/explorer/block/${b.height}`}
              cells={[
                <span key="block" className="mono font-semibold text-brand">
                  {b.height.toLocaleString()}
                </span>,
                <span key="age" className="mono text-text-tertiary">
                  {timeAgo(b.blockTime)}
                </span>,
                <span key="txs" className="mono text-text-primary">
                  {b.numTxs}
                </span>,
                <span key="proposer" className="mono text-text-secondary">
                  {truncateAddress(b.proposer)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      )}
    </Card>
  );
}

function TxCard({
  transactions,
  connected,
}: {
  transactions: Transaction[];
  connected: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const [frozen, setFrozen] = useState<Transaction[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (paused) setFrozen([...transactions]);
    else setFrozen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const view = frozen ?? transactions;
  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGES, Math.ceil(view.length / ROWS_PER_PAGE)),
  );
  const safePage = Math.min(page, totalPages - 1);
  const rows = view.slice(
    safePage * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Latest transactions</h3>
        <LivePill connected={connected} paused={paused} />
        <div className="ml-auto flex items-center gap-2">
          <StreamToolbar
            paused={paused}
            onTogglePause={() => {
              setPaused((p) => !p);
              setPage(0);
            }}
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
          Waiting for transactions…
        </div>
      ) : (
        <ModuleTable
          density="compact"
          columns={[
            { header: "Age",    align: "left" },
            { header: "User",   align: "left" },
            { header: "Action", align: "right" },
            { header: "Status", align: "right" },
          ]}
        >
          {rows.map((t) => (
            <ModuleTableRow
              key={t.hash}
              href={`/explorer/transaction/${t.hash}`}
              cells={[
                <span key="age" className="mono text-text-tertiary">
                  {timeAgo(t.time)}
                </span>,
                <span key="user" className="mono text-brand">
                  {truncateAddress(t.user)}
                </span>,
                <span key="action" className="text-text-secondary text-[11px]">
                  {t.action?.type ?? "—"}
                </span>,
                <span
                  key="status"
                  className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${
                    t.error
                      ? "bg-danger/10 text-danger"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {t.error ? "fail" : "ok"}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      )}
    </Card>
  );
}

export const LiveActivity = memo(function LiveActivity() {
  // Subscribe via selectors so renders only fire on the values we read.
  const blocks = useExplorerStore((s) => s.blocks);
  const transactions = useExplorerStore((s) => s.transactions);
  const isBlocksConnected = useExplorerStore((s) => s.isBlocksConnected);
  const isTransactionsConnected = useExplorerStore(
    (s) => s.isTransactionsConnected,
  );

  // Mount-time effect connects both websockets through the static store API
  // so the effect doesn't re-run when the store updates.
  useEffect(() => {
    const store = useExplorerStore.getState();
    store.connectBlocks();
    store.connectTransactions();
    return () => {
      const s = useExplorerStore.getState();
      s.disconnectBlocks();
      s.disconnectTransactions();
    };
  }, []);

  // Memoise the props so we don't churn the children when the parent renders.
  const blocksValue = useMemo(() => blocks, [blocks]);
  const txValue = useMemo(() => transactions, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
      <BlocksCard blocks={blocksValue} connected={isBlocksConnected} />
      <TxCard transactions={txValue} connected={isTransactionsConnected} />
    </div>
  );
});
