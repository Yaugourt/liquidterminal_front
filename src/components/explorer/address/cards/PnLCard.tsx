import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { PnLCardProps, PnLVariation } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES, PERIODS } from "./constants";
import { formatNumber } from "@/lib/formatters/numberFormatting";
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

const PnLCardComponent = ({ portfolio, isLoading, format }: PnLCardProps) => {
    const [pnlMode, setPnlMode] = useState<'percent' | 'dollar'>('percent');

    const handlePnLModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setPnlMode(e.target.value as 'percent' | 'dollar');
    }, []);

    const renderPeriod = useCallback(({ key, label }: typeof PERIODS[0]) => {
        const periodData = portfolio?.find?.(entry => entry[0] === key)?.[1];
        const variation = getVariation(periodData?.accountValueHistory, key, pnlMode, format);

        return (
            <div key={key}>
                <div className="text-xs text-white mb-1 tracking-wide font-medium">
                    {label}
                </div>
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
            {/* Header avec titre décalé et bouton à droite */}
            <div className="flex justify-between items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 ml-4">
                    <TrendingUp size={16} className="text-brand-gold" />
                    <h3 className="text-white text-[16px] font-inter">PNL</h3>
                </div>
                <select
                    className="bg-brand-tertiary text-brand-gold border border-[#83E9FF4D] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent mr-4"
                    value={pnlMode}
                    onChange={handlePnLModeChange}
                >
                    <option value="percent">%</option>
                    <option value="dollar">$</option>
                </select>
            </div>

            {/* PnL breakdown en grille 2x2 */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 ml-4">
                {isLoading ? (
                    <div className="col-span-2 flex justify-center items-center p-4">
                        <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                    </div>
                ) : (
                    PERIODS.map(renderPeriod)
                )}
            </div>
        </Card>
    );
};

export const PnLCard = memo(PnLCardComponent);
PnLCard.displayName = 'PnLCard';