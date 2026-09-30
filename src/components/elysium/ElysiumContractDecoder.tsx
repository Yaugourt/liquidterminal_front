"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import { Boxes, FileCode2, FlaskConical, ShieldAlert, UserSearch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHeading } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { OWNER_RENOUNCED, useContractContext, useDecodedContract, type ContractContext, type Decoded } from "@/services/elysium/decode";
import { AddrLink, EMPTY, EXPLORER, Empty, ExtLink, elysiumTimeLabel, short } from "./shared";

const simulateHref = (to: string, sig: string) => `/elysium/simulate?${new URLSearchParams({ to, sig, value: "0" }).toString()}`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : EMPTY;

function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "brand" | "warn" }) {
  const cls = {
    default: "bg-surface-2 text-text-secondary",
    brand: "bg-brand/10 text-brand",
    warn: "bg-warning/10 text-warning",
  }[tone];
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${cls}`}>{children}</span>;
}

/** One sentence of facts: what it is, who deployed it, how it is used. Nothing inferred beyond the data. */
function summary(d: Decoded, ctx: ContractContext | null): string {
  const parts: string[] = [];
  const kind = d.kinds[0] ?? "Contract";
  const id = [d.identity.name, d.identity.symbol && d.identity.symbol !== d.identity.name ? `(${d.identity.symbol})` : null].filter(Boolean).join(" ");
  parts.push(`${kind}${id ? ` ${id}` : ""}${d.proxy ? `, behind a ${d.proxy.type} proxy` : ""}.`);
  if (ctx?.deployment) {
    const others = (ctx.deployer?.contracts ?? 1) - 1;
    parts.push(`Deployed on ${day(ctx.deployment.at)} by ${short(ctx.deployment.deployer)}${others > 0 ? `, who deployed ${compactCount(others)} other contract${others > 1 ? "s" : ""}` : ""}.`);
  }
  if (ctx && ctx.usage.txs7d > 0) {
    const top = ctx.usage.topMethods[0];
    parts.push(
      `Called ${compactCount(ctx.usage.txs7d)} times by ${compactCount(ctx.usage.callers7d)} address${ctx.usage.callers7d > 1 ? "es" : ""} over 7 days${top?.name ? `, mostly ${top.name}` : ""}.`
    );
  } else if (ctx) parts.push("No call in the last 7 days.");
  return parts.join(" ");
}

function Identity({ d }: { d: Decoded }) {
  const i = d.identity;
  const rows: [string, React.ReactNode][] = [];
  if (i.name) rows.push(["Name", i.name]);
  if (i.symbol) rows.push(["Symbol", i.symbol]);
  if (i.decimals != null) rows.push(["Decimals", String(i.decimals)]);
  if (i.totalSupply != null) {
    const supply = i.decimals != null ? Number(formatUnits(i.totalSupply, i.decimals)) : Number(i.totalSupply);
    rows.push(["Total supply", supply.toLocaleString("en-US", { maximumFractionDigits: 2 })]);
  }
  if (i.owner) rows.push(["Owner", i.owner === OWNER_RENOUNCED ? <span className="text-success">renounced (zero address)</span> : <AddrLink address={i.owner} className="text-text-secondary" />]);
  if (i.token0 && i.token1) rows.push(["Pair", <span key="p" className="inline-flex gap-2"><AddrLink address={i.token0} className="text-text-secondary" /> / <AddrLink address={i.token1} className="text-text-secondary" /></span>]);
  if (i.factory) rows.push(["Factory", <AddrLink key="f" address={i.factory} className="text-text-secondary" />]);
  if (d.proxy) {
    rows.push(["Proxy", d.proxy.type]);
    if (d.proxy.implementation) rows.push(["Implementation", <AddrLink key="i" address={d.proxy.implementation} className="text-text-secondary" />]);
    if (d.proxy.admin) rows.push(["Proxy admin", <AddrLink key="a" address={d.proxy.admin} className="text-text-secondary" />]);
  }
  rows.push(["Bytecode", `${compactCount(d.codeSize)} bytes${d.compiler ? `, solc ${d.compiler}` : ""}`]);
  return (
    <table className="w-full text-[12px]">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-t border-border-subtle first:border-t-0">
            <td className="py-1.5 pr-3 text-text-tertiary whitespace-nowrap align-top">{k}</td>
            <td className="py-1.5 mono text-text-primary break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Behind({ ctx, loading }: { ctx: ContractContext | null; loading: boolean }) {
  if (!ctx) return <Empty>{loading ? "Loading…" : "No indexed context for this contract yet."}</Empty>;
  return (
    <div className="px-3.5 py-2 space-y-3 text-[12px]">
      {ctx.deployment ? (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-text-tertiary">Deployer</span>
            <AddrLink address={ctx.deployment.deployer} className="mono text-text-primary" />
            <span className="text-text-tertiary">
              {compactCount(ctx.deployer?.contracts ?? 1)} contracts since {day(ctx.deployer?.firstDeploy ?? null)}
            </span>
          </div>
          <div className="text-text-tertiary">
            Deployed {day(ctx.deployment.at)} at block {ctx.deployment.block.toLocaleString("en-US")},{" "}
            <ExtLink href={`${EXPLORER}/tx/${ctx.deployment.tx}`} className="mono text-text-secondary">tx {short(ctx.deployment.tx)}</ExtLink>
          </div>
        </div>
      ) : (
        <p className="text-text-tertiary">No deployment in our index: created at genesis or by another contract.</p>
      )}
      {ctx.deployer && ctx.deployer.others.length > 0 ? (
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">Also deployed by this address</div>
          <div className="flex flex-wrap gap-1.5">
            {ctx.deployer.others.map((o) => (
              <Link key={o.address} href={`/elysium/address/${o.address}`} className="rounded bg-surface-2 px-2 py-0.5 hover:text-brand">
                {o.symbol ? <span className="text-text-primary">{o.symbol}</span> : <span className="mono text-text-secondary">{short(o.address)}</span>}
                {o.name && o.name !== o.symbol ? <span className="text-text-tertiary"> {o.name}</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      {ctx.dex.pool || ctx.dex.factory || ctx.dex.pools.length ? (
        <div className="text-text-secondary">
          {ctx.dex.pool ? (
            <p>
              DEX pool ({ctx.dex.pool.version.toUpperCase()}
              {ctx.dex.pool.fee != null ? `, ${(ctx.dex.pool.fee / 10_000).toFixed(2)}% fee` : ""}) created by factory{" "}
              <AddrLink address={ctx.dex.pool.factory} className="mono" />.
            </p>
          ) : null}
          {ctx.dex.factory ? <p>DEX factory: {compactCount(ctx.dex.factory.pools)} pools created ({ctx.dex.factory.version?.toUpperCase()}).</p> : null}
          {ctx.dex.pools.length ? <p>Trades in {ctx.dex.pools.length}{ctx.dex.pools.length === 10 ? "+" : ""} DEX pool{ctx.dex.pools.length > 1 ? "s" : ""}.</p> : null}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Calls, 7d</div>
          <div className="mono text-text-primary">{compactCount(ctx.usage.txs7d)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Callers, 7d</div>
          <div className="mono text-text-primary">{compactCount(ctx.usage.callers7d)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Last call</div>
          <div className="mono text-text-primary">{ctx.usage.lastCall ? elysiumTimeLabel(ctx.usage.lastCall) : EMPTY}</div>
        </div>
      </div>
      {ctx.usage.topMethods.length ? (
        <div className="flex flex-wrap gap-1.5">
          {ctx.usage.topMethods.map((m) => (
            <span key={m.methodId || "none"} className="rounded bg-surface-2 px-2 py-0.5 mono">
              {m.name ?? (m.methodId || "value transfer")} <span className="text-text-tertiary">{compactCount(m.txs)}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Elysium contract decoder: what a contract is and who is behind it, without
 * a verified source. Bytecode is read from the chain (proxies followed),
 * function names come from a public signature database, and deployment and
 * usage come from our index. Everything shown is observed, never guessed.
 */
export function ElysiumContractDecoder({ address, hideWhenEoa = false }: { address: string; hideWhenEoa?: boolean }) {
  const { data: d, error, isLoading } = useDecodedContract(address);
  const { data: ctx, isLoading: ctxLoading } = useContractContext(d?.isContract ? address : null);

  if (d && !d.isContract) {
    if (hideWhenEoa) return null;
    return (
      <Card>
        <Empty>This address holds no code: it is a wallet (EOA), not a contract.</Empty>
      </Card>
    );
  }
  if (!d) {
    if (hideWhenEoa && !isLoading) return null;
    return (
      <Card>
        <Empty>{error ? "Could not read this contract from the Elysium RPC." : "Reading bytecode…"}</Empty>
      </Card>
    );
  }

  const named = d.functions.filter((f) => f.signature);
  const unknown = d.functions.length - named.length;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden flex flex-col">
        <CardHeading icon={<FileCode2 size={13} className="text-brand" />} title="What this contract is" meta="decoded from bytecode" metaVariant="plain" />
        <div className="px-3.5 py-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {d.kinds.length ? d.kinds.map((k) => <Chip key={k} tone="brand">{k}</Chip>) : <Chip>No standard interface detected</Chip>}
            {d.proxy ? <Chip tone="warn">{d.proxy.type} proxy</Chip> : null}
          </div>
          <p className="text-[13px] text-text-primary leading-relaxed">{summary(d, ctx ?? null)}</p>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<Boxes size={13} className="text-brand" />} title="Identity" meta="read from its own view functions" metaVariant="plain" />
          <div className="px-3.5 py-1.5">
            <Identity d={d} />
          </div>
        </Card>
        <Card className="overflow-hidden flex flex-col">
          <CardHeading icon={<UserSearch size={13} className="text-brand" />} title="Who is behind it" meta="from our index" metaVariant="plain" />
          <Behind ctx={ctx ?? null} loading={ctxLoading} />
        </Card>
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHeading icon={<ShieldAlert size={13} className="text-brand" />} title="Admin powers" meta={`${d.powers.length} found`} metaVariant="plain" />
        <div className="px-3.5 py-2 text-[12px]">
          {d.powers.length === 0 ? (
            <p className="text-text-tertiary py-1">No privileged function found among the decoded names.</p>
          ) : (
            <ul className="space-y-1.5">
              {d.powers.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-text-primary">{p.label}</span>
                  <span className="mono text-text-tertiary">{p.evidence.join(", ")}</span>
                  {p.id === "owner" && d.identity.owner === OWNER_RENOUNCED ? <span className="text-success">ownership renounced</span> : null}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-text-tertiary mt-2">
            Found by function name in the bytecode. A function existing does not prove who can call it: check the code or simulate a call.
          </p>
        </div>
      </Card>
      <Card className="overflow-hidden flex flex-col">
        <CardHeading
          icon={<FlaskConical size={13} className="text-brand" />}
          title="Functions"
          meta={`${named.length} named${unknown ? `, ${unknown} unknown` : ""}${d.proxy?.implementation ? ", from the implementation" : ""}`}
          metaVariant="plain"
        />
        <div className="px-3.5 py-2.5 flex flex-wrap gap-1.5 text-[12px]">
          {d.functions.length === 0 ? (
            <p className="text-text-tertiary">No function selector found in the bytecode.</p>
          ) : (
            d.functions.map((f) =>
              f.signature ? (
                <Link
                  key={f.selector}
                  href={simulateHref(address, f.signature)}
                  className="mono rounded bg-surface-2 px-2 py-0.5 text-text-secondary hover:text-brand"
                  title="Open in the simulator"
                >
                  {f.signature}
                </Link>
              ) : (
                <span key={f.selector} className="mono rounded bg-surface-2 px-2 py-0.5 text-text-tertiary">{f.selector}</span>
              )
            )
          )}
        </div>
        <p className="px-3.5 pb-2.5 text-[11px] text-text-tertiary">Click a function to prefill the simulator. Names come from a public signature database; unknown selectors stay as hex.</p>
      </Card>
    </div>
  );
}
