import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PnLCardProps, PnLVariation } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES, PERIODS } from "./constants";
import { formatNumber } from "@/lib/formatting";
import { NumberFormatType } from "@/store/number-format.store";

const getVariation = (
    history: [number, string][] | undefined,
    periodKey: string,
    pnlMode: 'percent' | 'dollar',
    format: NumberFormatType
): PnLVariation => {
    if (!history || history.length < 2) return { value: null, numericValue: null };
    
    const last = parseFloat(history[history.length - 1][1]);
    const first = parseFloat(history[0][1]);
    
    if (periodKey === 'allTime' && first < 10) return { value: null, numericValue: null };
    if (periodKey !== 'allTime' && first < 1) return { value: null, numericValue: null };
    
    if (pnlMode === 'percent') {
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
};

export const PnLCard = memo(({ portfolio, isLoading, format }: PnLCardProps) => {
    const [pnlMode, setPnlMode] = useState<'percent' | 'dollar'>('percent');

    const handlePnLModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setPnlMode(e.target.value as 'percent' | 'dollar');
    }, []);

    const renderPeriod = useCallback(({ key, label }: typeof PERIODS[0]) => {
        const periodData = portfolio?.find?.(entry => entry[0] === key)?.[1];
        const variation = getVariation(periodData?.accountValueHistory, key, pnlMode, format);

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
    }, [portfolio, pnlMode, format]);

    return (
        <Card className={CARD_BASE_CLASSES}>
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-white text-[16px] font-serif">PnL</h3>
                <select
                    className="bg-[#051728] text-[#83E9FF] border border-[#1E3851] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#83E9FF]"
                    value={pnlMode}
                    onChange={handlePnLModeChange}
                >
                    <option value="percent">%</option>
                    <option value="dollar">$</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {isLoading ? (
                    <div className="col-span-2 flex justify-center items-center p-4">
                        <Loader2 className="w-5 h-5 text-[#83E9FF] animate-spin" />
                    </div>
                ) : (
                    PERIODS.map(renderPeriod)
                )}
            </div>
        </Card>
    );
}); 