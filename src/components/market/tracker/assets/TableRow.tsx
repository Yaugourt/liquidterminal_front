"use client";

import { memo } from "react";
import { TableRow as UITableRow, TableCell } from "@/components/ui/table";
import { HoldingDisplay, PerpHoldingDisplay } from "@/components/types/wallet.types";
import { TokenIcon } from "@/components/common/TokenIcon";

interface SpotRowProps {
  holding: HoldingDisplay;
  formatCurrency: (value: number | string) => string;
  formatTokenAmount: (value: number | string) => string;
  formatPercent: (value: number) => string;
}

interface PerpRowProps {
  holding: PerpHoldingDisplay;
  formatCurrency: (value: number | string) => string;
  formatTokenAmount: (value: number | string) => string;
  formatPercent: (value: number) => string;
}

export const SpotTableRow = memo(function SpotTableRow({
  holding,
  formatCurrency,
  formatTokenAmount,
  formatPercent
}: SpotRowProps) {
  return (
    <UITableRow className="hover:bg-white/[0.02]">
      <TableCell className="pl-4 pr-3">
        <div className="flex items-center gap-3">
          <TokenIcon 
            src={holding.logo} 
            name={holding.coin} 
            size="md" 
            variant="dark"
          />
          <span className="text-white text-sm font-medium">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-white text-sm">
        {formatTokenAmount(holding.total)}
      </TableCell>
      <TableCell className="text-white text-sm">
        {formatCurrency(holding.price)}
      </TableCell>
      <TableCell 
        className="text-sm font-medium" 
        style={{color: holding.pnlPercentage < 0 ? '#f87171' : '#4ade80'}}
      >
        {formatPercent(holding.pnlPercentage)}
      </TableCell>
      <TableCell className="text-white text-sm pr-4 font-medium">
        {formatCurrency(holding.totalValue)}
      </TableCell>
    </UITableRow>
  );
});

export const PerpTableRow = memo(function PerpTableRow({
  holding,
  formatCurrency,
  formatTokenAmount
}: PerpRowProps) {
  const formatTokenSize = (szi: string, coin: string) => {
    const amount = parseFloat(szi);
    const absAmount = Math.abs(amount);
    const formattedAmount = formatTokenAmount(absAmount.toString());
    return `${amount < 0 ? '-' : ''}${formattedAmount} ${coin}`;
  };

  const formatUnrealizedPnl = (pnl: string) => {
    const pnlNum = parseFloat(pnl);
    return (
      <span className={pnlNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
        {formatCurrency(pnlNum)}
      </span>
    );
  };

  const formatFunding = (funding: string) => {
    const fundingNum = parseFloat(funding);
    return (
      <span className={fundingNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
        {formatCurrency(fundingNum)}
      </span>
    );
  };

  return (
    <UITableRow className="hover:bg-white/[0.02]">
      <TableCell className="pl-4 pr-3">
        <div className="flex items-center gap-3">
          <TokenIcon 
            src={holding.logo} 
            name={holding.coin} 
            size="md" 
            variant="dark"
          />
          <span className="text-white text-sm font-medium">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm">
        <div className="flex flex-col gap-0.5">
          <span className={holding.type === 'Short' ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
            {holding.type}
          </span>
          <span className="text-label text-text-muted">
            {holding.leverage.value}x ({holding.leverage.type})
          </span>
        </div>
      </TableCell>
      <TableCell className="text-white text-sm">
        {formatCurrency(holding.entryPrice)}
      </TableCell>
      <TableCell className="text-white text-sm">
        {formatCurrency(holding.liquidation)}
      </TableCell>
      <TableCell className="text-white text-sm">
        {formatCurrency(holding.price)}
      </TableCell>
      <TableCell className="text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-white text-sm font-medium">
            {formatCurrency(holding.positionValue)}
          </span>
          <span className="text-label text-text-muted">
            {formatTokenSize(holding.szi, holding.coin)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm font-medium">
        {formatUnrealizedPnl(holding.unrealizedPnl)}
      </TableCell>
      <TableCell className="text-sm pr-4 font-medium">
        {formatFunding(holding.funding)}
      </TableCell>
    </UITableRow>
  );
});
