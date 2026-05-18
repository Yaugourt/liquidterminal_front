"use client";

import { useState } from "react";
import { useWallets } from "@/store/use-wallets";
import { useUserFills } from "@/services/explorer/address/hooks/useUserFills";
import { Copy, Check } from "lucide-react";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatters/numberFormatting';
import { formatAge } from "@/services/explorer/address/utils";
import { TypedDataTable, type Column } from "@/components/common";
import { Card } from "@/components/ui/card";
import type { UserFill } from "@/services/explorer/address/types";

interface WalletRecentFillsSectionProps {
  address?: string;
}

export function WalletRecentFillsSection({ address: addressProp }: WalletRecentFillsSectionProps = {}) {
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();

  const walletAddress = addressProp || activeWallet?.address;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

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

  const formatHash = (hash: string) => {
    if (!hash) return '-';
    return hash.length > 10 ? `${hash.slice(0, 5)}...${hash.slice(-3)}` : hash;
  };

  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  const formatDirection = (dir: string) => {
    const isClose = dir.toLowerCase().includes('close');
    const isShort = dir.toLowerCase().includes('short');
    const isLong = dir.toLowerCase().includes('long');
    if (isClose) return <span className="text-gold">{dir}</span>;
    if (isShort) return <span className="text-rose-400">{dir}</span>;
    if (isLong) return <span className="text-emerald-400">{dir}</span>;
    return <span className="text-text-primary">{dir}</span>;
  };

  const formatPnl = (pnl: string) => {
    const pnlValue = parseFloat(pnl);
    if (pnlValue === 0) return <span className="text-white/50">$0.00</span>;
    const color = pnlValue > 0 ? 'text-emerald-400' : 'text-rose-400';
    const sign = pnlValue > 0 ? '+' : '';
    return <span className={color}>{sign}{formatCurrency(Math.abs(pnlValue))}</span>;
  };

  if (!activeWallet?.address) {
    return (
      <Card className="flex items-center justify-center h-[600px] text-text-primary">
        No wallet selected
      </Card>
    );
  }

  const columns: Column<UserFill>[] = [
    {
      key: "hash",
      header: "Hash",
      accessor: (fill) => (
        <div className="flex items-center gap-1.5">
          <span className="text-brand" title={fill.hash}>
            {formatHash(fill.hash)}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); copyHashToClipboard(fill.hash); }}
            className="group p-1 rounded transition-colors"
          >
            {copiedHash === fill.hash ? (
              <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "coin",
      header: "Asset",
      accessor: "coin",
    },
    {
      key: "dir",
      header: "Direction",
      accessor: (fill) => formatDirection(fill.dir),
    },
    {
      key: "time",
      header: "Age",
      accessor: (fill) => formatAge(fill.time),
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      accessor: (fill) => parseFloat(fill.sz).toFixed(4),
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
      type: "numeric",
      align: "right",
      accessor: (fill) => formatPnl(fill.closedPnl),
    },
    {
      key: "fee",
      header: "Fee",
      type: "numeric",
      align: "right",
      accessor: (fill) => `${formatCurrency(fill.fee)} ${fill.feeToken}`,
    },
  ];

  return (
    <Card className="flex flex-col">
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
      />
    </Card>
  );
}
