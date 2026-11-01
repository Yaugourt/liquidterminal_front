"use client";

import { formatUnits, isAddress } from "viem";

import { Card } from "@/components/ui/card";
import { CardHead, ModuleTable, ModuleTableRow } from "@/components/common";
import { NATIVE_TRANSFER_ADDRESS } from "@/services/elysium/rpc";
import { fmtArg, type DecodedLog } from "@/lib/elysium/sim-abi";
import type { AddressChanges, AssetChange } from "@/lib/elysium/balance-changes";
import { AddrLink, short } from "./shared";

export { decodeLog, fmtArg, parseArg, parseSig, revertText, toBigInt, type DecodedLog } from "@/lib/elysium/sim-abi";

/** Pieces shared by the Simulator's call and deploy modes. */

export function Field({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-text-tertiary mt-1">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-border-default bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus-ring";

export function Stat({ label, value, tone = "text-text-primary" }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">{label}</div>
      <div className={`mono truncate ${tone}`}>{value}</div>
    </div>
  );
}

export type TokenMeta = Record<string, { symbol: string; decimals: number }>;

/** Emitted events and native HYPE transfers of a simulation. */
export function EventsCard({ logs, meta, labels }: { logs: DecodedLog[]; meta: TokenMeta; labels?: Record<string, string> }) {
  const amount = (token: string, v: unknown) => {
    const m = token === NATIVE_TRANSFER_ADDRESS ? { symbol: "HYPE", decimals: 18 } : meta[token.toLowerCase()];
    return typeof v === "bigint" && m ? `${Number(formatUnits(v, m.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${m.symbol}` : fmtArg(v);
  };
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead title="Events and transfers" tag={`${logs.length} emitted`} />
      {logs.length === 0 ? (
        <p className="px-3.5 py-4 text-[12px] text-text-tertiary">No event emitted.</p>
      ) : (
        <div className="overflow-x-auto">
          <ModuleTable
            density="compact"
            columns={[
              { header: "Event", width: 161, align: "left" },
              { header: "Emitter", width: 200, align: "left", className: "hidden sm:table-cell" },
              { header: "Arguments", align: "left" },
            ]}
          >
            {logs.map((l, i) => {
              const native = l.log.address.toLowerCase() === NATIVE_TRANSFER_ADDRESS;
              const tag = labels?.[l.log.address.toLowerCase()] ?? meta[l.log.address.toLowerCase()]?.symbol;
              return (
                <ModuleTableRow
                  key={i}
                  className="align-top"
                  cells={[
                    <span key="e" className="block truncate text-text-primary" title={native ? "HYPE transfer" : l.name}>{native ? "HYPE transfer" : l.name}</span>,
                    // A long contract label wraps under the address instead of being cut.
                    <span key="m" className="flex flex-wrap items-baseline gap-x-1.5">
                      {native ? <span className="text-text-tertiary">native</span> : <AddrLink address={l.log.address} className="text-text-secondary" />}
                      {!native && tag ? <span className="text-text-tertiary">{tag}</span> : null}
                    </span>,
                    <div key="a" className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {l.args.map(([k, v]) => (
                        <span key={k} className="mono break-all">
                          <span className="text-text-tertiary">{k} </span>
                          {typeof v === "string" && isAddress(v) ? (
                            <AddrLink address={v} className="text-text-secondary" />
                          ) : ["value", "wad", "amount"].includes(k) && ["Transfer", "Approval", "Deposit", "Withdrawal"].includes(l.name) ? (
                            <span className="text-text-primary">{amount(l.log.address, v)}</span>
                          ) : (
                            <span className="text-text-primary">{fmtArg(v)}</span>
                          )}
                        </span>
                      ))}
                    </div>,
                  ]}
                />
              );
            })}
          </ModuleTable>
        </div>
      )}
    </Card>
  );
}

const ROLE_LABEL: Record<string, string> = { sender: "Sender", target: "Called contract" };

/**
 * Net balance changes of a simulation, per address: what the sender gives and
 * gets, then the contract and everyone else the call touched.
 */
export function BalanceChangesCard({
  rows,
  meta,
  sender,
  target,
}: {
  rows: AddressChanges[];
  meta: TokenMeta;
  sender: string;
  target?: string;
}) {
  const fmt = (c: AssetChange) => {
    if (c.kind === "nft") {
      const sym = meta[c.asset]?.symbol ?? short(c.asset);
      return `${c.delta > 0n ? "+" : ""}${c.delta.toString()} ${sym} NFT${c.nftIds?.length ? ` (#${c.nftIds.map((i) => i.slice(1)).join(", #")})` : ""}`;
    }
    const m = c.kind === "native" ? { symbol: "HYPE", decimals: 18 } : meta[c.asset];
    const sign = c.delta > 0n ? "+" : "−";
    const abs = c.delta < 0n ? -c.delta : c.delta;
    if (!m) return `${sign}${abs.toString()} (raw) ${short(c.asset)}`;
    return `${sign}${Number(formatUnits(abs, m.decimals)).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${m.symbol}`;
  };
  const role = (a: string) => (a === sender.toLowerCase() ? "sender" : target && a === target.toLowerCase() ? "target" : null);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead title="Balance changes" tag={rows.length ? `${rows.length} address${rows.length > 1 ? "es" : ""}` : undefined} />
      {rows.length === 0 ? (
        <p className="px-3.5 py-4 text-[12px] text-text-tertiary">No token or HYPE changes hands in this call.</p>
      ) : (
        <ul className="divide-y divide-border-subtle text-[12px]">
          {rows.map((r) => {
            const who = role(r.address);
            return (
              <li key={r.address} className="flex flex-col gap-1 px-3.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="flex min-w-0 items-baseline gap-2 sm:w-[220px] sm:shrink-0">
                  <AddrLink address={r.address} className="mono text-text-secondary" />
                  {who ? <span className={who === "sender" ? "text-brand" : "text-text-tertiary"}>{ROLE_LABEL[who]}</span> : null}
                </span>
                <span className="flex min-w-0 flex-wrap gap-x-4 gap-y-0.5">
                  {r.changes.map((c) => (
                    <span key={c.asset} className={`mono break-all ${c.delta > 0n ? "text-success" : c.delta < 0n ? "text-danger" : "text-text-secondary"}`}>
                      {fmt(c)}
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
