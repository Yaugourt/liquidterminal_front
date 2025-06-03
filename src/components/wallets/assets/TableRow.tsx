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
}

export const SpotTableRow = memo(function SpotTableRow({
  holding,
  formatCurrency,
  formatTokenAmount,
  formatPercent
}: SpotRowProps) {
  return (
    <UITableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
      <TableCell className="py-2 pl-4">
        <div className="flex items-center gap-2">
          {holding.logo ? (
            <img src={holding.logo} alt={holding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
          ) : (
            <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
          )}
          <span className="text-white text-sm">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2">
        {formatTokenAmount(holding.total)}
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2">
        {formatCurrency(holding.price)}
      </TableCell>
      <TableCell 
        className="text-right text-sm py-2" 
        style={{color: holding.pnlPercentage < 0 ? '#FF4D4F' : '#52C41A'}}
      >
        {formatPercent(holding.pnlPercentage)}
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2 pr-4">
        {formatCurrency(holding.totalValue)}
      </TableCell>
    </UITableRow>
  );
});

export const PerpTableRow = memo(function PerpTableRow({
  holding,
  formatCurrency
}: PerpRowProps) {
  return (
    <UITableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
      <TableCell className="py-2 pl-4">
        <div className="flex items-center gap-2">
          {holding.logo ? (
            <img src={holding.logo} alt={holding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
          ) : (
            <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
          )}
          <span className="text-white text-sm">{holding.coin}</span>
        </div>
      </TableCell>
      <TableCell className="text-right py-2">
        <span className={holding.type === 'Short' ? 'text-[#FF4D4F]' : 'text-[#52C41A]'}>
          {holding.type}
        </span>
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2">
        {formatCurrency(holding.marginUsed)}
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2">
        {formatCurrency(holding.positionValue)}
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2">
        {formatCurrency(holding.entryPrice)}
      </TableCell>
      <TableCell className="text-right text-white text-sm py-2 pr-4">
        {formatCurrency(holding.liquidation)}
      </TableCell>
    </UITableRow>
  );
}); 