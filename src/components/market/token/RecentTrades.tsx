"use client";

import { useTokenWebSocket } from "@/services/market/token";
import { cn } from "@/lib/utils";
import "@/styles/scrollbar.css";
import { Card } from "@/components/ui/card";

interface RecentTradesProps {
    coinId: string;
    tokenName?: string;
    className?: string;
}

export function RecentTrades({ coinId, tokenName, className }: RecentTradesProps) {
    const { trades, isLoading } = useTokenWebSocket(coinId);

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    const formatSize = (size: string | number) => {
        const numSize = typeof size === 'string' ? parseFloat(size) : size;
        return numSize.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const displayTrades = trades || [];
    const displayName = tokenName || coinId;

    return (
        <Card className={cn("flex flex-col h-full", className)}>
            <div className="p-4 flex-shrink-0 border-b border-border-subtle">
                <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
                <p className="text-xs text-text-secondary mt-1">
                    Live trades for {displayName}
                </p>
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 text-label text-text-secondary border-b border-border-subtle pb-2 flex-shrink-0 mb-2">
                    <span>Price</span>
                    <span className="text-right">Size</span>
                    <span className="text-right">Value</span>
                    <span className="text-right">Time</span>
                </div>

                {/* Trades List */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-0">
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
                            {displayTrades.slice(0, 50).map((trade, index) => {
                                const tradePrice = parseFloat(trade.px);
                                const tradeSize = parseFloat(trade.sz);
                                const tradeValue = tradePrice * tradeSize;
                                const isBuy = trade.side === 'B';

                                return (
                                    <div
                                        key={`${trade.tid}-${index}`}
                                        className="grid grid-cols-4 gap-4 text-xs hover:bg-white/5 py-1.5 px-1 rounded transition-colors"
                                    >
                                        <span className={cn(
                                            "font-medium",
                                            isBuy ? 'text-emerald-400' : 'text-rose-400'
                                        )}>
                                            ${formatPrice(tradePrice)}
                                        </span>
                                        <span className="text-white text-right">
                                            {formatSize(tradeSize)}
                                        </span>
                                        <span className="text-text-secondary text-right">
                                            ${tradeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-text-secondary text-right">
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
