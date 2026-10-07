"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatEther, formatGwei } from "viem";
import { ArrowRight, FileSearch, FlaskConical, Info, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardHead, KpiRibbon, ShareTile, type KpiCell } from "@/components/common";
import { fmtAmount, TX_HASH_RE, type DecodedCall, type TxInspection } from "@/lib/elysium/tx";
import { useRecentTxs, useTxInspection } from "@/services/elysium/tx";
import { EXPLORER, ExtLink, ago, short, useNow } from "./shared";
import { cn } from "@/lib/utils";

const ZERO = "0x0000000000000000000000000000000000000000";

/** Paste-a-hash box; also used on the empty search page. */
export function TxSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const hash = value.trim();
  const ok = TX_HASH_RE.test(hash);
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) router.push(`/elysium/tx/${hash.toLowerCase()}`);
      }}
    >
      <Input
        id="elysium-tx-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste an Elysium transaction hash (0x…)"
        spellCheck={false}
        className="h-10 font-mono text-text-primary"
      />
      <Button type="submit" disabled={!ok} className="h-10 bg-brand font-semibold text-brand-text-on hover:bg-brand/90">
        <Search className="mr-2 h-4 w-4" /> Inspect
      </Button>
    </form>
  );
}

/** Search page body: the box plus live examples from the newest blocks. */
export function ElysiumTxSearchPage() {
  const { data, isLoading } = useRecentTxs();
  return (
    <div className="space-y-4">
      <TxSearch />
      <Card className="overflow-hidden">
        <CardHead title="Latest transactions" tag="live" />
        <ul className="divide-y divide-border-subtle border-t border-border-subtle">
          {isLoading && !data ? (
            <li className="px-4 py-6 text-sm text-text-tertiary">Reading the newest blocks...</li>
          ) : (
            (data ?? []).map((t) => (
              <li key={t.hash}>
                <Link
                  href={`/elysium/tx/${t.hash}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 text-xs hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                >
                  <span className="mono truncate text-text-primary">{t.hash}</span>
                  <span className="mono hidden text-text-tertiary sm:inline">
                    {short(t.from)} → {t.to ? short(t.to) : "new contract"}
                  </span>
                  <span className="mono text-text-tertiary">#{t.block.toLocaleString("en-US")}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}

const hype = (wei: bigint) => `${fmtAmount(wei, 18, 9)} HYPE`;
const addrLink = (a: string) => (
  <Link href={`/elysium/address/${a.toLowerCase()}`} className="mono text-text-primary hover:text-brand">
    {short(a)}
  </Link>
);

/**
 * Elysium transaction inspector: status, Arbitrum type, fee split between
 * execution and posting to HyperEVM, decoded call (multicalls unfolded),
 * balance changes, token movements and decoded events, with a replay in the
 * simulator. Public RPC data only.
 */
export function ElysiumTxInspector({ hash }: { hash: string }) {
  const { data: tx, isLoading, error, valid, pending, refetch } = useTxInspection(hash);
  const now = useNow(10_000);

  // A pending transaction is re-read every 4s until it lands.
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => void refetch(), 4_000);
    return () => clearInterval(t);
  }, [pending, refetch]);

  if (!valid) {
    return (
      <div className="space-y-4">
        <TxSearch initial={hash} />
        <Card className="p-6 text-sm text-text-secondary">That is not a transaction hash: 0x followed by 64 hex characters.</Card>
      </div>
    );
  }
  if (isLoading && !tx) return <Card className="p-6 text-sm text-text-tertiary">Reading the transaction from Elysium...</Card>;
  if (!tx) {
    return (
      <div className="space-y-4">
        <TxSearch initial={hash} />
        <Card className="p-6 text-sm text-text-secondary">
          {error ? "The Elysium RPC did not answer. Try again in a moment." : "Elysium doesn't know this hash. It may be from another chain (HyperEVM, HyperCore) or not broadcast yet."}
        </Card>
      </div>
    );
  }
  return <Inspection tx={tx} now={now} />;
}

function Inspection({ tx, now }: { tx: TxInspection; now: number }) {
  const postingShare = tx.fee > 0n ? Number((tx.feePosting * 1_000_000n) / tx.fee) / 10_000 : 0;
  const gasPct = tx.gasLimit > 0n ? Number((tx.gasUsed * 10_000n) / tx.gasLimit) / 100 : 0;
  // Token decimals seen in this tx, to print event amounts in token units.
  const tokens = useMemo(() => {
    const m = new Map<string, { symbol: string | null; decimals: number | null }>();
    for (const mv of tx.tokenMoves) if (mv.kind === "erc20") m.set(mv.token.toLowerCase(), { symbol: mv.symbol, decimals: mv.decimals });
    return m;
  }, [tx.tokenMoves]);
  const replay = useMemo(() => {
    if (!tx.to || tx.system) return null;
    const sp = new URLSearchParams({ from: tx.from, to: tx.to, value: formatEther(tx.value), data: tx.input });
    return `/elysium/simulate?${sp.toString()}`;
  }, [tx]);

  const cells: KpiCell[] = [
    {
      key: "fee",
      label: "Fee",
      value: tx.system ? "None" : hype(tx.fee),
      sub: tx.system
        ? "system transaction"
        : `${postingShare > 0 && postingShare < 0.01 ? "<0.01" : postingShare.toFixed(postingShare < 1 ? 2 : 1)}% to post on HyperEVM`,
    },
    { key: "gas", label: "Gas used", value: tx.gasUsed.toLocaleString("en-US"), sub: `${gasPct.toFixed(1)}% of the ${tx.gasLimit.toLocaleString("en-US")} limit` },
    {
      key: "price",
      label: "Gas price",
      value: `${Number(formatGwei(tx.gasPrice)).toLocaleString("en-US", { maximumFractionDigits: 4 })} gwei`,
      sub: tx.baseFee !== null ? `base fee ${Number(formatGwei(tx.baseFee)).toLocaleString("en-US", { maximumFractionDigits: 4 })} gwei` : undefined,
    },
    {
      key: "block",
      label: "Block",
      value: tx.block !== null ? `#${tx.block.toLocaleString("en-US")}` : "Pending",
      sub: tx.parentBlock !== null ? `HyperEVM block #${tx.parentBlock.toLocaleString("en-US")}` : undefined,
    },
    { key: "value", label: "Value", value: hype(tx.value), sub: tx.timestamp ? `sent ${ago(tx.timestamp * 1000, now)} ago` : undefined },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <StatusPill status={tx.status} />
          <span title={tx.typeHint} className="rounded border border-border-subtle px-1.5 py-0.5 text-[11px] text-text-secondary">
            {tx.typeLabel}
          </span>
          <span className="mono min-w-0 flex-1 truncate text-xs text-text-tertiary">{tx.hash}</span>
          <div className="flex items-center gap-1.5">
            {replay && (
              <Link href={replay} className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1 text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary">
                <FlaskConical className="h-3.5 w-3.5 text-brand" /> Replay in simulator
              </Link>
            )}
            <ShareTile src={`/api/tile/elysium-tx?hash=${tx.hash}`} filename={`elysium-tx-${tx.hash.slice(0, 10)}`} label="Copy as image" />
            <ExtLink href={`${EXPLORER}/tx/${tx.hash}`} className="text-xs text-text-tertiary">Explorer</ExtLink>
          </div>
        </div>
        <KpiRibbon cells={cells} />
        {!tx.system && tx.fee > 0n && <FeeBar tx={tx} />}
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHead title="Call" />
          <div className="space-y-3 border-t border-border-subtle p-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {addrLink(tx.from)}
              <ArrowRight className="h-3.5 w-3.5 text-text-tertiary" />
              {tx.to ? addrLink(tx.to) : <span className="text-text-secondary">contract creation</span>}
              {tx.to && (
                <Link href={`/elysium/decode?address=${tx.to}`} className="ml-1 inline-flex items-center gap-1 text-text-tertiary hover:text-brand">
                  <FileSearch className="h-3.5 w-3.5" /> decode
                </Link>
              )}
              <span className="ml-auto text-text-tertiary">nonce {tx.nonce}</span>
            </div>
            {tx.createdContract && (
              <p className="text-text-secondary">
                Created {addrLink(tx.createdContract)}{" "}
                <Link href={`/elysium/decode?address=${tx.createdContract}`} className="text-text-tertiary hover:text-brand">(decode)</Link>
              </p>
            )}
            {tx.call ? <CallView call={tx.call} /> : <p className="text-text-tertiary">{tx.to ? "Plain HYPE transfer, no calldata." : `Init code, ${(tx.input.length - 2) / 2} bytes.`}</p>}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHead title="Balance changes" tag={tx.balanceChanges.length ? String(tx.balanceChanges.length) : undefined} />
          <div className="border-t border-border-subtle">
            {tx.balanceChanges.length === 0 ? (
              <p className="px-4 py-4 text-xs text-text-tertiary">No balance moved at the top level.</p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {tx.balanceChanges.map((b) => (
                  <li key={`${b.address}-${b.asset}`} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-2 text-xs">
                    {addrLink(b.address)}
                    <span className={cn("mono text-right", b.delta > 0n ? "text-success" : "text-danger")}>
                      {b.delta > 0n ? "+" : ""}
                      {fmtAmount(b.delta, b.decimals, b.asset === "HYPE" ? 9 : 6)} {b.symbol}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="flex gap-2 border-t border-border-subtle px-4 py-2.5 text-[11px] text-text-tertiary">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              Top-level value, fee and token transfers. HYPE moved by internal calls (unwraps, refunds) is not shown: public Elysium RPCs don&apos;t expose tracing.
            </p>
          </div>
        </Card>
      </div>

      {tx.tokenMoves.length > 0 && (
        <Card className="overflow-hidden">
          <CardHead title="Token movements" tag={String(tx.tokenMoves.length)} />
          <ul className="divide-y divide-border-subtle border-t border-border-subtle">
            {tx.tokenMoves.map((m, i) => {
              const mint = m.from.toLowerCase() === ZERO;
              const burn = m.to.toLowerCase() === ZERO;
              return (
                <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs">
                  <span className="mono w-full shrink-0 text-text-primary sm:w-36">
                    {m.kind === "erc721" ? `#${m.amount.toString()}` : fmtAmount(m.amount, m.decimals)}{" "}
                    <Link href={`/elysium/address/${m.token.toLowerCase()}`} className="text-text-secondary hover:text-brand">
                      {m.symbol ?? short(m.token)}
                    </Link>
                  </span>
                  {mint ? <span className="rounded bg-success/10 px-1.5 text-[10px] font-semibold text-success">MINT</span> : addrLink(m.from)}
                  <ArrowRight className="h-3.5 w-3.5 text-text-tertiary" />
                  {burn ? <span className="rounded bg-danger/10 px-1.5 text-[10px] font-semibold text-danger">BURN</span> : addrLink(m.to)}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardHead title="Events" tag={String(tx.logs.length)} />
        {tx.logs.length === 0 ? (
          <p className="border-t border-border-subtle px-4 py-4 text-xs text-text-tertiary">No events emitted.</p>
        ) : (
          <ol className="divide-y divide-border-subtle border-t border-border-subtle">
            {tx.logs.map((l, i) => (
              <li key={i} className="space-y-1 px-4 py-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono text-text-tertiary">{i}</span>
                  <span className="font-medium text-text-primary">{l.sigName ?? l.name}</span>
                  {l.sigName && <span className="text-[10px] text-text-tertiary">name from the public signature database</span>}
                  <span className="ml-auto">{addrLink(l.log.address)}</span>
                </div>
                {!l.sigName && l.args.length > 0 && (
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 pl-5">
                    {l.args.map(([k, v]) => {
                      const t = tokens.get(l.log.address.toLowerCase());
                      const amountField = ["value", "wad", "amount"].includes(k) && typeof v === "bigint" && t?.decimals != null;
                      return (
                        <ArgRow
                          key={k}
                          name={k}
                          value={amountField ? `${fmtAmount(v as bigint, t!.decimals)} ${t!.symbol ?? ""}`.trim() : String(v)}
                        />
                      );
                    })}
                  </dl>
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

function StatusPill({ status }: { status: TxInspection["status"] }) {
  const tone =
    status === "success" ? "bg-success/10 text-success" : status === "reverted" ? "bg-danger/10 text-danger" : "bg-gold/10 text-gold";
  const label = status === "success" ? "Success" : status === "reverted" ? "Reverted" : "Pending";
  return <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tone)}>{label}</span>;
}

function FeeBar({ tx }: { tx: TxInspection }) {
  const posting = tx.fee > 0n ? Number((tx.feePosting * 1_000_000n) / tx.fee) / 10_000 : 0;
  return (
    <div className="space-y-1.5 border-t border-border-subtle px-4 py-3 text-[11px]">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-brand" style={{ width: `${100 - posting}%` }} />
        <div className="h-full bg-gold" style={{ width: `${Math.max(posting, 0.5)}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-text-tertiary">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-brand" />
          Execution on Elysium · {hype(tx.feeExecution)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />
          Posting to HyperEVM · {hype(tx.feePosting)} ({tx.gasUsedForL1.toLocaleString("en-US")} gas)
        </span>
      </div>
    </div>
  );
}

function CallView({ call, nested = false }: { call: DecodedCall; nested?: boolean }) {
  return (
    <div className={cn("space-y-1.5", nested && "border-l border-border-subtle pl-3")}>
      <p className="mono break-all">
        <span className="text-brand">{call.name ?? "Unknown function"}</span>
        <span className="ml-2 text-text-tertiary">{call.selector}</span>
      </p>
      {call.args.length > 0 && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5">
          {call.args.map(([k, v]) => (
            <ArgRow key={k} name={k} value={v} />
          ))}
        </dl>
      )}
      {call.inner.map((c, i) => (
        <CallView key={i} call={c} nested />
      ))}
      {!call.name && <p className="text-text-tertiary">Selector not in the public signature database.</p>}
    </div>
  );
}

function ArgRow({ name, value }: { name: string; value: string }) {
  const isAddr = /^0x[0-9a-fA-F]{40}$/.test(value);
  return (
    <>
      <dt className="text-text-tertiary">{name}</dt>
      <dd className="mono min-w-0 break-all text-text-secondary">{isAddr ? addrLink(value) : value}</dd>
    </>
  );
}
