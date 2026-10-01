"use client";

import { memo } from "react";
import { ArrowDownLeft, ArrowUpRight, Code2, ExternalLink, History, Tags, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AddressIdenticon, CardHeading, KpiRibbon, ShareTile, type KpiCell } from "@/components/common";
import { compactCount, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import {
  elysiumTimeMs,
  useElysiumAddressProfile,
  useElysiumMethods,
  useElysiumUserActivity,
  useElysiumUserBalances,
  useElysiumUserBridge,
  type ElysiumAddressTag,
} from "@/services/elysium";
import { AddrLink, EMPTY, EXPLORER, Empty, ExtLink, ago, elysiumTimeLabel, methodLabel, pct, short, useNow } from "./shared";
import { ElysiumContractDecoder } from "./ElysiumContractDecoder";

const TAG_TONE: Record<ElysiumAddressTag["id"], string> = {
  deployer: "bg-brand/10 text-brand",
  "dex-trader": "bg-success/10 text-success",
  bridger: "bg-gold/10 text-gold",
  "bot-like": "bg-warning/10 text-warning",
};

const TH = "text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold py-2";

/** Token amounts: compact above 1M, up to 4 decimals below. */
function amount(v: number): string {
  if (!Number.isFinite(v)) return EMPTY;
  if (Math.abs(v) >= 1_000_000) return compactCount(v);
  return v.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

const Balances = memo(function Balances({ address }: { address: string }) {
  const { data, error } = useElysiumUserBalances(address);
  const tokens = data ? [...data.tokens].sort((a, b) => a.symbol.localeCompare(b.symbol)) : [];
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={<Wallet size={13} className="text-brand" />} title="Balances" meta={data ? `${data.tokens.length} tokens` : undefined} metaVariant="plain" />
      <div className="px-3.5 py-1 max-h-[320px] overflow-y-auto scrollbar-brand">
        {!data ? (
          <Empty>{error ? "Balances are unavailable right now." : "Loading balances…"}</Empty>
        ) : (
          <table className="w-full mono text-[12px] table-fixed">
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="py-1.5 pr-2 text-text-primary">HYPE <span className="text-text-tertiary text-[10px]">native gas</span></td>
                <td className="py-1.5 text-right text-text-primary">{amount(data.native_balance)}</td>
              </tr>
              {tokens.map((t) => (
                <tr key={t.token} className="border-t border-border-subtle first:border-t-0">
                  <td className="py-1.5 pr-2 min-w-0">
                    <AddrLink address={t.token} className="text-text-secondary">{t.symbol || short(t.token)}</AddrLink>
                  </td>
                  <td className="py-1.5 text-right text-text-secondary">{amount(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

const Profile = memo(function Profile({ address }: { address: string }) {
  const { data, error } = useElysiumAddressProfile(address);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<Tags size={13} className="text-brand" />}
        title="What this address does"
        meta="from our indexed tables"
        metaVariant="plain"
        actions={data && (data.activity.userTxs > 0 || data.deployer.contracts > 0) ? (
          <ShareTile src={`/api/tile/elysium-address?address=${address.toLowerCase()}`} filename={`liquid-terminal-elysium-${address.slice(0, 8).toLowerCase()}`} label="Image" />
        ) : undefined}
      />
      {!data ? (
        <Empty>{error ? "Analytics are unavailable right now." : "Loading…"}</Empty>
      ) : (
        <div className="px-3.5 py-2 space-y-3 text-[12px]">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mono">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Deployer</dt>
              <dd className="text-text-primary">{compactCount(data.deployer.contracts)} contracts</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">DEX</dt>
              <dd className="text-text-primary">
                {compactCount(data.dex.swaps)} swaps{" "}
                <span className="text-text-tertiary">in {data.dex.pools} {data.dex.pools === 1 ? "pool" : "pools"}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Bridge</dt>
              <dd className="text-text-primary">
                {compactCount(data.bridge.deposits)} in / {compactCount(data.bridge.withdrawals)} out
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">HYPE bridged</dt>
              <dd className="text-text-primary">
                {amount(data.bridge.hypeIn)} in / {amount(data.bridge.hypeOut)} out
              </dd>
            </div>
          </dl>
          <div>
            <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary mb-1">Most sent calls</div>
            {data.topMethods.length === 0 ? (
              <div className="text-text-tertiary">No user transaction indexed.</div>
            ) : (
              <table className="w-full mono text-[12px] table-fixed">
                <tbody>
                  {data.topMethods.map((m, i) => (
                    <tr key={`${m.methodId}-${i}`} className="border-t border-border-subtle first:border-t-0">
                      <td className="py-1 pr-2 truncate" title={m.signature ?? m.methodId}>
                        <span className={m.name ? "text-text-primary" : "text-text-tertiary"}>{m.name ?? (m.methodId || "transfer")}</span>
                      </td>
                      <td className="py-1 text-right text-text-secondary w-[80px]">{compactCount(m.txs)} txs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-[11px] text-text-tertiary">
            Bot-like = {data.botRule.txs24h}+ user txs in the last 24h, or at least {pct(data.botRule.share24h)} of all of them.
          </p>
        </div>
      )}
    </Card>
  );
});

const Activity = memo(function Activity({ address }: { address: string }) {
  const { data, error } = useElysiumUserActivity(address, 50);
  const { data: methods } = useElysiumMethods("24h");
  const now = useNow(10_000);
  const detail = (d: string) => (/^0x[0-9a-f]{8}$/i.test(d) ? methodLabel(d.toLowerCase(), methods?.names) : d);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={<History size={13} className="text-brand" />} title="Activity" meta="latest 50 events" metaVariant="plain" />
      <div className="overflow-x-auto max-h-[440px] overflow-y-auto scrollbar-brand">
        {!data ? (
          <Empty>{error ? "Activity is unavailable right now." : "Loading activity…"}</Empty>
        ) : data.length === 0 ? (
          <Empty>No activity on Elysium.</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <thead>
              <tr>
                <th className={`${TH} text-left px-3.5`}>Age</th>
                <th className={`${TH} text-left px-2`}>Kind</th>
                <th className={`${TH} text-left px-2`}>Counterparty</th>
                <th className={`${TH} text-right px-2`}>Amount</th>
                <th className={`${TH} text-left px-3.5 hidden md:table-cell`}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a, i) => {
                const inbound = a.direction === "in";
                return (
                  <tr key={`${a.tx_hash}-${a.kind}-${i}`} className="border-t border-border-subtle">
                    <td className="px-3.5 py-1.5 whitespace-nowrap">
                      <ExtLink href={`${EXPLORER}/tx/${a.tx_hash}`} className="text-text-tertiary">{ago(elysiumTimeMs(a.time), now)}</ExtLink>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-0.5 ${inbound ? "text-success" : "text-text-secondary"}`} title={a.kind.replace(/_/g, " ")}>
                        {inbound ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                        <span className="hidden sm:inline">{a.kind.replace(/_/g, " ")}</span>
                      </span>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {a.counterparty ? <AddrLink address={a.counterparty} className="text-text-secondary" explorer={false} /> : EMPTY}
                    </td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap text-text-primary">
                      {a.kind === "token_transfer" && !a.symbol ? (
                        <span className="text-text-tertiary">raw {compactCount(Number(a.amount_raw))}</span>
                      ) : (
                        <>
                          {amount(a.amount)} <span className="text-text-tertiary">{a.symbol || (a.token ? short(a.token) : "")}</span>
                        </>
                      )}
                    </td>
                    <td className="px-3.5 py-1.5 text-text-tertiary whitespace-nowrap hidden md:table-cell">{a.detail ? detail(a.detail) : EMPTY}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

const Bridge = memo(function Bridge({ address }: { address: string }) {
  const { data, error } = useElysiumUserBridge(address, 20);
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={<ArrowDownLeft size={13} className="text-brand" />} title="Bridge history" meta="latest 20, HyperEVM to Elysium and back" metaVariant="plain" />
      <div className="overflow-x-auto">
        {!data ? (
          <Empty>{error ? "Bridge history is unavailable right now." : "Loading…"}</Empty>
        ) : data.length === 0 ? (
          <Empty>No bridge transfer for this address.</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <thead>
              <tr>
                <th className={`${TH} text-left px-3.5`}>Initiated</th>
                <th className={`${TH} text-left px-2`}>Direction</th>
                <th className={`${TH} text-right px-2`}>Amount</th>
                <th className={`${TH} text-left px-3.5`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.transfer_id} className="border-t border-border-subtle">
                  <td className="px-3.5 py-1.5 whitespace-nowrap text-text-tertiary">{b.initiated_time ? `${elysiumTimeLabel(b.initiated_time)} UTC` : EMPTY}</td>
                  <td className={`px-2 py-1.5 whitespace-nowrap ${b.direction === "deposit" ? "text-success" : "text-text-secondary"}`}>{b.direction}</td>
                  <td className="px-2 py-1.5 text-right whitespace-nowrap text-text-primary">
                    {amount(b.amount)} <span className="text-text-tertiary">{b.symbol}</span>
                  </td>
                  <td className="px-3.5 py-1.5 whitespace-nowrap text-text-secondary">{b.status.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

/**
 * Elysium · Address: balances, activity and bridge history from the provider,
 * plus tags computed from our own indexed tables.
 */
export function ElysiumAddress({ address }: { address: string }) {
  const { format } = useNumberFormat();
  const { data: profile } = useElysiumAddressProfile(address);
  const { data: balances } = useElysiumUserBalances(address);
  const n = (v: number | undefined) => (v == null ? "…" : formatNumber(v, format, { maximumFractionDigits: 0 }));

  const cells: KpiCell[] = [
    { key: "hype", label: "HYPE balance", value: balances ? amount(balances.native_balance) : "…", sub: "testnet gas token" },
    { key: "txs", label: "User txs", value: n(profile?.activity.userTxs), sub: profile ? `${profile.activity.activeDays} active days` : undefined },
    {
      key: "24h",
      label: "Txs, last 24h",
      value: n(profile?.activity.txs24h),
      sub: profile ? `${pct(profile.activity.share24h, 2)} of the network` : undefined,
    },
    { key: "first", label: "First seen", value: profile ? (profile.firstSeen ? elysiumTimeLabel(profile.firstSeen) : "never sent") : "…", sub: "UTC, as a sender" },
  ];

  return (
    <div className="space-y-4">
      <Card className="px-3.5 py-3 flex flex-wrap items-center gap-3">
        <AddressIdenticon address={address} size={28} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">Elysium address</div>
          <div className="mono text-[13px] text-text-primary break-all">{address}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {profile?.tags.map((t) => (
            <span key={t.id} className={`text-[11px] font-semibold px-2 py-0.5 rounded ${TAG_TONE[t.id] ?? "bg-surface-2 text-text-secondary"}`} title={t.detail}>
              {t.label} <span className="font-normal opacity-80">{t.detail}</span>
            </span>
          ))}
          <ExtLink href={`${EXPLORER}/address/${address}`} className="text-[11px] text-text-tertiary inline-flex items-center gap-1">
            Explorer <ExternalLink size={11} />
          </ExtLink>
        </div>
      </Card>
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <ElysiumContractDecoder address={address} hideWhenEoa />
      {/* Profile on the left; balances and bridge history stack on the right, so neither side leaves a hole. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Profile address={address} />
        <div className="space-y-4 min-w-0">
          <Balances address={address} />
          <Bridge address={address} />
        </div>
      </div>
      <Activity address={address} />
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Code2 size={12} className="mt-px shrink-0" />
        Testnet balances, no market value. Balances, activity and bridge history come from the Elysium indexer; tags and counts are computed by
        Liquid Terminal from every indexed transaction (spam excluded).
      </p>
    </div>
  );
}
