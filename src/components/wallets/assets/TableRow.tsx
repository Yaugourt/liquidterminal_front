"use client";

import { memo } from "react";
import { TableRow as UITableRow, TableCell } from "@/components/ui/table";
import { HoldingDisplay, PerpHoldingDisplay } from "@/components/types/wallet.types";

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
    <UITableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
      <TableCell className="py-2 pl-4 w-[160px]">
        <div className="flex items-center gap-2">
          {holding.logo ? (
            <img src={holding.logo} alt={holding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
          ) : (
            <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
          )}
          <span className="text-white text-sm">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-white text-sm py-2 w-[140px]">
        {formatTokenAmount(holding.total)}
      </TableCell>
      <TableCell className="text-white text-sm py-2 w-[140px]">
        {formatCurrency(holding.price)}
      </TableCell>
      <TableCell 
        className="text-sm py-2 w-[140px]" 
        style={{color: holding.pnlPercentage < 0 ? '#FF4D4F' : '#52C41A'}}
      >
        {formatPercent(holding.pnlPercentage)}
      </TableCell>
      <TableCell className="text-white text-sm py-2 pr-4 w-[140px]">
        {formatCurrency(holding.totalValue)}
      </TableCell>
    </UITableRow>
  );
});

export const PerpTableRow = memo(function PerpTableRow({
  holding,
  formatCurrency,
  formatTokenAmount,
  formatPercent
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
      <span className={pnlNum >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}>
        {formatCurrency(pnlNum)}
      </span>
    );
  };

  const formatFunding = (funding: string) => {
    const fundingNum = parseFloat(funding);
    return (
      <span className={fundingNum >= 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'}>
        {formatCurrency(fundingNum)}
      </span>
    );
  };

  return (
    <UITableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
      <TableCell className="py-2 pl-4 w-[140px]">
        <div className="flex items-center gap-2">
          {holding.logo ? (
            <img src={holding.logo} alt={holding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
          ) : (
            <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
          )}
          <span className="text-white text-sm">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm py-2 w-[100px]">
        <div className="flex flex-col gap-1">
          <span className={holding.type === 'Short' ? 'text-[#FF4D4F]' : 'text-[#52C41A]'}>
            {holding.type}
          </span>
          <span className="text-xs text-[#FFFFFF80]">
            {holding.leverage.value}x ({holding.leverage.type})
          </span>
        </div>
      </TableCell>
      <TableCell className="text-white text-sm py-2 w-[120px]">
        {formatCurrency(holding.entryPrice)}
      </TableCell>
      <TableCell className="text-white text-sm py-2 w-[120px]">
        {formatCurrency(holding.liquidation)}
      </TableCell>
      <TableCell className="text-white text-sm py-2 w-[100px]">
        {formatCurrency(holding.price)}
      </TableCell>
      <TableCell className="text-sm py-2 w-[140px]">
        <div className="flex flex-col gap-1">
          <span className="text-white text-sm">
            {formatCurrency(holding.positionValue)}
          </span>
          <span className="text-xs text-[#FFFFFF80]">
            {formatTokenSize(holding.szi, holding.coin)}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm py-2 w-[140px]">
        {formatUnrealizedPnl(holding.unrealizedPnl)}
      </TableCell>
      <TableCell className="text-sm py-2 pr-4 w-[120px]">
        {formatFunding(holding.funding)}
      </TableCell>
    </UITableRow>
  );
}); 