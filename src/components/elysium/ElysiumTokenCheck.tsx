"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatUnits, isAddress } from "viem";
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, type KpiCell } from "@/components/common";
import { compactCount, formatPct } from "@/lib/formatters/numberFormatting";
import { useElysiumTokenLaunches } from "@/services/elysium";
import { useTokenCheck, type Finding, type Level, type TokenCheck, type TransferLeg } from "@/services/elysium/token-check";
import { AddrLink, EMPTY, short } from "./shared";

/** Wrapped HYPE and stablecoins: not what anyone wants to check before buying. */
const PLUMBING = /^(W?HYPE|WNATIVE|.*USD.*|USDT\d*|tUSD)$/i;

/**
 * Elysium · Token checker: paste a token, get what its owner can do and
 * whether it moves like a normal token. The address lives in the URL so a
 * check can be shared.
 */
export function ElysiumTokenCheck() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = sp.get("address");
  const [input, setInput] = useState(current ?? "");
  const [err, setErr] = useState<string | null>(null);
  const { data: launches } = useElysiumTokenLaunches(14);
  // Busy tokens people hold, minus the plumbing (wrapped HYPE, stables).
  // Copycats reuse a popular symbol: keep the most held token of each.
  const picks = (launches?.topTokens ?? [])
    .filter((t, i, all) => t.symbol && !PLUMBING.test(t.symbol) && all.findIndex((o) => o.symbol === t.symbol) === i)
    .slice(0, 6);

  const go = (a: string) => {
    const v = a.trim();
    if (!isAddress(v)) return setErr("Not an address: expected 0x followed by 40 hex characters.");
    setErr(null);
    setInput(v);
    router.replace(`${pathname}?address=${v.toLowerCase()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <Card className="p-3.5 space-y-2.5">
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); go(input); }}>
          <label htmlFor="check-address" className="sr-only">Token address</label>
          <input
            id="check-address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Token address, 0x…"
            spellCheck={false}
            className="flex-1 rounded-md border border-border-default bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus-ring"
          />
          <Button type="submit" size="sm"><ShieldCheck size={13} className="mr-1.5" />Check</Button>
        </form>
        {err ? <p className="text-[12px] text-danger">{err}</p> : null}
        {picks.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-text-tertiary">Most held</span>
            {picks.map((p) => (
              <button key={p.address} type="button" onClick={() => go(p.address)} className="rounded bg-surface-2 px-2 py-0.5 hover:text-brand focus-ring">
                {p.symbol}
              </button>
            ))}
          </div>
        ) : null}
      </Card>
      {current && isAddress(current) ? <Result key={current} address={current} /> : <HowItWorks />}
    </div>
  );
}

function Result({ address }: { address: string }) {
  const { data, isLoading, error } = useTokenCheck(address);
  if (isLoading && !data) {
    return (
      <Card className="px-3.5 py-8 text-center text-[12px] text-text-tertiary">
        Reading the bytecode, finding a holder and simulating transfers…
      </Card>
    );
  }
  if (error || !data) {
    return <Card className="px-3.5 py-6 text-center text-[12px] text-danger">{error?.message ?? "Check failed."}</Card>;
  }
  return <Report check={data} />;
}

const LEVEL: Record<Level, { icon: typeof Info; tone: string; label: string }> = {
  bad: { icon: AlertOctagon, tone: "text-danger", label: "red flag" },
  warn: { icon: AlertTriangle, tone: "text-gold", label: "to watch" },
  info: { icon: Info, tone: "text-text-tertiary", label: "note" },
  ok: { icon: CheckCircle2, tone: "text-success", label: "fine" },
};

function amount(v: bigint | null, decimals: number | null, symbol: string | null) {
  if (v === null) return EMPTY;
  const n = Number(formatUnits(v, decimals ?? 18));
  return `${n.toLocaleString("en-US", { maximumSignificantDigits: 6 })}${symbol ? ` ${symbol}` : ""}`;
}

function Report({ check }: { check: TokenCheck }) {
  const { decoded, context, findings, legs } = check;
  const id = decoded.identity;
  const launch = context?.launch ?? null;
  const counts = { bad: findings.filter((f) => f.level === "bad").length, warn: findings.filter((f) => f.level === "warn").length };
  const born = launch?.at ?? context?.deployment?.at ?? null;

  const cells: KpiCell[] = [
    { key: "supply", label: "Supply", value: amount(id.totalSupply, id.decimals, null), sub: id.decimals !== null ? `${id.decimals} decimals` : undefined },
    {
      key: "holders",
      label: "Holders",
      value: launch?.holders != null ? compactCount(launch.holders) : EMPTY,
      sub: launch?.top10Pct != null ? `top 10 hold ${formatPct(launch.top10Pct, { from: "percent" })}` : "launchpad tokens only",
    },
    {
      key: "origin",
      label: "Launched on",
      value: launch?.launchpad ?? (context?.token?.origin === "bridged" ? "Bridge" : EMPTY),
      sub: launch ? (launch.graduated ? "graduated" : "still on its curve or pool") : undefined,
    },
    { key: "born", label: "Created", value: born ? new Date(born).toISOString().slice(0, 10) : EMPTY, sub: context?.deployment ? `by ${short(context.deployment.deployer)}` : undefined },
    { key: "pools", label: "DEX pools", value: context ? String(context.dex.pools.length) : EMPTY, sub: check.pool ? `tested ${short(check.pool)}` : undefined },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3">
          <span className="text-[15px] font-semibold text-text-primary">{id.symbol ?? short(check.address)}</span>
          {id.name ? <span className="text-[13px] text-text-secondary">{id.name}</span> : null}
          <span className="mono flex items-center gap-1 text-[11px] text-text-tertiary">{check.address}<CopyButton text={check.address} /></span>
          <span className="flex-1" />
          <span className="flex flex-wrap gap-1.5 text-[12px]">
            <Link href={`/elysium/decode?address=${check.address.toLowerCase()}`} className="rounded-md border border-border-subtle px-2.5 py-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary">Full decode</Link>
            <Link href={`/elysium/address/${check.address.toLowerCase()}`} className="rounded-md border border-border-subtle px-2.5 py-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary">Activity</Link>
          </span>
        </div>
        <KpiRibbon cells={cells} />
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden flex flex-col">
          <CardHead
            title="What we found"
            tag={counts.bad || counts.warn ? `${counts.bad} red flag${counts.bad === 1 ? "" : "s"} · ${counts.warn} to watch` : "nothing flagged"}
          />
          <ul className="divide-y divide-border-subtle">
            {findings.map((f) => <FindingRow key={f.id} f={f} />)}
          </ul>
        </Card>

        <div className="space-y-4 min-w-0">
          <TransferTest check={check} legs={legs} />
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Contract" />
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 px-3.5 py-3 text-[12px]">
              <dt className="text-text-tertiary">Owner</dt>
              <dd className="min-w-0 mono">{id.owner ? <AddrLink address={id.owner} className="text-text-secondary" /> : <span className="text-text-tertiary">no owner()</span>}</dd>
              <dt className="text-text-tertiary">Proxy</dt>
              <dd className="min-w-0 text-text-secondary">{decoded.proxy ? `${decoded.proxy.type}${decoded.proxy.implementation ? `, logic ${short(decoded.proxy.implementation)}` : ""}` : "No, the code is fixed"}</dd>
              <dt className="text-text-tertiary">Functions</dt>
              <dd className="text-text-secondary">{decoded.functions.length} in the bytecode, {decoded.functions.filter((f) => f.signature).length} named</dd>
              <dt className="text-text-tertiary">Compiler</dt>
              <dd className="text-text-secondary">{decoded.compiler ?? EMPTY}</dd>
              {context?.deployer ? (
                <>
                  <dt className="text-text-tertiary">Deployer</dt>
                  <dd className="min-w-0 text-text-secondary">
                    <AddrLink address={context.deployer.address} className="mono text-text-secondary" />{" "}
                    {context.deployer.contracts.toLocaleString("en-US")} contract{context.deployer.contracts === 1 ? "" : "s"} deployed
                  </dd>
                </>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>

      <p className="text-[11px] text-text-tertiary">
        Checks, not a verdict: a clean report does not make a token safe, and a flag is not proof of a scam. Powers are read from function names in the
        bytecode (names from the public selector database), transfers are simulated with eth_simulateV1 on the latest block, holder spread comes from our
        launchpad index. Testnet tokens have no value. Nothing here is advice.
      </p>
    </div>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const { icon: Icon, tone, label } = LEVEL[f.level];
  return (
    <li className="flex gap-2.5 px-3.5 py-2.5">
      <Icon size={15} className={`mt-px shrink-0 ${tone}`} aria-label={label} />
      <div className="min-w-0">
        <div className={`text-[13px] ${f.level === "ok" || f.level === "info" ? "text-text-primary" : tone}`}>{f.title}</div>
        <div className="break-words text-[12px] text-text-tertiary">{f.detail}</div>
      </div>
    </li>
  );
}

function TransferTest({ check, legs }: { check: TokenCheck; legs: TransferLeg[] }) {
  const sym = check.decoded.identity.symbol;
  const dec = check.decoded.identity.decimals;
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead title="Transfer test" tag={check.block ? `simulated at block ${check.block.toLocaleString("en-US")}` : "simulated, nothing sent"} />
      {!check.holder ? (
        <p className="px-3.5 py-4 text-[12px] text-text-tertiary">No wallet holding this token was found in recent transfers, so nothing could be moved.</p>
      ) : (
        <>
          <ModuleTable
            density="compact"
            columns={[
              { header: "Move", align: "left" },
              { header: "Sent", width: 120, align: "right", className: "hidden sm:table-cell" },
              { header: "Received", width: 120, align: "right" },
              { header: "Taken", width: 80, align: "right" },
            ]}
          >
            {legs.map((l) => (
              <ModuleTableRow
                key={l.id}
                cells={[
                  <span key="m" className="block min-w-0">
                    <span className="block text-text-primary">{l.label}</span>
                    {!l.ok ? <span className="block break-words text-[11px] text-danger">Blocked: {l.revert}</span> : null}
                  </span>,
                  <span key="s" className="mono text-text-secondary">{amount(l.sent, dec, null)}</span>,
                  <span key="r" className="mono text-text-primary">{l.ok ? amount(l.received, dec, null) : EMPTY}</span>,
                  <span key="t" className={`mono ${!l.ok ? "text-danger" : (l.taxPct ?? 0) > 0.001 ? "text-gold" : "text-success"}`}>
                    {!l.ok ? "blocked" : l.taxPct === null ? EMPTY : formatPct(l.taxPct, { from: "percent", decimals: l.taxPct < 1 ? 2 : 1 })}
                  </span>,
                ]}
              />
            ))}
          </ModuleTable>
          <p className="px-3.5 py-2.5 text-[11px] text-text-tertiary">
            A tenth of the balance of <AddrLink address={check.holder.address} className="mono text-text-secondary" />, a holder found in the last{" "}
            {compactCount(check.holder.scannedBlocks)} blocks ({compactCount(check.holder.transfersSeen)} transfers), moved to fresh wallets
            {check.pool ? " then into the pool" : ""}. Amounts in {sym ?? "token units"}.
          </p>
        </>
      )}
    </Card>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Owner powers", text: "Reads the bytecode for mint, pause, blacklist, fee and withdrawal functions, and whether an owner can still call them." },
    { title: "Transfer test", text: "Takes a real holder and simulates three moves: to a fresh wallet, between fresh wallets, into the DEX pool. Taxes and blocks show up." },
    { title: "Who holds it", text: "Holder count, top 10 share and creator share for tokens launched on the launchpads we index." },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {steps.map((s, i) => (
        <Card key={s.title} className="p-3.5">
          <div className="mono text-[11px] text-brand">0{i + 1}</div>
          <div className="mt-1 text-[13px] font-medium text-text-primary">{s.title}</div>
          <p className="mt-1 text-[12px] text-text-tertiary">{s.text}</p>
        </Card>
      ))}
    </div>
  );
}
