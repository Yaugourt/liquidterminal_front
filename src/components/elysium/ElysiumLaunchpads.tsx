"use client";

import { memo, useMemo, useState } from "react";
import { Rocket, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHeading, KpiRibbon, SearchBar, type KpiCell } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useElysiumLaunchpads, type EcoToken } from "@/services/elysium";
import { AddrLink, EMPTY, Empty, ago, useNow } from "./shared";
import { EcoLogo, EcoSource, TH, signedPct, tinyUsd } from "./eco-shared";

type Sort = "hot" | "new" | "gainers" | "mcap";
const SORTS: { value: Sort; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "gainers", label: "Gainers" },
  { value: "mcap", label: "Market cap" },
];

const PAGE = 50;
const GAINER_MIN_VOLUME = 100;

function sorter(sort: Sort): (a: EcoToken, b: EcoToken) => number {
  switch (sort) {
    case "new":
      return (a, b) => b.bornAt - a.bornAt;
    case "gainers":
      return (a, b) => (b.change24h ?? -Infinity) - (a.change24h ?? -Infinity);
    case "mcap":
      return (a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0);
    default:
      return (a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0) || b.txns24h - a.txns24h;
  }
}

function TokenCell({ t }: { t: EcoToken }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <EcoLogo src={null} label={t.symbol} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <AddrLink address={t.address} explorer={false} className="text-text-primary font-medium">{t.symbol}</AddrLink>
          <span className="text-[10px] text-text-tertiary truncate max-w-[140px]">{t.name}</span>
        </div>
        <div className="text-[10px] text-text-tertiary">{t.launchpad}</div>
      </div>
    </div>
  );
}

/** Bonding progress for curve tokens; "pool" once a token trades in a regular pool. */
function Curve({ t }: { t: EcoToken }) {
  if (t.graduated) return <span className="text-[10px] font-semibold text-success">Graduated</span>;
  if (t.curvePct == null) return <span className="text-text-tertiary">pool</span>;
  const pct = Math.max(0, Math.min(100, t.curvePct));
  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="h-1 w-12 rounded-full bg-surface-2 overflow-hidden" aria-hidden>
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="mono text-text-secondary w-9 text-right">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
    </div>
  );
}

