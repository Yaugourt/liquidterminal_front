"use client";

import { useTokenTrades } from "@/services/market/token";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// Built once: `toLocaleString` with options builds a formatter on every call
// (~40x slower), and the list formats four values for each of its 50 rows.
const PRICE_FORMAT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const SIZE_FORMAT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
const VALUE_FORMAT = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TIME_FORMAT = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const formatPrice = (price: string | number) =>
    PRICE_FORMAT.format(typeof price === 'string' ? parseFloat(price) : price);

const formatSize = (size: string | number) =>
    SIZE_FORMAT.format(typeof size === 'string' ? parseFloat(size) : size);

const formatTime = (timestamp: number) => TIME_FORMAT.format(new Date(timestamp));

interface RecentTradesProps {
    coinId: string;
    tokenName?: string;
    className?: string;
}

export function RecentTrades({ coinId, tokenName, className }: RecentTradesProps) {
    const { trades, isLoading } = useTokenTrades(coinId);

    const displayTrades = trades || [];
    const displayName = tokenName || coinId;

    return (
        <Card className={cn("flex flex-col h-full", className)}>
            <div className="p-4 flex-shrink-0 border-b border-border-subtle">
                <h3 className="text-sm font-semibold text-text-primary">Recent Trades</h3>
                <p className="text-xs text-text-secondary mt-1">
                    Live trades for {displayName}
                </p>
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 text-label text-text-secondary border-b border-border-subtle pb-2 flex-shrink-0 mb-2 px-1 pr-[14px]">
                    <span>Price</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Value</span>
                    <span className="text-right">Time</span>
                </div>

                {/* Trades List */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-brand min-h-0">
                    {isLoading && displayTrades.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-text-secondary text-sm">
                            Connecting to live trades...
                        </div>
                    ) : displayTrades.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-text-secondary text-sm">
                            Waiting for trades...
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {displayTrades.slice(0, 50).map((trade) => {
                                const tradePrice = parseFloat(trade.px);
                                const tradeSize = parseFloat(trade.sz);
                                const tradeValue = tradePrice * tradeSize;
                                const isBuy = trade.side === 'B';

                                return (
                                    <div
                                        key={trade.tid}
                                        className="grid grid-cols-4 gap-4 text-xs hover:bg-surface-2 py-1.5 px-1 rounded transition-colors"
                                    >
                                        <span className={cn(
                                            "font-medium mono",
                                            isBuy ? 'text-success' : 'text-danger'
                                        )}>
                                            ${formatPrice(tradePrice)}
                                        </span>
                                        <span className="mono text-text-primary text-right">
                                            {formatSize(tradeSize)}
                                        </span>
                                        <span className="mono text-text-secondary text-right">
                                            ${VALUE_FORMAT.format(tradeValue)}
                                        </span>
                                        <span className="mono text-text-secondary text-right">
                                            {formatTime(trade.time)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
