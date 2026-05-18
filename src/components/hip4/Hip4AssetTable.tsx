"use client";

import { TypedDataTable, type Column } from "@/components/common";
import { HIP4_ASSETS, sideBadgeClass } from "@/lib/hip4/markets-static-data";
import { cn } from "@/lib/utils";

type Hip4Asset = (typeof HIP4_ASSETS)[number];

const columns: Column<Hip4Asset>[] = [
  {
    key: "coin",
    header: "Coin",
    type: "address",
    accessor: (a) => (
      <span className="font-mono font-bold text-brand">{a.coin}</span>
    ),
  },
  {
    key: "outcome",
    header: "Outcome",
    accessor: (a) => (
      <span className="text-xs">#{a.outcome} {a.outcomeName}</span>
    ),
  },
  {
    key: "side",
    header: "Side",
    accessor: (a) => (
      <span
        className={cn(
          "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
          sideBadgeClass(a.sideName)
        )}
      >
        {a.sideName}
      </span>
    ),
  },
  {
    key: "assetIndex",
    header: "Asset index",
    type: "numeric",
    accessor: (a) => {
      const idx = 100_000_000 + parseInt(a.coin.slice(1), 10);
      return (
        <span className="font-mono text-[11px] text-gold">{idx}</span>
      );
    },
  },
  {
    key: "mid",
    header: "Mid",
    type: "numeric",
    accessor: (a) => {
      const color = a.mid >= 0.5 ? "text-emerald-400" : "text-red-400";
      return (
        <span className={cn("font-bold", color)}>
          {(a.mid * 100).toFixed(1)}%
        </span>
      );
    },
  },
];

export function Hip4AssetTable() {
  return (
    <TypedDataTable<Hip4Asset>
      data={HIP4_ASSETS as unknown as Hip4Asset[]}
      columns={columns}
      getRowKey={(a) => `${a.coin}-${a.sideName}`}
    />
  );
}
