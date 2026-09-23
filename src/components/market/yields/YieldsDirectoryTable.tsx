"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { TypedDataTable, ModuleAsset, TableStat, TableSearch, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  TOP_YIELDS_MIN_TVL,
  type UseYieldsDirectoryResult,
  type YieldCategory,
  type YieldOpportunity,
  type YieldRiskLevel,
  type YieldSortField,
} from "@/services/market/yields";

const SEARCH_DEBOUNCE_MS = 400;

const CATEGORY_LABEL: Record<YieldCategory, string> = {
  lending: "Lending",
  amm: "AMM",
  yield: "Yield",
  staking: "Staking",
  derivatives: "Derivatives",
};

const TYPE_LABEL: Record<YieldOpportunity["type"], string> = {
  supply: "Supply",
  borrow: "Borrow",
  lp: "LP",
  stake: "Stake",
  pt: "PT",
  yt: "YT",
  vault: "Vault",
};

const RISK_VARIANT: Record<YieldRiskLevel, "success" | "gold" | "error"> = {
  low: "success",
  medium: "gold",
  high: "error",
};

const RISK_LABEL: Record<YieldRiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const initials = (name: string) => name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";

const pct = (v: number) => `${v.toFixed(2)}%`;

/** APY figure; the column types it (mono, tone). Adds the base/rewards split on hover. */
function ApyCell({ y }: { y: YieldOpportunity }) {
  const hasSplit = y.apy.reward > 0 && y.apy.base !== y.apy.total;
  if (!hasSplit) return <>{pct(y.apy.total)}</>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-border-default">
            {pct(y.apy.total)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="mono text-xs space-y-0.5">
            <div>Base {pct(y.apy.base)}</div>
            <div>Rewards {pct(y.apy.reward)}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function buildColumns(format: NumberFormatType): Column<YieldOpportunity>[] {
  return [
    {
      key: "protocol",
      header: "Protocol",
      accessor: (y) => (
        <ModuleAsset
          logo={initials(y.protocol.name)}
          name={
            y.protocol.website ? (
              <a
                href={y.protocol.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-brand transition-colors"
              >
                {y.protocol.name}
                <ExternalLink size={11} className="text-text-tertiary" />
              </a>
            ) : (
              y.protocol.name
            )
          }
          sub={TYPE_LABEL[y.type] ?? y.type}
        />
      ),
    },
    {
      key: "name",
      header: "Pool / tokens",
      className: "max-w-[280px]",
      sortable: true,
      accessor: (y) => (
        <ModuleAsset
          name={y.poolName}
          sub={y.tokens.length > 0 ? y.tokens.join(" / ") : undefined}
        />
      ),
    },
    {
      key: "category",
      header: "Category",
      accessor: (y) => (
        <StatusBadge variant="neutral">{CATEGORY_LABEL[y.category] ?? y.category}</StatusBadge>
      ),
    },
    {
      key: "apy",
      header: "APY",
      // JSX cell (tooltip split) → untyped column styled like a numeric one.
      align: "right",
      className: "mono whitespace-nowrap",
      sortable: true,
      tone: (y) => (y.type === "borrow" ? "danger" : y.apy.total > 0 ? "success" : "muted"),
      accessor: (y) => <ApyCell y={y} />,
    },
    {
      key: "apy7d",
      header: "7d",
      type: "numeric",
      accessor: (y) => (y.apy.apy7d !== null ? pct(y.apy.apy7d) : "—"),
    },
    {
      key: "apy30d",
      header: "30d",
      type: "numeric",
      accessor: (y) => (y.apy.apy30d !== null ? pct(y.apy.apy30d) : "—"),
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      sortable: true,
      accessor: (y) => (y.tvl !== null ? `$${formatNumber(y.tvl, format, { maximumFractionDigits: 0 })}` : "—"),
    },
    {
      key: "risk",
      header: "Risk",
      align: "right",
      headerAlign: "right",
      accessor: (y) => (
        <StatusBadge
          variant={RISK_VARIANT[y.risk.level]}
          title={[y.risk.impermanentLoss && "Impermanent loss", y.risk.liquidation && "Liquidation risk"]
            .filter(Boolean)
            .join(" · ")}
        >
          {RISK_LABEL[y.risk.level] ?? y.risk.level}
        </StatusBadge>
      ),
    },
  ];
}

interface YieldsDirectoryTableProps {
  directory: UseYieldsDirectoryResult;
}

export function YieldsDirectoryTable({ directory }: YieldsDirectoryTableProps) {
  const { format } = useNumberFormat();
  const { items, total, query, updateQuery, resetFilters, categoryFacets, protocolFacets, isLoading, error, refetch } =
    directory;

  const [search, setSearch] = useState(query.search ?? "");
  const [minApy, setMinApy] = useState(query.minApy?.toString() ?? "");
  const [maxApy, setMaxApy] = useState(query.maxApy?.toString() ?? "");
  const [minTvl, setMinTvl] = useState(query.minTvl?.toString() ?? "");

  // Debounce every free-text input into one server query.
  useEffect(() => {
    const handle = setTimeout(() => {
      const parse = (v: string) => (v.trim() === "" ? undefined : Math.max(0, Number(v)) || undefined);
      const next = {
        search: search.trim() || undefined,
        minApy: parse(minApy),
        maxApy: parse(maxApy),
        minTvl: parse(minTvl),
      };
      if (
        next.search !== query.search ||
        next.minApy !== query.minApy ||
        next.maxApy !== query.maxApy ||
        next.minTvl !== query.minTvl
      ) {
        updateQuery(next);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search, minApy, maxApy, minTvl, query.search, query.minApy, query.maxApy, query.minTvl, updateQuery]);

  const columns = useMemo(() => buildColumns(format), [format]);

  const fmt = (n: number) => n.toLocaleString("en-US");
  // Every category stays reachable even when the current filter set (e.g. the
  // TVL floor) reports zero for it; counts are shown when known.
  const categoryTabs = [
    { value: "all", label: "All" },
    ...(Object.keys(CATEGORY_LABEL) as YieldCategory[]).map((value) => {
      const count = categoryFacets.find((c) => c.value === value)?.count ?? 0;
      return { value, label: count > 0 ? `${CATEGORY_LABEL[value]} ${fmt(count)}` : CATEGORY_LABEL[value] };
    }),
  ];

  const hasFilters =
    Boolean(query.search) ||
    (query.category && query.category !== "all") ||
    (query.protocol && query.protocol !== "all") ||
    query.minApy !== undefined ||
    query.maxApy !== undefined ||
    query.minTvl !== TOP_YIELDS_MIN_TVL;

  const clearAll = () => {
    setSearch("");
    setMinApy("");
    setMaxApy("");
    setMinTvl(String(TOP_YIELDS_MIN_TVL));
    resetFilters();
  };

  const numberInput = (value: string, onChange: (v: string) => void, placeholder: string, width: string) => (
    <Input
      type="number"
      min={0}
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-8 text-xs bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50 ${width}`}
    />
  );

  const toolbar = (
    <>
      <TableSearch value={search} onChange={setSearch} placeholder="Search pool or token…" />
      <PillTabs
        variant="text"
        className="flex-wrap gap-y-1"
        tabs={categoryTabs}
        activeTab={query.category ?? "all"}
        onTabChange={(v) => updateQuery({ category: v as YieldCategory | "all" })}
      />
      <TableStat className="ml-auto" label="Opportunities" value={fmt(total)} />
      <div className="flex w-full flex-wrap items-center gap-2">
        <Select value={query.protocol ?? "all"} onValueChange={(v) => updateQuery({ protocol: v })}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="All protocols" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All protocols</SelectItem>
            {protocolFacets.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label} ({p.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {numberInput(minApy, setMinApy, "Min APY %", "w-[104px]")}
        {numberInput(maxApy, setMaxApy, "Max APY %", "w-[104px]")}
        {numberInput(minTvl, setMinTvl, "Min TVL $", "w-[112px]")}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-8 px-2 text-xs ${query.minTvl === TOP_YIELDS_MIN_TVL ? "text-brand" : "text-text-secondary"}`}
          onClick={() => setMinTvl(query.minTvl === TOP_YIELDS_MIN_TVL ? "" : String(TOP_YIELDS_MIN_TVL))}
          title="Hide pools under $100k TVL (thin pools print APYs nobody can capture)"
        >
          Deep pools
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs text-text-tertiary" onClick={clearAll}>
            <X size={12} className="mr-1" />
            Clear
          </Button>
        )}
      </div>
    </>
  );

  return (
    <TypedDataTable<YieldOpportunity>
      className="min-w-0"
      data={items}
      columns={columns}
      getRowKey={(y) => y.id}
      isLoading={isLoading && items.length === 0}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Failed to load yields"
      emptyMessage="No yield opportunities"
      emptyDescription="Try loosening the filters."
      toolbar={toolbar}
      onSortChange={(field, direction) =>
        updateQuery({ sortBy: field as YieldSortField, sortOrder: direction })
      }
      sortField={query.sortBy}
      sortDirection={query.sortOrder}
      paginationVariant="full"
      total={total}
      page={query.page - 1}
      rowsPerPage={query.pageSize}
      rowsPerPageOptions={[20, 50, 100]}
      onPageChange={(p) => updateQuery({ page: p + 1 })}
      onRowsPerPageChange={(rows) => updateQuery({ pageSize: rows, page: 1 })}
      paginationDisabled={isLoading}
    />
  );
}
