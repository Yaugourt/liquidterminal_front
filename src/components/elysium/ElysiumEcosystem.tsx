"use client";

import { memo, useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, BadgeCheck, Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, SearchBar, Sparkline, TimeframeTabs, type KpiCell } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useElysiumProjects, type EcoProject } from "@/services/elysium";
import { EMPTY, Empty, elysiumTimeLabel } from "./shared";
import { EcoLogo, EcoSource, StatusTag, signedPct } from "./eco-shared";

type Window = "24h" | "7d";
type ValueKey = "users24h" | "wallets7d" | "txs7d" | "volume7d" | "launches7d" | "txsAll" | "walletsAll";
type SortKey = ValueKey | "chg24h" | "chg7d";

interface MetricCol {
  key: SortKey;
  label: string;
  hint: string;
  money?: boolean;
  /** Column width: the header or the longest figure, whichever is wider, plus the cell padding. */
  width: number;
  /** Secondary figures only show once the card has room for every column. */
  className?: string;
}

const FROM_1440 = "hidden min-[1440px]:table-cell";
const FROM_XL = "hidden xl:table-cell";

/** Active users = distinct wallets that sent a non-spam tx to one of the project's known contracts. */
const COLUMNS: Record<string, MetricCol[]> = {
  All: [
    { key: "users24h", label: "Users 24h", hint: "Active users over the last 24 hours", width: 91, className: FROM_1440 },
    { key: "chg24h", label: "Δ 24h", hint: "Change against the 24 hours before", width: 80, className: FROM_1440 },
    { key: "wallets7d", label: "Users 7d", hint: "Active users over the last 7 days", width: 84 },
    { key: "chg7d", label: "Δ 7d", hint: "Change against the 7 days before", width: 80 },
    { key: "txs7d", label: "Txs 7d", hint: "Transactions sent to the project's contracts over 7 days", width: 72 },
    { key: "txsAll", label: "Txs total", hint: "Transactions sent to the project's contracts since its first one", width: 91, className: FROM_XL },
  ],
  Games: [
    { key: "wallets7d", label: "Wallets 7d", hint: "Wallets that sent a transaction to the game's contracts over 7 days (a game that relays plays shows fewer wallets than players)", width: 98 },
    { key: "chg7d", label: "Δ 7d", hint: "Change against the 7 days before", width: 80 },
    { key: "txs7d", label: "Txs 7d", hint: "Transactions sent to the game's contracts over 7 days", width: 72 },
    { key: "walletsAll", label: "Wallets total", hint: "Wallets that ever sent a transaction to the game's contracts", width: 119, className: FROM_1440 },
    { key: "txsAll", label: "Txs total", hint: "Transactions sent to the game's contracts since its first one", width: 91, className: FROM_XL },
  ],
  Launchpad: [
    { key: "volume7d", label: "Volume 7d", hint: "Traded volume over 7 days", money: true, width: 91 },
    { key: "launches7d", label: "Launches 7d", hint: "Tokens launched over 7 days", width: 105, className: FROM_1440 },
    { key: "wallets7d", label: "Users 7d", hint: "Active users over the last 7 days", width: 84 },
    { key: "chg7d", label: "Δ 7d", hint: "Change against the 7 days before", width: 80 },
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
  return p[key] ?? null;
}

const SINCE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** "since Oct 14" from the first transaction sent to the project, when there is one. */
function since(p: EcoProject): string | null {
  return p.firstTxAt ? `since ${SINCE.format(new Date(p.firstTxAt))}` : null;
}

/** "6/8 verified": how many of the listed contracts have verified source on the explorer. */
function VerifiedTag({ p }: { p: EcoProject }) {
  if (p.verifiedContracts == null || p.contracts === 0) return null;
  const all = p.verifiedContracts === p.contracts;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] ${p.verifiedContracts > 0 ? "text-success" : "text-text-tertiary"}`}
      title={`${p.verifiedContracts} of its ${p.contracts} listed contracts have verified source on the Elysium explorer`}
    >
      <BadgeCheck size={10} />
      {all ? "verified" : `${p.verifiedContracts}/${p.contracts} verified`}
    </span>
  );
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
  rows,
  meta,
  actions,
  value,
  sub = (p) => p.category,
  empty = "No activity read yet.",
}: {
  title: string;
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
      <CardHead title={title} tag={meta} actions={actions} />
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
      {data?.activityGap && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-warning">
          {data.activityGap.to
            ? `No activity data from ${elysiumTimeLabel(data.activityGap.from)} to ${elysiumTimeLabel(data.activityGap.to)} UTC: the indexer paused, so users and txs in that window are missing. Activity since then is read live from the chain.`
            : `Activity is indexed up to ${elysiumTimeLabel(data.activityGap.from)} UTC: the indexer paused, so later users and txs are not counted yet.`}
        </div>
      )}
      <KpiRibbon cells={cells} columns="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        <TopList
          title="Most used"
          meta="users 7d"
          rows={top(projects, "wallets7d")}
          value={(p) => compactCount(p.wallets7d ?? 0)}
        />
        <TopList
          title="Gaining"
          actions={<TimeframeTabs options={["24h", "7d"]} value={moveWindow} onChange={(t) => setMoveWindow(t as Window)} />}
          rows={movers(projects, moveWindow, 1)}
          value={(p) => moverValue(p, moveWindow)}
          sub={(p) => moverSub(p, moveWindow)}
          empty={`No project with ${MIN_USERS}+ users is growing.`}
        />
        <TopList
          title="Losing"
          actions={<TimeframeTabs options={["24h", "7d"]} value={moveWindow} onChange={(t) => setMoveWindow(t as Window)} />}
          rows={movers(projects, moveWindow, -1)}
          value={(p) => moverValue(p, moveWindow)}
          sub={(p) => moverSub(p, moveWindow)}
          empty={`No project with ${MIN_USERS}+ users is declining.`}
        />
        <TopList
          title="Launchpad volume"
          meta="7 days"
          rows={top(projects, "volume7d")}
          value={(p) => compactUsd(p.volume7d ?? 0)}
        />
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardHead
          title="Projects"
          tag={data ? `${rows.length} shown` : undefined}
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
            // Wide table: every column has a px width, so it scrolls sideways inside ModuleTable's wrapper.
            // Project's name and tagline truncate; the row's title carries them.
            <ModuleTable
              columns={[
                { header: "Project", width: 206, align: "left" },
                { header: "Category", width: 140, align: "left" },
                { header: "Status", width: 120, align: "left" },
                ...cols.map((c) => ({
                  header: (
                    <span className="whitespace-nowrap" title={c.hint}>
                      <button
                        type="button"
                        onClick={() => setSort(sortKey === c.key ? null : c.key)}
                        className={`focus-ring relative inline-flex items-center uppercase ${sortKey === c.key ? "text-text-primary" : "hover:text-text-secondary"}`}
                      >
                        {c.label}
                        {/* Sits in the cell's left padding, so a sorted header needs no extra width. */}
                        {sortKey === c.key && <ArrowDown size={10} className="absolute -left-3 top-1/2 -translate-y-1/2" />}
                      </button>
                    </span>
                  ),
                  width: c.width,
                  className: c.className,
                  ariaSort: sortKey === c.key ? ("descending" as const) : undefined,
                })),
                { header: <span className="whitespace-nowrap" title="Active users per day over the last 14 days">Users 14d</span>, width: 91 },
                { header: "Links", width: 96 },
              ]}
            >
              {rows.map((p) => {
                const sub = [p.tagline, since(p)].filter(Boolean).join(" · ");
                return (
                <ModuleTableRow
                  key={p.slug}
                  cells={[
                    <div key="project" className="flex items-center gap-2.5 min-w-0" title={p.description || [p.name, sub].filter(Boolean).join(" · ") || undefined}>
                      <EcoLogo src={p.logo} label={p.name} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-text-primary font-medium truncate">{p.name}</span>
                          {p.verifiedContracts != null && p.verifiedContracts > 0 && <VerifiedTag p={p} />}
                        </div>
                        <div className="text-[10px] text-text-tertiary truncate max-w-[260px]">
                          {sub}
                        </div>
                      </div>
                    </div>,
                    <span key="category" className="block truncate text-text-secondary whitespace-nowrap" title={p.category}>{p.category}</span>,
                    <StatusTag key="status" status={p.status} label={p.statusLabel} />,
                    ...cols.map((c) =>
                      c.key === "chg24h" || c.key === "chg7d" ? (
                        <span key={c.key} className="mono whitespace-nowrap">
                          <ChangeCell p={p} w={c.key === "chg24h" ? "24h" : "7d"} />
                        </span>
                      ) : (
                        <span key={c.key} className={`mono ${p[c.key] == null ? "text-text-tertiary" : "text-text-primary"}`}>
                          {fmt(p[c.key as ValueKey], c.money)}
                        </span>
                      ),
                    ),
                    p.usersDaily?.some((n) => n > 0) ? (
                      <Sparkline key="users14" data={p.usersDaily} height={22} />
                    ) : (
                      <div key="users14" className="text-right text-text-tertiary mono">{EMPTY}</div>
                    ),
                    <div key="links" className="flex items-center justify-end gap-2.5 whitespace-nowrap">
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
                    </div>,
                  ]}
                />
                );
              })}
            </ModuleTable>
          )}
        </div>
      </Card>
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5">
        <Boxes size={12} className="mt-px shrink-0" />
        Active users are the distinct wallets that sent a non-spam transaction to a project&apos;s known contracts. Each Δ compares the
        last 24 hours (or 7 days) with the period just before; &ldquo;New&rdquo; means no user in that previous period. Gaining and losing
        lists only rank projects with {MIN_USERS} or more users in one of the two periods. The 14-day curve counts users per rolling 24 hours.
        Totals and &ldquo;since&rdquo; dates count every transaction since the project&apos;s first one. A dash means the project has no
        contract on chain yet. Launchpad volume is decoded from Chainzy, CorePad, Signal and Neuriio trades; HYPE is valued at its
        Hyperliquid price and test USDC at $1. &ldquo;Verified&rdquo; counts the listed contracts whose source is verified on the Elysium
        explorer.
      </p>
      <EcoSource what="Project list, statuses and user activity" />
    </div>
  );
});
