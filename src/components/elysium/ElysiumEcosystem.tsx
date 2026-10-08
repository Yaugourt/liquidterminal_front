"use client";

import { memo, useMemo, useState } from "react";
import { ArrowUpRight, Boxes, Flame, LayoutGrid, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHeading, KpiRibbon, SearchBar, type KpiCell } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useElysiumProjects, type EcoProject } from "@/services/elysium";
import { EMPTY, Empty } from "./shared";
import { EcoLogo, EcoSource, StatusTag, TH } from "./eco-shared";

type MetricKey = "wallets7d" | "txs7d" | "volume7d" | "launches7d" | "contracts";
interface MetricCol {
  key: MetricKey;
  label: string;
  money?: boolean;
}

/** Every project gets on-chain usage; launchpads also get the volume and launches we decode from their events. */
const COLUMNS: Record<string, MetricCol[]> = {
  All: [{ key: "wallets7d", label: "Wallets 7d" }, { key: "txs7d", label: "Txs 7d" }, { key: "contracts", label: "Contracts" }],
  Launchpad: [{ key: "volume7d", label: "Volume 7d", money: true }, { key: "launches7d", label: "Launches 7d" }, { key: "wallets7d", label: "Wallets 7d" }],
};

const STATUS_ORDER = { powers: 0, live: 1, testnet: 2, verifying: 3, announced: 4, exploring: 5 } as const;
const ON_CHAIN = new Set(["powers", "live", "testnet"]);

const fmt = (v: number | null | undefined, money?: boolean) => (v == null ? EMPTY : money ? compactUsd(v) : compactCount(v));

/** Top 5 by one metric, projects without a reading left out. */
function top(projects: EcoProject[], key: MetricKey): EcoProject[] {
  return projects
    .filter((p) => (p[key] ?? 0) > 0)
    .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
    .slice(0, 5);
}

function TopList({ title, icon, rows, metric, money }: { title: string; icon: React.ReactNode; rows: EcoProject[]; metric: MetricKey; money?: boolean }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={icon} title={title} meta="7 days" metaVariant="plain" />
      {rows.length === 0 ? (
        <Empty>No activity read yet.</Empty>
      ) : (
        <ol className="divide-y divide-border-subtle">
          {rows.map((p, i) => (
            <li key={p.slug} className="flex items-center gap-2.5 px-3.5 py-2 min-w-0">
              <span className="mono text-[11px] text-text-tertiary w-3 shrink-0">{i + 1}</span>
              <EcoLogo src={p.logo} label={p.name} size={20} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-text-primary truncate">{p.name}</div>
                <div className="text-[10px] text-text-tertiary truncate">{p.category}</div>
              </div>
              <span className="mono text-[12px] text-text-primary">{fmt(p[metric], money)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/**
 * Elysium · Ecosystem: every project building on Elysium, its status and its
 * last 7 days of on-chain activity, computed by our backend from the chain.
 */
export const ElysiumEcosystem = memo(function ElysiumEcosystem() {
  const { data, isLoading, error } = useElysiumProjects();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const projects = useMemo(() => data?.projects ?? [], [data]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const cols = COLUMNS[category] ?? COLUMNS.All;
  const sortKey = cols[0].key;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => !q || `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          (b[sortKey] ?? -1) - (a[sortKey] ?? -1) ||
          a.name.localeCompare(b.name),
      );
  }, [projects, category, query, sortKey]);

  const onChain = projects.filter((p) => ON_CHAIN.has(p.status)).length;
  const txs = projects.reduce((s, p) => s + (p.txs7d ?? 0), 0);
  const v = (x: string) => (data ? x : "…");
  const cells: KpiCell[] = [
    { key: "projects", label: "Projects", value: v(String(projects.length)), sub: `${categories.length} categories` },
    { key: "onchain", label: "On chain", value: v(String(onChain)), sub: "deployed on the testnet" },
    { key: "coming", label: "Coming", value: v(String(projects.length - onChain)), sub: "announced, exploring or being verified" },
    { key: "txs", label: "Txs to apps", value: v(compactCount(txs)), sub: "last 7 days, all projects" },
  ];

  const tabs = [
    { value: "All", label: `All ${projects.length || ""}`.trim() },
    ...categories.map(([c, n]) => ({ value: c, label: `${c} ${n}` })),
  ];

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <TopList title="Most used" icon={<Users size={13} className="text-brand" />} rows={top(projects, "wallets7d")} metric="wallets7d" />
        <TopList title="Most transactions" icon={<Zap size={13} className="text-brand" />} rows={top(projects, "txs7d")} metric="txs7d" />
        <TopList title="Launchpad volume" icon={<Flame size={13} className="text-brand" />} rows={top(projects, "volume7d")} metric="volume7d" money />
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHeading
          icon={<LayoutGrid size={13} className="text-brand" />}
          title="Projects"
          meta={data ? `${rows.length} shown` : undefined}
          metaVariant="plain"
          actions={<SearchBar onSearch={setQuery} placeholder="Search projects" className="w-full sm:w-56" debounceMs={150} />}
        />
        <div className="px-3.5 pt-3 overflow-x-auto">
          <PillTabs tabs={tabs} activeTab={category} onTabChange={setCategory} variant="text" />
        </div>
        <div className="overflow-x-auto">
          {!data ? (
            <Empty>{error ? "The ecosystem directory is unavailable right now." : isLoading ? "Loading…" : EMPTY}</Empty>
          ) : rows.length === 0 ? (
            <Empty>No project matches.</Empty>
          ) : (
            <table className="w-full text-[12px] min-w-[720px]">
              <thead>
                <tr>
                  <th className={`${TH} text-left px-3.5`}>Project</th>
                  <th className={`${TH} text-left px-2`}>Category</th>
                  <th className={`${TH} text-left px-2`}>Status</th>
                  {cols.map((c) => (
                    <th key={c.key} className={`${TH} text-right px-2`}>{c.label}</th>
                  ))}
                  <th className={`${TH} text-right px-3.5`}>Links</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.slug} className="border-t border-border-subtle align-middle">
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2.5 min-w-0" title={p.description || undefined}>
                        <EcoLogo src={p.logo} label={p.name} />
                        <div className="min-w-0">
                          <div className="text-text-primary font-medium truncate">{p.name}</div>
                          <div className="text-[10px] text-text-tertiary truncate max-w-[260px]">{p.tagline}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-text-secondary whitespace-nowrap">{p.category}</td>
                    <td className="px-2 py-2"><StatusTag status={p.status} label={p.statusLabel} /></td>
                    {cols.map((c) => (
                      <td key={c.key} className={`px-2 py-2 text-right mono ${p[c.key] == null ? "text-text-tertiary" : "text-text-primary"}`}>
                        {fmt(p[c.key], c.money)}
                      </td>
                    ))}
                    <td className="px-3.5 py-2">
                      <div className="flex items-center justify-end gap-2.5 whitespace-nowrap">
                        {p.x && (
                          <a href={p.x} target="_blank" rel="noopener" className="text-text-tertiary hover:text-brand text-[11px]">
                            X
                          </a>
                        )}
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 text-brand hover:underline text-[11px]">
                            {p.urlLabel ?? "Open"}
                            <ArrowUpRight size={11} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Boxes size={12} className="mt-px shrink-0" />
        Wallets and txs count the non-spam transactions sent to each project&apos;s known contracts over the last 7 days. A dash means the
        project has no contract on chain yet. Launchpad volume is decoded from Chainzy, CorePad and Signal trades.
      </p>
      <EcoSource what="Project list, statuses and 7-day activity" />
    </div>
  );
});