function MiniList({ title, icon, rows, value, meta }: { title: string; icon: React.ReactNode; rows: EcoToken[]; value: (t: EcoToken) => React.ReactNode; meta?: string }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={icon} title={title} meta={meta} metaVariant="plain" />
      {rows.length === 0 ? (
        <Empty>Nothing yet.</Empty>
      ) : (
        <ol className="divide-y divide-border-subtle">
          {rows.map((t) => (
            <li key={t.address} className="flex items-center gap-2.5 px-3.5 py-2 min-w-0">
              <div className="min-w-0 flex-1"><TokenCell t={t} /></div>
              <span className="mono text-[12px] whitespace-nowrap">{value(t)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/**
 * Elysium · Launchpads: every token launched on the Elysium launchpads, with
 * price, volume, holders and bonding progress, decoded by our backend from
 * the launchpads' own launch and trade events.
 */
export const ElysiumLaunchpads = memo(function ElysiumLaunchpads() {
  const { data, isLoading, error } = useElysiumLaunchpads();
  const now = useNow(30_000);
  const [pad, setPad] = useState("All");
  const [sort, setSort] = useState<Sort>("hot");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  const tokens = useMemo(() => data?.tokens ?? [], [data]);

  const pads = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t.launchpad, (counts.get(t.launchpad) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tokens]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens
      .filter((t) => pad === "All" || t.launchpad === pad)
      .filter((t) => !q || `${t.symbol} ${t.name} ${t.address}`.toLowerCase().includes(q))
      .sort(sorter(sort));
  }, [tokens, pad, sort, query]);

  const vol24 = tokens.reduce((s, t) => s + (t.volume24h ?? 0), 0);
  const txns24 = tokens.reduce((s, t) => s + t.txns24h, 0);
  const graduated = tokens.filter((t) => t.graduated).length;
  const day = now / 1000 - 86_400;
  const born24 = tokens.filter((t) => t.bornAt >= day).length;
  const v = (x: string) => (data ? x : "…");
  const cells: KpiCell[] = [
    { key: "tokens", label: "Tokens", value: v(compactCount(tokens.length)), sub: `${pads.length} launchpads` },
    { key: "new", label: "Launched", value: v(compactCount(born24)), sub: "last 24h" },
    { key: "vol", label: "Volume", value: v(compactUsd(vol24)), sub: `${compactCount(txns24)} trades, last 24h` },
    { key: "grad", label: "Graduated", value: v(compactCount(graduated)), sub: "left the bonding curve" },
  ];

  const hot = [...tokens].sort(sorter("hot")).filter((t) => (t.volume24h ?? 0) > 0).slice(0, 5);
  const fresh = [...tokens].sort(sorter("new")).slice(0, 5);
  // A $1 trade moves a near-empty curve by four digits: gainers need real volume to count.
  const gainers = [...tokens].filter((t) => (t.volume24h ?? 0) >= GAINER_MIN_VOLUME).sort(sorter("gainers")).slice(0, 5);

  const padTabs = [{ value: "All", label: `All ${tokens.length || ""}`.trim() }, ...pads.map(([p, n]) => ({ value: p, label: `${p} ${n}` }))];

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <MiniList title="Hot" icon={<Trophy size={13} className="text-brand" />} rows={hot} value={(t) => <span className="text-text-primary">{compactUsd(t.volume24h)}</span>} />
        <MiniList
          title="Top gainers"
          meta="24h vol ≥ $100"
          icon={<TrendingUp size={13} className="text-brand" />}
          rows={gainers}
          value={(t) => {
            const c = signedPct(t.change24h);
            return <span className={c.tone}>{c.text}</span>;
          }}
        />
        <MiniList
          title="Just launched"
          icon={<Sparkles size={13} className="text-brand" />}
          rows={fresh}
          value={(t) => <span className="text-text-tertiary">{ago(t.bornAt * 1000, now)}</span>}
        />
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHeading
          icon={<Rocket size={13} className="text-brand" />}
          title="Launchpad tokens"
          meta={data ? `${rows.length} tokens` : undefined}
          metaVariant="plain"
          actions={<SearchBar onSearch={(q) => { setQuery(q); setShown(PAGE); }} placeholder="Symbol, name or address" className="w-full sm:w-56" debounceMs={150} />}
        />
        <div className="px-3.5 pt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <PillTabs tabs={padTabs} activeTab={pad} onTabChange={(p) => { setPad(p); setShown(PAGE); }} variant="text" />
          <div className="sm:ml-auto">
            <PillTabs tabs={SORTS} activeTab={sort} onTabChange={(s) => setSort(s as Sort)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {!data ? (
            <Empty>{error ? "Launchpad data is unavailable right now." : isLoading ? "Loading…" : EMPTY}</Empty>
          ) : rows.length === 0 ? (
            <Empty>No token matches.</Empty>
          ) : (
            <table className="w-full text-[12px] min-w-[900px]">
              <thead>
                <tr>
                  <th className={`${TH} text-left px-3.5`}>Token</th>
                  <th className={`${TH} text-right px-2`}>Price</th>
                  <th className={`${TH} text-right px-2`}>24h</th>
                  <th className={`${TH} text-right px-2`}>Vol 24h</th>
                  <th className={`${TH} text-right px-2`} title="Price x 1B tokens (every launch mints 1B)">MCap</th>
                  <th className={`${TH} text-right px-2`}>Holders</th>
                  <th className={`${TH} text-right px-2`} title="Share of supply held by the 10 largest wallets, the token's own pool or curve left out">Top 10</th>
                  <th className={`${TH} text-right px-2`} title="Share of supply held by the creator wallet">Dev</th>
                  <th className={`${TH} text-right px-2`}>Bonding</th>
                  <th className={`${TH} text-right px-3.5`}>Age</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, shown).map((t) => {
                  const ch = signedPct(t.change24h);
                  return (
                    <tr key={t.address} className="border-t border-border-subtle">
                      <td className="px-3.5 py-2"><TokenCell t={t} /></td>
                      <td className="px-2 py-2 text-right mono text-text-primary whitespace-nowrap">{tinyUsd(t.priceUsd)}</td>
                      <td className={`px-2 py-2 text-right mono ${ch.tone}`}>{ch.text}</td>
                      <td className="px-2 py-2 text-right mono text-text-primary">{t.volume24h == null ? EMPTY : compactUsd(t.volume24h)}</td>
                      <td className="px-2 py-2 text-right mono text-text-secondary">{t.marketCap == null ? EMPTY : compactUsd(t.marketCap)}</td>
                      <td className="px-2 py-2 text-right mono text-text-secondary">{t.holders == null ? EMPTY : compactCount(t.holders)}</td>
                      <td className="px-2 py-2 text-right mono text-text-secondary">{t.top10Pct == null ? EMPTY : `${t.top10Pct.toFixed(1)}%`}</td>
                      <td className="px-2 py-2 text-right mono text-text-secondary">{t.devPct == null ? EMPTY : `${t.devPct.toFixed(1)}%`}</td>
                      <td className="px-2 py-2 text-right"><Curve t={t} /></td>
                      <td className="px-3.5 py-2 text-right mono text-text-tertiary whitespace-nowrap">{ago(t.bornAt * 1000, now)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {data && rows.length > shown && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="focus-ring border-t border-border-subtle py-2.5 text-[12px] text-text-secondary hover:text-brand"
          >
            Show {Math.min(PAGE, rows.length - shown)} more of {rows.length - shown}
          </button>
        )}
      </Card>
      <EcoSource what="Tokens, prices, holders and bonding progress" />
    </div>
  );
});
