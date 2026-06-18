import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { PnLCardProps, PnLVariation } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES, PERIODS } from "./constants";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { NumberFormatType } from "@/store/number-format.store";
import { cn } from "@/lib/utils";

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

    const renderPeriod = useCallback(({ key, label }: typeof PERIODS[0]) => {
        const periodData = portfolio?.find?.(entry => entry[0] === key)?.[1];
        const variation = getVariation(periodData?.accountValueHistory, key, pnlMode, format);

        return (
            <div key={key}>
                <div className="text-xs text-text-primary mb-1 tracking-wide font-medium">
                    {label}
                </div>
                <div className={
                    variation.numericValue !== null
                        ? variation.numericValue >= 0
                            ? "text-success text-sm font-medium tabular-nums"
                            : "text-danger text-sm font-medium tabular-nums"
                        : "text-text-primary text-sm font-medium tabular-nums"
                }>
                    {variation.value !== null ? variation.value : '-'}
                </div>
            </div>
        );
    }, [portfolio, pnlMode, format]);

    return (
        <Card className={CARD_BASE_CLASSES}>
            <div className="flex justify-between items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 ml-4">
                    <TrendingUp size={16} className="text-gold" />
                    <h3 className="text-[11px] text-text-primary font-medium tracking-wide font-inter">PNL</h3>
                </div>
                <div
                    role="group"
                    aria-label="PnL unit"
                    className="mr-4 flex items-center rounded-md border border-border-subtle bg-base p-0.5"
                >
                    {(['percent', 'dollar'] as const).map((mode) => {
                        const isActive = pnlMode === mode;
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setPnlMode(mode)}
                                aria-pressed={isActive}
                                className={cn(
                                    "rounded px-2 py-0.5 text-[11px] font-semibold transition-colors",
                                    isActive
                                        ? "bg-gold/10 text-gold"
                                        : "text-text-tertiary hover:text-text-primary"
                                )}
                            >
                                {mode === 'percent' ? '%' : '$'}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 ml-4">
                {isLoading ? (
                    <div className="col-span-2 flex justify-center items-center p-4">
                        <InlineSpinner className="w-5 h-5 text-brand" />
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