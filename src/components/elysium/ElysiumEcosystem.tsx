"use client";

import { memo, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Boxes, Flame, LayoutGrid, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHeading, KpiRibbon, SearchBar, Sparkline, TimeframeTabs, type KpiCell } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useElysiumProjects, type EcoProject } from "@/services/elysium";
import { EMPTY, Empty } from "./shared";
import { EcoLogo, EcoSource, StatusTag, TH, signedPct } from "./eco-shared";

type Window = "24h" | "7d";
type ValueKey = "users24h" | "wallets7d" | "txs7d" | "volume7d" | "launches7d";
type SortKey = ValueKey | "chg24h" | "chg7d";

interface MetricCol {
  key: SortKey;
  label: string;
  hint: string;
  money?: boolean;
}

/** Active users = distinct wallets that sent a non-spam tx to one of the project's known contracts. */
const COLUMNS: Record<string, MetricCol[]> = {
  All: [
    { key: "users24h", label: "Users 24h", hint: "Active users over the last 24 hours" },
    { key: "chg24h", label: "Δ 24h", hint: "Change against the 24 hours before" },
    { key: "wallets7d", label: "Users 7d", hint: "Active users over the last 7 days" },
    { key: "chg7d", label: "Δ 7d", hint: "Change against the 7 days before" },
    { key: "txs7d", label: "Txs 7d", hint: "Transactions sent to the project's contracts over 7 days" },
  ],
  Launchpad: [
    { key: "volume7d", label: "Volume 7d", hint: "Traded volume over 7 days", money: true },
    { key: "launches7d", label: "Launches 7d", hint: "Tokens launched over 7 days" },
    { key: "wallets7d", label: "Users 7d", hint: "Active users over the last 7 days" },
    { key: "chg7d", label: "Δ 7d", hint: "Change against the 7 days before" },
  ],
};

const STATUS_ORDER = { powers: 0, live: 1, testnet: 2, verifying: 3, announced: 4, exploring: 5 } as const;
const ON_CHAIN = new Set(["powers", "live", "testnet"]);
/** Below this many users in both periods a percentage is noise: kept in the table, left out of the movers. */
const MIN_USERS = 10;

const fmt = (v: number | null | undefined, money?: boolean) => (v == null ? EMPTY : money ? compactUsd(v) : compactCount(v));

/** Current and previous active users for a window. */
function usersPair(p: EcoProject, w: Window): [number | null, number | null] {
  return w === "24h" ? [p.users24h, p.usersPrev24h] : [p.wallets7d, p.usersPrev7d];
}

/** Percent change; null when there is nothing to compare (no contract, or no users in the previous period). */
function change(p: EcoProject, w: Window): number | null {
  const [cur, prev] = usersPair(p, w);
  if (cur == null || !prev) return null;
  return (cur / prev - 1) * 100;
}

/** Users in this period, none in the previous one. */
const isNew = (p: EcoProject, w: Window) => {
  const [cur, prev] = usersPair(p, w);
  return prev === 0 && (cur ?? 0) > 0;
};

function sortValue(p: EcoProject, key: SortKey): number | null {
  if (key === "chg24h") return change(p, "24h");
  if (key === "chg7d") return change(p, "7d");
  return p[key];
}

function ChangeCell({ p, w }: { p: EcoProject; w: Window }) {
  if (isNew(p, w)) return <span className="text-[10px] font-semibold text-brand">New</span>;
  const { text, tone } = signedPct(change(p, w));
  return <span className={tone}>{text}</span>;
}

/** Top 5 by one metric, projects without a reading left out. */
function top(projects: EcoProject[], key: ValueKey): EcoProject[] {
  return projects
    .filter((p) => (p[key] ?? 0) > 0)
    .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
    .slice(0, 5);
}

/** Biggest relative moves among projects with enough users to make a percentage meaningful. */
function movers(projects: EcoProject[], w: Window, dir: 1 | -1): EcoProject[] {
  return projects
    .filter((p) => {
      const [cur, prev] = usersPair(p, w);
      const c = change(p, w);
      return c != null && Math.sign(c) === dir && Math.max(cur ?? 0, prev ?? 0) >= MIN_USERS;
    })
    .sort((a, b) => dir * ((change(b, w) ?? 0) - (change(a, w) ?? 0)))
    .slice(0, 5);
}

