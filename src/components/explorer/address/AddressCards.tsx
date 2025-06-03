"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { PortfolioPeriodData } from "@/services/explorer/types";
import { useAddressBalance } from "@/services/explorer/hooks/useAddressBalance";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatting';

interface AddressCardsProps {
  portfolio: any;
  loadingPortfolio: boolean;
  onAddClick: () => void;
  address: string;
}

export function AddressCards({ portfolio, loadingPortfolio, onAddClick, address }: AddressCardsProps) {
  const [pnlMode, setPnlMode] = useState<'percent' | 'dollar'>('percent');
  const { balances, isLoading: loadingBalances } = useAddressBalance(address);
  const { format } = useNumberFormat();

  // Format currency values with the proper number format
  const formatCurrency = useCallback((value: number) => {
    if (isNaN(value) || value === 0) return "$0.00";
    return formatNumber(value, format, {
      currency: '$',
      showCurrency: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [format]);

  function getVariation(history: [number, string][] | undefined, periodKey?: string): { value: string | null, numericValue: number | null } {
    if (!history || history.length < 2) return { value: null, numericValue: null };
    
    // Pour le calcul, on prend la dernière valeur comme référence
    const last = parseFloat(history[history.length - 1][1]);
    const first = parseFloat(history[0][1]);
    
    if (periodKey === 'allTime' && first < 10) return { value: null, numericValue: null };
    if (periodKey !== 'allTime' && first < 1) return { value: null, numericValue: null };
    
    if (pnlMode === 'percent') {
      // Calcul du pourcentage de variation
      const percentChange = ((last - first) / first) * 100;
      return {
        value: (percentChange >= 0 ? '+' : '-') + formatNumber(Math.abs(percentChange), format, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + '%',
        numericValue: percentChange
      };
    } else {
      const diff = last - first;
      return {
        value: (diff >= 0 ? '+' : '-') + formatNumber(Math.abs(diff), format, {
          currency: '$',
          showCurrency: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        numericValue: diff
      };
    }
  }

  const periods = [
    { key: 'allTime', label: 'All Time' },
    { key: 'day', label: '24H' },
    { key: 'week', label: '7D' },
    { key: 'month', label: '30D' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Overview Card */}
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-white text-[16px] font-serif">Overview</h3>
          <span className="text-[#83E9FF] text-[16px] font-medium">
            {loadingBalances ? (
              <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
            ) : (
              formatCurrency(balances.totalBalance)
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Spot:</div>
            <div className="text-white text-sm font-medium">
              {loadingBalances ? (
                <span className="text-[#83E9FF60]">Loading...</span>
              ) : (
                formatCurrency(balances.spotBalance)
              )}
            </div>
          </div>
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Vault:</div>
            <div className="text-white text-sm font-medium">
              {loadingBalances ? (
                <span className="text-[#83E9FF60]">Loading...</span>
              ) : (
                formatCurrency(balances.vaultBalance)
              )}
            </div>
          </div>
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Perps:</div>
            <div className="text-white text-sm font-medium">
              {loadingBalances ? (
                <span className="text-[#83E9FF60]">Loading...</span>
              ) : (
                formatCurrency(balances.perpBalance)
              )}
            </div>
          </div>
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Staked:</div>
            <div className="text-white text-sm font-medium">
              {loadingBalances ? (
                <span className="text-[#83E9FF60]">Loading...</span>
              ) : (
                formatCurrency(balances.stakedBalance)
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* PnL Card */}
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white text-[16px] font-serif">PnL</h3>
          <select
            className="bg-[#051728] text-[#83E9FF] border border-[#1E3851] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#83E9FF]"
            value={pnlMode}
            onChange={e => setPnlMode(e.target.value as 'percent' | 'dollar')}
          >
            <option value="percent">%</option>
            <option value="dollar">$</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {loadingPortfolio ? (
            <div className="col-span-2 flex justify-center items-center p-4">
              <Loader2 className="w-5 h-5 text-[#83E9FF] animate-spin" />
            </div>
          ) : (
            periods.map(({ key, label }) => {
              const periodData = portfolio?.find?.((entry: [string, PortfolioPeriodData]) => entry[0] === key)?.[1];
              const variation = getVariation(periodData?.accountValueHistory, key);
              return (
                <div key={key}>
                  <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">{label}:</div>
                  <div className={
                    variation.numericValue !== null 
                      ? variation.numericValue >= 0 
                        ? "text-[#4ADE80] text-sm font-medium" 
                        : "text-[#FF5757] text-sm font-medium"
                      : "text-white text-sm font-medium"
                  }>
                    {variation.value !== null ? variation.value : '-'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* More Info Card */}
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <h3 className="text-white text-[16px] font-serif mb-5">More Info</h3>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm">Private name tags</span>
              <Button 
                variant="outline"
                size="sm"
                className="bg-[#F3DC4D] text-black px-2 py-1 h-7 rounded-md text-xs font-medium hover:bg-opacity-90 transition-colors border-none"
                onClick={onAddClick}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
          <div>
            <div className="text-white text-sm mb-3">Transactions sent</div>
            <div className="flex gap-5">
              <div>
                <span className="text-[#FFFFFF80] text-xs">Latest:</span>
                <span className="text-[#83E9FF] ml-1.5 text-xs">Loading...</span>
              </div>
              <div>
                <span className="text-[#FFFFFF80] text-xs">First:</span>
                <span className="text-[#83E9FF] ml-1.5 text-xs">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 