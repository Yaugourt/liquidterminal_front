"use client";

import { formatUnits, isAddress } from "viem";

import { Card } from "@/components/ui/card";
import { CardHead } from "@/components/common";
import { NATIVE_TRANSFER_ADDRESS } from "@/services/elysium/rpc";
import { fmtArg, type DecodedLog } from "@/lib/elysium/sim-abi";
import { AddrLink } from "./shared";

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
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                <th className="text-left font-semibold px-3.5 py-2">Event</th>
                <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Emitter</th>
                <th className="text-left font-semibold px-3.5 py-2">Arguments</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => {
                const native = l.log.address.toLowerCase() === NATIVE_TRANSFER_ADDRESS;
                const tag = labels?.[l.log.address.toLowerCase()] ?? meta[l.log.address.toLowerCase()]?.symbol;
                return (
                  <tr key={i} className="border-t border-border-subtle align-top">
                    <td className="px-3.5 py-1.5 whitespace-nowrap text-text-primary">{native ? "HYPE transfer" : l.name}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap hidden sm:table-cell">
                      {native ? <span className="text-text-tertiary">native</span> : <AddrLink address={l.log.address} className="text-text-secondary" />}
                      {!native && tag ? <span className="ml-1.5 text-text-tertiary">{tag}</span> : null}
                    </td>
                    <td className="px-3.5 py-1.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
