"use client";

import { TypedDataTable, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { HIP4_ASSETS } from "@/lib/hip4/markets-static-data";

type Hip4Asset = (typeof HIP4_ASSETS)[number];

/** Yes / No legs read green / red; named sides (e.g. "Hypurr") stay neutral brand. */
function sideVariant(name: string): "success" | "error" | "info" {
  if (name === "Yes") return "success";
  if (name === "No") return "error";
  return "info";
}

const columns: Column<Hip4Asset>[] = [
  {
    key: "coin",
    header: "Coin",
    accessor: "coin",
  },
  {
    key: "outcome",
    header: "Outcome",
    accessor: (a) => `#${a.outcome} ${a.outcomeName}`,
  },
  {
    key: "side",
    header: "Side",
    accessor: (a) => <StatusBadge variant={sideVariant(a.sideName)}>{a.sideName}</StatusBadge>,
  },
  {
    key: "assetIndex",
    header: "Asset index",
    type: "numeric",
    accessor: (a) => 100_000_000 + parseInt(a.coin.slice(1), 10),
  },
  {
    key: "mid",
    header: "Mid",
    type: "numeric",
    tone: (a) => (a.mid >= 0.5 ? "success" : "danger"),
    accessor: (a) => `${(a.mid * 100).toFixed(1)}%`,
  },
];

export function Hip4AssetTable() {
  return (
    <TypedDataTable<Hip4Asset>
      data={HIP4_ASSETS as unknown as Hip4Asset[]}
      columns={columns}
      getRowKey={(a) => `${a.coin}-${a.sideName}`}
      density="compact"
    />
  );
}