function TopList({
  title,
  icon,
  rows,
  meta,
  actions,
  value,
  sub = (p) => p.category,
  empty = "No activity read yet.",
}: {
  title: string;
  icon: React.ReactNode;
  rows: EcoProject[];
  meta?: string;
  actions?: React.ReactNode;
  value: (p: EcoProject) => React.ReactNode;
  /** Second line under the name; the category by default. */
  sub?: (p: EcoProject) => React.ReactNode;
  empty?: string;
}) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading icon={icon} title={title} meta={meta} metaVariant="plain" actions={actions} />
      {rows.length === 0 ? (
        <Empty>{empty}</Empty>
      ) : (
        <ol className="divide-y divide-border-subtle">
          {rows.map((p, i) => (
            <li key={p.slug} className="flex items-center gap-2.5 px-3.5 py-2 min-w-0">
              <span className="mono text-[11px] text-text-tertiary w-3 shrink-0">{i + 1}</span>
              <EcoLogo src={p.logo} label={p.name} size={20} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-text-primary truncate">{p.name}</div>
                <div className="text-[10px] text-text-tertiary truncate">{sub(p)}</div>
              </div>
              <span className="mono text-[12px] text-text-primary whitespace-nowrap">{value(p)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function moverValue(p: EcoProject, w: Window) {
  const { text, tone } = signedPct(change(p, w));
  return <span className={tone}>{text}</span>;
}

/** "120 to 180 users": the raw counts behind the percentage. */
function moverSub(p: EcoProject, w: Window) {
  const [cur, prev] = usersPair(p, w);
  return `${compactCount(prev ?? 0)} to ${compactCount(cur ?? 0)} users`;
}

/**
 * Elysium · Ecosystem: every project building on Elysium, its status and its
 * last 7 days of on-chain activity, computed by our backend from the chain.
 */
export const ElysiumEcosystem = memo(function ElysiumEcosystem() {
  const { data, isLoading, error } = useElysiumProjects();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey | null>(null);
  const [moveWindow, setMoveWindow] = useState<Window>("7d");
  const projects = useMemo(() => data?.projects ?? [], [data]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const cols = COLUMNS[category] ?? COLUMNS.All;
  // A clicked column sorts on its own; otherwise status first, then the first column.
  const sortKey = sort && cols.some((c) => c.key === sort) ? sort : null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => !q || `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortKey) {
          const va = sortValue(a, sortKey);
          const vb = sortValue(b, sortKey);
          if (va == null || vb == null) return va == null ? (vb == null ? a.name.localeCompare(b.name) : 1) : -1;
          return vb - va || a.name.localeCompare(b.name);
        }
        const k = cols[0].key as ValueKey;
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b[k] ?? -1) - (a[k] ?? -1) || a.name.localeCompare(b.name);
      });
  }, [projects, category, query, sortKey, cols]);

  const onChain = projects.filter((p) => ON_CHAIN.has(p.status)).length;
  const txs = projects.reduce((s, p) => s + (p.txs7d ?? 0), 0);
  const growing = projects.filter((p) => (change(p, "7d") ?? 0) > 0 || isNew(p, "7d")).length;
  const tracked = projects.filter((p) => (p.wallets7d ?? 0) > 0 || (p.usersPrev7d ?? 0) > 0).length;
  const v = (x: string) => (data ? x : "…");
  const cells: KpiCell[] = [
    { key: "projects", label: "Projects", value: v(String(projects.length)), sub: `${categories.length} categories` },
    { key: "onchain", label: "On chain", value: v(String(onChain)), sub: `deployed on the testnet, ${projects.length - onChain} more coming` },
    { key: "txs", label: "Txs to apps", value: v(compactCount(txs)), sub: "last 7 days, all projects" },
    { key: "growing", label: "Growing", value: v(`${growing}/${tracked}`), sub: "projects with more users than the week before" },
  ];

  const tabs = [
    { value: "All", label: `All ${projects.length || ""}`.trim() },
    ...categories.map(([c, n]) => ({ value: c, label: `${c} ${n}` })),
  ];

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        <TopList
          title="Most used"
          icon={<Users size={13} className="text-brand" />}
          meta="users 7d"
          rows={top(projects, "wallets7d")}
          value={(p) => compactCount(p.wallets7d ?? 0)}
        />
        <TopList
          title="Gaining"
          icon={<TrendingUp size={13} className="text-brand" />}
          actions={<TimeframeTabs options={["24h", "7d"]} value={moveWindow} onChange={(t) => setMoveWindow(t as Window)} />}
          rows={movers(projects, moveWindow, 1)}
          value={(p) => moverValue(p, moveWindow)}
          sub={(p) => moverSub(p, moveWindow)}
          empty={`No project with ${MIN_USERS}+ users is growing.`}
        />
        <TopList
          title="Losing"
          icon={<TrendingDown size={13} className="text-brand" />}
          actions={<TimeframeTabs options={["24h", "7d"]} value={moveWindow} onChange={(t) => setMoveWindow(t as Window)} />}
          rows={movers(projects, moveWindow, -1)}
          value={(p) => moverValue(p, moveWindow)}
          sub={(p) => moverSub(p, moveWindow)}
          empty={`No project with ${MIN_USERS}+ users is declining.`}
        />
        <TopList
          title="Launchpad volume"
          icon={<Flame size={13} className="text-brand" />}
          meta="7 days"
          rows={top(projects, "volume7d")}
          value={(p) => compactUsd(p.volume7d ?? 0)}
        />
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
            <table className="w-full text-[12px] min-w-[920px]">
              <thead>
                <tr>
                  <th className={`${TH} text-left px-3.5`}>Project</th>
                  <th className={`${TH} text-left px-2`}>Category</th>
                  <th className={`${TH} text-left px-2`}>Status</th>
                  {cols.map((c) => (
                    <th key={c.key} className={`${TH} text-right px-2`} title={c.hint} aria-sort={sortKey === c.key ? "descending" : undefined}>
                      <button
                        type="button"
                        onClick={() => setSort(sortKey === c.key ? null : c.key)}
                        className={`focus-ring inline-flex items-center gap-0.5 uppercase ${sortKey === c.key ? "text-text-primary" : "hover:text-text-secondary"}`}
                      >
                        {c.label}
                        {sortKey === c.key && <ArrowDown size={10} />}
                      </button>
                    </th>
                  ))}
                  <th className={`${TH} text-right px-2`} title="Active users per day over the last 14 days">Users 14d</th>
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
                    {cols.map((c) =>
                      c.key === "chg24h" || c.key === "chg7d" ? (
                        <td key={c.key} className="px-2 py-2 text-right mono whitespace-nowrap">
                          <ChangeCell p={p} w={c.key === "chg24h" ? "24h" : "7d"} />
                        </td>
                      ) : (
                        <td key={c.key} className={`px-2 py-2 text-right mono ${p[c.key] == null ? "text-text-tertiary" : "text-text-primary"}`}>
                          {fmt(p[c.key], c.money)}
                        </td>
                      ),
                    )}
                    <td className="px-2 py-2 w-[96px]">
                      {p.usersDaily?.some((n) => n > 0) ? (
                        <Sparkline data={p.usersDaily} height={22} />
                      ) : (
                        <div className="text-right text-text-tertiary mono">{EMPTY}</div>
                      )}
                    </td>
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
        Active users are the distinct wallets that sent a non-spam transaction to a project&apos;s known contracts. Each Δ compares the
        last 24 hours (or 7 days) with the period just before; &ldquo;New&rdquo; means no user in that previous period. Gaining and losing
        lists only rank projects with {MIN_USERS} or more users in one of the two periods. The 14-day curve counts users per rolling 24 hours.
        A dash means the project has no contract on chain yet. Launchpad volume is decoded from Chainzy, CorePad and Signal trades.
      </p>
      <EcoSource what="Project list, statuses and user activity" />
    </div>
  );
});
