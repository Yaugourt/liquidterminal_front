"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Braces, ListOrdered, Receipt, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHeading, HlAddressText, KpiRibbon, TypedDataTable, type Column, type KpiCell } from "@/components/common";
import {
  decodeAction,
  getUserFills,
  normalizeAction,
  orderSummary,
  useAssetResolver,
  type AssetResolver,
  type WireOrder,
} from "@/services/explorer/address";
import type { UserFill, UserTransaction } from "@/services/explorer/address/types";
import type { ExtendedTransactionDetails, FormattedTransactionData } from "@/services/explorer/types";
import { ActionLabel, ActivityDetails, ActivityValue, AssetChip, ago, qty } from "@/components/explorer/address";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { cn } from "@/lib/utils";

const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumSignificantDigits: 6 })}`;
/** "SignatureChainId" → "Signature chain id": the formatter passes wire keys through as labels. */
const humanize = (label: string) =>
  /\s/.test(label) ? label : label.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])(?=[a-z])/g, (_, c: string) => ` ${c.toLowerCase()}`);
const utc = (t: number) => new Date(t).toISOString().replace("T", " ").slice(0, 19) + " UTC";

/** Order-placing actions whose orders are listed one per row. */
function ordersOf(action: Record<string, unknown> & { type: string }): WireOrder[] {
  if (action.type === "order") return (action.orders as WireOrder[] | undefined) ?? [];
  if (action.type === "modify") return action.order ? [action.order as WireOrder] : [];
  if (action.type === "batchModify") return ((action.modifies as { order: WireOrder }[] | undefined) ?? []).map((m) => m.order);
  return [];
}

interface OrderRow {
  i: number;
  order: WireOrder;
  summary: ReturnType<typeof orderSummary>;
}

/** Fills of this transaction, read from the signer's fills (Hyperliquid keeps the last 2,000). */
function useTxFills(user: string, hash: string, enabled: boolean) {
  const [fills, setFills] = useState<UserFill[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getUserFills(user)
      .then((all) => !cancelled && setFills(all.filter((f) => f.hash === hash)))
      .catch(() => !cancelled && setFills([]));
    return () => {
      cancelled = true;
    };
  }, [user, hash, enabled]);
  return fills;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0 text-[12.5px] min-w-0">
      <span className="w-40 shrink-0 text-text-tertiary">{label}</span>
      <span className="min-w-0 break-all text-text-primary">{children}</span>
    </div>
  );
}

/**
 * One HyperCore transaction, read top-down: what it did in one sentence, its
 * status and context (time, block, signer), then the orders it carried, the
 * fills it produced, the remaining parameters and the raw action.
 */
export function TransactionView({ tx, formatted }: { tx: ExtendedTransactionDetails; formatted: FormattedTransactionData }) {
  const assets = useAssetResolver();
  const action = useMemo(() => normalizeAction(tx.action), [tx.action]);
  const orders = useMemo(() => ordersOf(action), [action]);
  const decoded = useMemo(
    () => (assets ? decodeAction(tx as unknown as UserTransaction, assets) : null),
    [assets, tx]
  );
  const fills = useTxFills(tx.user, tx.hash, orders.length > 0 && !tx.error);
  const failed = Boolean(tx.error);

  const cells: KpiCell[] = [
    {
      label: "Status",
      value: failed ? "Rejected" : "Success",
      tone: failed ? "danger" : "success",
      sub: failed ? "not applied" : "applied on HyperCore",
    },
    { label: "Time", value: ago(tx.time) + " ago", sub: utc(tx.time) },
    {
      label: "Block",
      value: (
        <Link href={`/explorer/block/${tx.block}`} className="text-brand hover:underline">
          <span className="text-[17px] sm:text-[length:inherit]">{tx.block.toLocaleString("en-US")}</span>
        </Link>
      ),
      sub: "HyperCore",
    },
    {
      label: "Signer",
      value: (
        <Link href={`/explorer/address/${tx.user}`} className="text-brand hover:underline">
          <HlAddressText address={tx.user} className="text-[17px] sm:text-[length:inherit]" />
        </Link>
      ),
      sub: <CopyButton text={tx.user} />,
    },
    { label: "Action", value: action.type, sub: orders.length ? `${orders.length} order${orders.length > 1 ? "s" : ""}` : "wire name" },
  ];

  return (
    <div className="space-y-3">
      {/* What happened, in one line */}
      <Card padding="none">
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">In short</span>
            <span className="ml-auto flex items-center gap-1.5 min-w-0">
              <span className="mono text-[11.5px] text-text-tertiary truncate max-w-[60vw] sm:max-w-none" title={tx.hash}>
                {tx.hash}
              </span>
              <CopyButton text={tx.hash} />
            </span>
          </div>
          {decoded ? (
            <div className="flex flex-wrap items-start gap-x-8 gap-y-2 text-[13px]">
              <ActionLabel a={decoded} />
              <div className="flex-1 min-w-[240px]">
                <ActivityDetails a={decoded} currentAddress={tx.user} />
              </div>
              <div className="text-[14px]">
                <ActivityValue a={decoded} />
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] text-text-tertiary">Reading the action…</p>
          )}
        </div>
      </Card>

      <KpiRibbon cells={cells} />

      {failed && (
        <div className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px]">
          <AlertTriangle size={15} className="text-danger shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-text-primary">Hyperliquid rejected this action</div>
            <div className="text-danger mt-0.5">{tx.error}</div>
          </div>
        </div>
      )}

      {orders.length > 0 && assets && <OrdersCard orders={orders} assets={assets} />}

      {orders.length > 0 && !failed && <FillsCard fills={fills} assets={assets} />}

      {orders.length === 0 && <ParamsCard formatted={formatted} />}

      <RawCard action={tx.action} />
    </div>
  );
}

function OrdersCard({ orders, assets }: { orders: WireOrder[]; assets: AssetResolver }) {
  const rows: OrderRow[] = orders.map((order, i) => ({ i, order, summary: orderSummary(order, assets) }));
  const columns: Column<OrderRow>[] = [
    { key: "n", header: "#", className: "w-[40px]", accessor: (r) => <span className="mono text-text-tertiary">{r.i + 1}</span> },
    {
      key: "market",
      header: "Market",
      accessor: (r) => (r.summary.asset ? <AssetChip asset={r.summary.asset} /> : <span className="mono">#{r.order.a}</span>),
    },
    {
      key: "type",
      header: "Order",
      accessor: (r) => (
        <div>
          <span className={cn("font-medium", r.order.b ? "text-success" : "text-danger")}>{r.summary.label}</span>
          {r.summary.details.length > 0 && <div className="text-[11px] text-text-tertiary">{r.summary.details.join(" · ")}</div>}
        </div>
      ),
    },
    { key: "price", header: "Price", align: "right", accessor: (r) => <span className="mono">{usd(r.summary.price)}</span> },
    { key: "size", header: "Size", align: "right", accessor: (r) => <span className="mono">{qty(r.summary.size)}</span> },
    {
      key: "value",
      header: "Value",
      align: "right",
      className: "hidden sm:table-cell",
      accessor: (r) => <span className="mono text-text-secondary">{compactUsd(r.summary.usd)}</span>,
    },
  ];
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeading icon={<ListOrdered size={14} />} title="Orders" meta={`${orders.length}`} />
      <TypedDataTable<OrderRow> data={rows} columns={columns} getRowKey={(r) => String(r.i)} isLoading={false} error={null} emptyMessage="No order" />
    </Card>
  );
}

function FillsCard({ fills, assets }: { fills: UserFill[] | null; assets: AssetResolver | null }) {
  const columns: Column<UserFill>[] = [
    {
      key: "market",
      header: "Market",
      accessor: (f) => {
        const a = assets?.byCoin(f.coin);
        return a ? <AssetChip asset={a} /> : <span className="mono">{f.coin}</span>;
      },
    },
    {
      key: "dir",
      header: "Direction",
      accessor: (f) => <span className={f.side === "B" ? "text-success" : "text-danger"}>{f.dir}</span>,
    },
    { key: "px", header: "Price", align: "right", accessor: (f) => <span className="mono">{usd(Number(f.px))}</span> },
    { key: "sz", header: "Size", align: "right", accessor: (f) => <span className="mono">{qty(Number(f.sz))}</span> },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      className: "hidden sm:table-cell",
      accessor: (f) => (
        <span className="mono text-gold">
          {Number(f.fee).toLocaleString("en-US", { maximumSignificantDigits: 4 })} {f.feeToken}
        </span>
      ),
    },
    {
      key: "pnl",
      header: "Closed PnL",
      align: "right",
      className: "hidden md:table-cell",
      accessor: (f) => {
        const p = Number(f.closedPnl);
        if (!p) return <span className="text-text-tertiary">–</span>;
        return <span className={cn("mono", p > 0 ? "text-success" : "text-danger")}>{`${p > 0 ? "+" : "−"}${compactUsd(Math.abs(p))}`}</span>;
      },
    },
    {
      key: "role",
      header: "Role",
      align: "right",
      className: "hidden md:table-cell",
      accessor: (f) => <span className="text-[11.5px] text-text-tertiary">{f.crossed ? "taker" : "maker"}</span>,
    },
  ];
  const total = (fills ?? []).reduce((s, f) => s + Number(f.px) * Number(f.sz), 0);
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeading
        icon={<Zap size={14} />}
        title="Fills in this transaction"
        meta={fills && fills.length > 0 ? `${fills.length} · ${compactUsd(total)}` : undefined}
      />
      {fills == null ? (
        <p className="px-4 py-3 text-[12.5px] text-text-tertiary">Reading the signer&apos;s fills…</p>
      ) : fills.length === 0 ? (
        <p className="px-4 py-3 text-[12.5px] text-text-tertiary">
          No fill under this hash. A resting order that fills later shows up under the transaction that took it.
          Hyperliquid also only returns an address&apos;s last 2,000 fills.
        </p>
      ) : (
        <TypedDataTable<UserFill> data={fills} columns={columns} getRowKey={(f) => String(f.tid)} isLoading={false} error={null} emptyMessage="No fill" />
      )}
    </Card>
  );
}

function ParamsCard({ formatted }: { formatted: FormattedTransactionData }) {
  // The first section repeats type, user and time already shown above.
  const fields = formatted.sections.flatMap((s) => s.fields).filter((f) => !["Type", "User", "Time", "Hash", "Block"].includes(f.label));
  if (fields.length === 0) return null;
  const show = (v: FormattedTransactionData["sections"][number]["fields"][number]) => {
    if (v.value === null || v.value === undefined || v.value === "") return <span className="text-text-tertiary">–</span>;
    if (v.type === "boolean") return v.value ? "Yes" : "No";
    if (v.type === "address")
      return (
        <Link href={`/explorer/address/${v.value}`} className="mono text-brand hover:underline">
          <HlAddressText address={String(v.value)} />
        </Link>
      );
    if (v.type === "json")
      return (
        <pre className="mono text-[11.5px] text-text-secondary whitespace-pre-wrap">{String(v.value)}</pre>
      );
    if (v.type === "amount" || v.type === "hash") return <span className="mono">{String(v.value)}</span>;
    return String(v.value);
  };
  return (
    <Card padding="none">
      <CardHeading icon={<Receipt size={14} />} title="Parameters" />
      <div className="grid gap-x-8 px-4 py-2 lg:grid-cols-2">
        {fields.map((f, i) => (
          <Field key={`${f.label}-${i}`} label={humanize(f.label)}>
            {show(f)}
          </Field>
        ))}
      </div>
    </Card>
  );
}

function RawCard({ action }: { action: unknown }) {
  const json = useMemo(() => JSON.stringify(action, null, 2), [action]);
  return (
    <Card padding="none">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] focus-ring rounded-lg">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Braces size={13} className="text-brand" />
          </span>
          <span className="text-[13px] font-semibold text-text-primary">Raw action</span>
          <span className="text-[11px] text-text-tertiary group-open:hidden">as signed, click to open</span>
          <span className="ml-auto" onClick={(e) => e.preventDefault()}>
            <CopyButton text={json} />
          </span>
        </summary>
        <pre className="mono max-h-[480px] overflow-auto border-t border-border-subtle p-4 text-[11.5px] leading-relaxed text-text-secondary scrollbar-brand" tabIndex={0}>
          {json}
        </pre>
      </details>
    </Card>
  );
}
