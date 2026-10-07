"use client";

import { useEffect, useMemo, useState } from "react";
import { formatEther, parseTransaction, recoverTransactionAddress, type Hex } from "viem";
import Link from "next/link";
import { AlertTriangle, Braces } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHead, CellValue, HlAddressText, KpiRibbon, TypedDataTable, type Column, type KpiCell } from "@/components/common";
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
    {
      label: "Action",
      value: (
        <span className="block truncate text-[15px] sm:text-[17px]" title={action.type}>
          {action.type}
        </span>
      ),
      sub: orders.length ? `${orders.length} order${orders.length > 1 ? "s" : ""}` : "wire name" },
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

      {action.type === "evmRawTx" && typeof action.data === "string" && <EvmTxCard raw={action.data as Hex} />}

      {orders.length === 0 && <ParamsCard formatted={formatted} actionType={action.type} assets={assets} />}

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
        <CellValue
          align="left"
          value={r.summary.label}
          tone={r.order.b ? "success" : "danger"}
          sub={r.summary.details.length > 0 ? r.summary.details.join(" · ") : undefined}
        />
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
      <CardHead title="Orders" tag={`${orders.length}`} />
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
      type: "text",
      tone: () => "muted",
      accessor: (f) => (f.crossed ? "taker" : "maker"),
    },
  ];
  const total = (fills ?? []).reduce((s, f) => s + Number(f.px) * Number(f.sz), 0);
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHead
        title="Fills in this transaction"
        tag={fills && fills.length > 0 ? `${fills.length} · ${compactUsd(total)}` : undefined}
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

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
/** Fields that only describe the signature envelope. */
const ENVELOPE = new Set(["Signature chain id", "Hyperliquid chain", "Nonce"]);

/** A long list (oracle prices, vault lists) folds behind its size instead of filling the page. */
function LongJson({ text }: { text: string }) {
  let size = "";
  try {
    const v = JSON.parse(text);
    if (Array.isArray(v)) size = `${v.length} entries`;
    else if (v && typeof v === "object") size = `${Object.keys(v).length} fields`;
  } catch {
    // not JSON: show as is
  }
  if (text.split("\n").length <= 8) return <pre className="mono text-[11.5px] text-text-secondary whitespace-pre-wrap">{text}</pre>;
  return (
    <details>
      <summary className="cursor-pointer text-brand hover:underline">{size || "Show"}</summary>
      <pre className="mono mt-1.5 max-h-[320px] overflow-auto text-[11.5px] text-text-secondary whitespace-pre-wrap scrollbar-brand">{text}</pre>
    </details>
  );
}

function ParamsCard({
  formatted,
  actionType,
  assets,
}: {
  formatted: FormattedTransactionData;
  actionType: string;
  assets: AssetResolver | null;
}) {
  // The first section repeats type, user and time already shown above.
  const all = formatted.sections
    .flatMap((s) => s.fields)
    .filter((f) => !["Type", "User", "Time", "Hash", "Block"].includes(f.label))
    .map((f) => ({ ...f, label: humanize(f.label) }));
  // Envelope fields last: they say how it was signed, not what it did.
  const fields = [...all.filter((f) => !ENVELOPE.has(f.label)), ...all.filter((f) => ENVELOPE.has(f.label))];
  if (fields.length === 0) return null;

  const show = (f: (typeof fields)[number]) => {
    const v = f.value;
    if (v === null || v === undefined || v === "") return <span className="text-text-tertiary">–</span>;
    const text = String(v);
    if (f.type === "boolean" || text === "true" || text === "false") return v === true || text === "true" ? "Yes" : "No";
    // Asset ids read as the market they point to.
    if (/^asset$/i.test(f.label) && /^\d+$/.test(text) && assets) {
      const a = assets.byId(Number(text));
      if (a)
        return (
          <span className="inline-flex items-center gap-2">
            <AssetChip asset={a} />
            <span className="mono text-[11px] text-text-tertiary">id {text}</span>
          </span>
        );
    }
    // vaultTransfer carries USDC in micro units.
    if (actionType === "vaultTransfer" && f.label === "Usd" && /^\d+$/.test(text))
      return <span className="mono">{(Number(text) / 1e6).toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC</span>;
    if (f.type === "address" || ADDRESS.test(text))
      return (
        <Link href={`/explorer/address/${text}`} className="mono text-brand hover:underline" title={text}>
          <HlAddressText address={text} />
        </Link>
      );
    if (f.type === "json") return <LongJson text={text} />;
    // Calldata and signed payloads: the first bytes, the rest on demand.
    if (/^0x[0-9a-f]+$/i.test(text) && text.length > 140)
      return (
        <details>
          <summary className="cursor-pointer">
            <span className="mono">{text.slice(0, 66)}…</span> <span className="text-brand hover:underline">{(text.length - 2) / 2} bytes</span>
          </summary>
          <span className="mono mt-1.5 block break-all text-[11.5px] text-text-secondary">{text}</span>
        </details>
      );
    if (f.type === "amount" || f.type === "hash" || /^0x[0-9a-f]+$/i.test(text)) return <span className="mono">{text}</span>;
    return text;
  };

  return (
    <Card padding="none">
      <CardHead title="Parameters" />
      <div className="grid gap-x-8 px-4 py-2 lg:grid-cols-2">
        {fields.map((f, i) => (
          <Field key={`${f.label}-${i}`} label={actionType === "vaultTransfer" && f.label === "Usd" ? "Amount" : f.label}>
            {show(f)}
          </Field>
        ))}
      </div>
    </Card>
  );
}

/**
 * An EVM transaction sent through HyperCore (evmRawTx): the signed payload is
 * decoded here, and the sender recovered from its signature.
 */
function EvmTxCard({ raw }: { raw: Hex }) {
  const parsed = useMemo(() => {
    try {
      return parseTransaction(raw);
    } catch {
      return null;
    }
  }, [raw]);
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    recoverTransactionAddress({ serializedTransaction: raw as Parameters<typeof recoverTransactionAddress>[0]["serializedTransaction"] })
      .then((a) => !cancelled && setFrom(a))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [raw]);
  if (!parsed) return null;
  const addr = (a: string | null | undefined) =>
    a ? (
      <Link href={`/explorer/address/${a}`} className="mono text-brand hover:underline" title={a}>
        <HlAddressText address={a} />
      </Link>
    ) : (
      <span className="text-text-tertiary">contract creation</span>
    );
  return (
    <Card padding="none">
      <CardHead title="HyperEVM transaction" tag={parsed.type} />
      <div className="grid gap-x-8 px-4 py-2 lg:grid-cols-2">
        <Field label="From">{from ? addr(from) : <span className="text-text-tertiary">recovering…</span>}</Field>
        <Field label="To">{addr(parsed.to)}</Field>
        <Field label="Value">
          <span className="mono">{formatEther(parsed.value ?? BigInt(0))} HYPE</span>
        </Field>
        <Field label="Method">
          <span className="mono">{parsed.data && parsed.data.length >= 10 ? parsed.data.slice(0, 10) : "transfer"}</span>
        </Field>
        <Field label="Nonce">
          <span className="mono">{parsed.nonce ?? "–"}</span>
        </Field>
        <Field label="Gas limit">
          <span className="mono">{parsed.gas != null ? parsed.gas.toLocaleString("en-US") : "–"}</span>
        </Field>
        <Field label="Chain">
          <span className="mono">{parsed.chainId === 999 ? "HyperEVM (999)" : parsed.chainId ?? "–"}</span>
        </Field>
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
