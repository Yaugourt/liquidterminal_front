"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TypedDataTable, type Column } from "@/components/common";
import type { Activity, ActivityKind } from "@/services/explorer/address";
import { cn } from "@/lib/utils";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ActionLabel, ActivityDetails, ActivityValue, ago } from "./ActivityParts";

type Filter = "all" | "trades" | "orders" | "transfers" | "staking" | "account";

const FILTERS: { id: Filter; label: string; kinds: ActivityKind[] | null }[] = [
  { id: "all", label: "All", kinds: null },
  { id: "trades", label: "Trades", kinds: ["trade"] },
  { id: "orders", label: "Orders", kinds: ["order"] },
  { id: "transfers", label: "Transfers & bridge", kinds: ["transfer", "bridge"] },
  { id: "staking", label: "Staking & vaults", kinds: ["staking", "vault"] },
  { id: "account", label: "Account & other", kinds: ["account", "evm", "system"] },
];

type Layer = "both" | "core" | "evm";

const LAYERS: { value: Layer; label: string }[] = [
  { value: "both", label: "Core + EVM" },
  { value: "core", label: "HyperCore" },
  { value: "evm", label: "HyperEVM" },
];

/**
 * Which layer a row belongs to. HyperEVM transactions are EVM only; a move
 * between HyperCore and HyperEVM touches both, so it shows on either side.
 */
function onLayer(a: Activity, layer: Layer): boolean {
  if (layer === "both") return true;
  const crossing = a.kind === "bridge" && /HyperEVM/.test(a.label);
  if (layer === "evm") return a.kind === "evm" || crossing;
  return a.kind !== "evm";
}

/**
 * Address activity, decoded: one row per thing that happened, read as a
 * sentence (action, size, market, price, counterparty), with its USD value
 * signed by whether money came in or left the address. Rejected actions are
 * hidden by default: bots resubmit them by the hundred.
 */
export function AddressActivityTable({
  activity,
  isLoading,
  error,
  currentAddress,
}: {
  activity: Activity[];
  isLoading: boolean;
  error: Error | null;
  currentAddress: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [layer, setLayer] = useState<Layer>("both");
  const [showFailed, setShowFailed] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Everything below (counts, rejected, rows) is scoped to the chosen layer.
  const onChosenLayer = useMemo(() => activity.filter((a) => onLayer(a, layer)), [activity, layer]);
  const failedCount = useMemo(() => onChosenLayer.filter((a) => a.failed).length, [onChosenLayer]);
  const counts = useMemo(() => {
    const c = new Map<Filter, number>();
    const base = onChosenLayer.filter((a) => showFailed || !a.failed);
    for (const f of FILTERS) c.set(f.id, f.kinds ? base.filter((a) => f.kinds!.includes(a.kind)).length : base.length);
    return c;
  }, [onChosenLayer, showFailed]);

  const rows = useMemo(() => {
    const kinds = FILTERS.find((f) => f.id === filter)?.kinds;
    return onChosenLayer.filter((a) => (showFailed || !a.failed) && (!kinds || kinds.includes(a.kind)));
  }, [onChosenLayer, filter, showFailed]);
  const paged = useMemo(() => rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [rows, page, rowsPerPage]);

  const columns: Column<Activity>[] = useMemo(
    () => [
      {
        key: "time",
        header: "Time",
        className: "hidden sm:table-cell w-[64px]",
        accessor: (a) => (
          <span className="mono text-[11.5px] text-text-tertiary" title={new Date(a.time).toISOString().replace("T", " ").slice(0, 19) + " UTC"}>
            {ago(a.time)}
          </span>
        ),
      },
      {
        key: "action",
        header: "Action",
        accessor: (a) => (
          <div>
            <ActionLabel a={a} />
            {/* Phones: the value rides under the action instead of a column off screen. */}
            <div className="sm:hidden pl-3.5 mt-0.5">
              <ActivityValue a={a} />
            </div>
          </div>
        ),
      },
      {
        key: "details",
        header: "Details",
        accessor: (a) => <ActivityDetails a={a} currentAddress={currentAddress} />,
      },
      {
        key: "value",
        header: "Value",
        align: "right",
        className: "hidden sm:table-cell",
        accessor: (a) => <ActivityValue a={a} />,
      },
      {
        key: "tx",
        header: "Tx",
        align: "right",
        className: "hidden md:table-cell",
        accessor: (a) =>
          a.hash ? (
            <Link href={`/explorer/transaction/${a.hash}`} prefetch={false} className="mono text-[11.5px] text-brand hover:underline" title={a.hash}>
              {a.hash.slice(0, 6)}…{a.hash.slice(-4)}
            </Link>
          ) : (
            <span className="text-[11px] text-text-tertiary" title="System transfer, no transaction hash">
              system
            </span>
          ),
      },
    ],
    [currentAddress]
  );

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <PillTabs
          tabs={LAYERS}
          activeTab={layer}
          onTabChange={(v) => {
            setLayer(v as Layer);
            setPage(0);
          }}
          className="mr-1.5"
        />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              setPage(0);
            }}
            aria-pressed={filter === f.id}
            className={cn(
              "px-2.5 py-1 rounded-md text-[12px] border transition-colors focus-ring",
              filter === f.id ? "text-brand border-brand/30 bg-brand/10" : "text-text-tertiary border-border-subtle hover:text-text-secondary"
            )}
          >
            {f.label} <span className="mono text-[10.5px] opacity-70">{counts.get(f.id) ?? 0}</span>
          </button>
        ))}
        {failedCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowFailed((v) => !v);
              setPage(0);
            }}
            aria-pressed={showFailed}
            className={cn(
              "ml-auto px-2.5 py-1 rounded-md text-[12px] border transition-colors focus-ring",
              showFailed ? "text-danger border-danger/30 bg-danger/10" : "text-text-tertiary border-border-subtle hover:text-text-secondary"
            )}
          >
            {showFailed ? "Hide" : "Show"} rejected <span className="mono text-[10.5px] opacity-70">{failedCount}</span>
          </button>
        )}
      </div>
      <TypedDataTable<Activity>
        data={paged}
        columns={columns}
        getRowKey={(a) => a.id}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load the activity"
        emptyMessage={filter === "all" ? "No activity found" : "Nothing in this category"}
        emptyDescription=""
        total={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(0);
        }}
        paginationDisabled={isLoading}
        className="bg-surface/60 border border-border-subtle rounded-lg"
      />
    </div>
  );
}
