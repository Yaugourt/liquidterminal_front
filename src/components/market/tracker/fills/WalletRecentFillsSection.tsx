"use client";

import { useState } from "react";
import { useWallets } from "@/store/use-wallets";
import { useUserFills } from "@/services/explorer/address/hooks/useUserFills";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue, formatNumber } from '@/lib/formatters/numberFormatting';
import { formatAge } from "@/services/explorer/address/utils";
import { TypedDataTable, ModuleAsset, toTradeSide, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { UserFill } from "@/services/explorer/address/types";

interface WalletRecentFillsSectionProps {
  address?: string;
}

type BadgeVariant = "gold" | "buy" | "sell" | "neutral";

/** Fill direction ("Open Long", "Close Short", "Buy"…) → badge colour. Closes read gold. */
function directionVariant(dir: string): BadgeVariant {
  if (dir.toLowerCase().includes("close")) return "gold";
  const side = toTradeSide(dir);
  if (side === "long" || side === "buy") return "buy";
  if (side === "short" || side === "sell") return "sell";
  return "neutral";
}

export function WalletRecentFillsSection({ address: addressProp }: WalletRecentFillsSectionProps = {}) {
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();

  const walletAddress = addressProp || activeWallet?.address;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: allFills,
    isLoading,
    error
  } = useUserFills(walletAddress, {
    pageSize: 1000,
    refreshInterval: 30000
  });

  const fills = allFills || [];
  const total = fills.length;
  const paginatedFills = fills.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const formatCurrency = (value: string | number) => formatAssetValue(Number(value), format);

  if (!walletAddress) {
    return <EmptyState title="Recent fills" description="No wallet selected" />;
  }

  const columns: Column<UserFill>[] = [
    {
      key: "hash",
      header: "Hash",
      // TWAP slices carry the zero hash: nothing to link to.
      accessor: (fill) =>
        fill.hash && !/^0x0+$/.test(fill.hash) ? (
          <AddressDisplay
            address={fill.hash}
            href={`/explorer/transaction/${fill.hash}`}
            copyMessage="Hash copied to clipboard"
          />
        ) : "—",
    },
    {
      key: "coin",
      header: "Asset",
      accessor: (fill) => <ModuleAsset assetName={fill.coin} name={fill.coin} />,
    },
    {
      key: "dir",
      header: "Direction",
      accessor: (fill) => <StatusBadge variant={directionVariant(fill.dir)}>{fill.dir}</StatusBadge>,
    },
    {
      key: "time",
      header: "Age",
      type: "time",
      accessor: (fill) => formatAge(fill.time),
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      accessor: (fill) => formatNumber(parseFloat(fill.sz), format, { maximumFractionDigits: 4 }),
    },
    {
      key: "px",
      header: "Price",
      type: "numeric",
      accessor: (fill) => formatCurrency(fill.px),
    },
    {
      key: "closedPnl",
      header: "PnL",
      type: "change",
      getSortValue: (fill) => parseFloat(fill.closedPnl) || 0,
      accessor: (fill) => {
        const pnl = parseFloat(fill.closedPnl) || 0;
        // Full precision (sub-cent PnL stays visible), explicit sign.
        return pnl === 0 ? "—" : `${pnl < 0 ? "-" : "+"}${formatCurrency(Math.abs(pnl))}`;
      },
    },
    {
      key: "fee",
      header: "Fee",
      type: "fees",
      accessor: (fill) => `${formatCurrency(fill.fee)} ${fill.feeToken}`,
    },
  ];

  return (
    <TypedDataTable<UserFill>
      data={paginatedFills}
      columns={columns}
      getRowKey={(fill) => `${fill.hash}-${fill.tid}`}
      isLoading={isLoading}
      error={error ?? null}
      emptyMessage="No fills found"
      emptyDescription=""
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
      rowsPerPageOptions={[10, 25, 50]}
      paginationVariant={total > 0 ? "full" : "none"}
      density="compact"
    />
  );
}
