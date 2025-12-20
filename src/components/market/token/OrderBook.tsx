"use client";

import { useState } from "react";
import { useTokenWebSocket, marketIndexToCoinId } from "@/services/market/token";
import { cn } from "@/lib/utils";
import "@/styles/scrollbar.css";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillTabs } from "@/components/ui/pill-tabs";

interface OrderBookProps {
  symbol?: string;
  marketIndex?: number;
  tokenNameProp?: string;
  className?: string;
}

export function OrderBook({ symbol, marketIndex, tokenNameProp, className }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');

  // Connect to WebSocket for real-time order book and trades
  const coinId = marketIndex !== undefined ? marketIndexToCoinId(marketIndex, tokenNameProp) : '';
  const { orderBook, trades } = useTokenWebSocket(coinId);

  // Use only real data from WebSocket
  const displayBids = orderBook.bids || [];
  const displayAsks = orderBook.asks || [];
  const displayTrades = trades || [];

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatSize = (size: string | number) => {
    const numSize = typeof size === 'string' ? parseFloat(size) : size;
    return numSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  };

  // Calculate spread between best bid and best ask
  const calculateSpread = () => {
    if (displayBids.length === 0 || displayAsks.length === 0) {
      return { absolute: 0, percentage: 0 };
    }

    const bestBid = parseFloat(displayBids[0].px); // Highest bid
    const bestAsk = parseFloat(displayAsks[0].px); // Lowest ask
    const absolute = bestAsk - bestBid;
    const percentage = (absolute / bestAsk) * 100;

    return { absolute, percentage };
  };

  const spread = calculateSpread();

  // Calculate cumulative totals for orderbook levels
  const calculateCumulativeTotals = (levels: { px: string; sz: string }[]) => {
    let cumulative = 0;
    return levels.map(level => {
      const size = parseFloat(level.sz);
      cumulative += size;
      return cumulative;
    });
  };

  const bidsCumulative = calculateCumulativeTotals(displayBids);

  // For asks: calculate cumulative from lowest to highest price, but display from highest to lowest
  const calculateAsksCumulative = () => {
    const sortedAsks = [...displayAsks].sort((a, b) => parseFloat(a.px) - parseFloat(b.px)); // Sort from lowest to highest price
    let cumulative = 0;
    const cumulativeMap = new Map();

    sortedAsks.forEach(ask => {
      cumulative += parseFloat(ask.sz);
      cumulativeMap.set(ask.px, cumulative);
    });

    return cumulativeMap;
  };

  const asksCumulativeMap = calculateAsksCumulative();

  // Extract token name from symbol (e.g., "HYPE/USDC" -> "HYPE")
  const tokenName = symbol ? symbol.split('/')[0] : 'TOKEN';

  return (
    <GlassPanel className={`flex flex-col h-full overflow-hidden ${className || ''}`}>
      <div className="p-4 flex-shrink-0 border-b border-border-subtle">
        {/* Tabs Pills Style */}
        <div className="flex items-center gap-2">
          <PillTabs
            tabs={[
              { value: 'orderbook', label: 'Order Book' },
              { value: 'trades', label: 'Trades' }
            ]}
            activeTab={activeTab}
            onTabChange={(val) => setActiveTab(val as 'orderbook' | 'trades')}
            className="bg-brand-dark border border-border-subtle"
          />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        {activeTab === 'orderbook' ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-text-secondary font-semibold uppercase tracking-wider flex-shrink-0 mb-2">
              <span>Price</span>
              <span className="text-right">Size ({tokenName})</span>
              <span className="text-right">Total ({tokenName})</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-0">

              {/* Asks (Sell orders) - 7 ordres */}
              <div className="space-y-1 mb-3">
                {displayAsks.slice(0, 7).reverse().map((ask, index) => {
                  const cumulativeTotal = asksCumulativeMap.get(ask.px) || 0;
                  const maxCumulative = Math.max(...Array.from(asksCumulativeMap.values()));
                  const depthPercentage = maxCumulative > 0 ? (cumulativeTotal / maxCumulative) * 100 : 0;

                  return (
                    <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-xs hover:bg-white/5 py-1 rounded relative transition-colors">
                      <div
                        className="absolute inset-0 bg-rose-500/20 rounded"
                        style={{
                          width: `${Math.min(depthPercentage * 1.5, 100)}%`,
                          right: 0
                        }}
                      />
                      <span className="text-rose-400 relative z-10 font-medium">${formatPrice(ask.px)}</span>
                      <span className="text-white text-right relative z-10">{formatSize(ask.sz)}</span>
                      <span className="text-text-secondary text-right relative z-10">{formatSize(cumulativeTotal)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Spread */}
              <div className="border-y border-border-subtle py-2 text-center mb-2 mx-1 flex items-center justify-center gap-5">
                <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Spread</span>
                <span className="text-xs text-white font-medium">
                  {spread.absolute > 0 ? (
                    `${spread.absolute.toFixed(3)} (${spread.percentage.toFixed(6)}%)`
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>

              {/* Bids (Buy orders) - 7 ordres */}
              <div className="space-y-1">
                {displayBids.slice(0, 7).map((bid, index) => {
                  const cumulativeTotal = bidsCumulative[index];
                  const maxCumulative = Math.max(...bidsCumulative);
                  const depthPercentage = maxCumulative > 0 ? (cumulativeTotal / maxCumulative) * 100 : 0;

                  return (
                    <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-xs hover:bg-white/5 py-1 rounded relative transition-colors">
                      <div
                        className="absolute inset-0 bg-emerald-500/20 rounded"
                        style={{
                          width: `${Math.min(depthPercentage * 1.7, 100)}%`,
                          left: 0
                        }}
                      />
                      <span className="text-emerald-400 relative z-10 font-medium">${formatPrice(bid.px)}</span>
                      <span className="text-white text-right relative z-10">{formatSize(bid.sz)}</span>
                      <span className="text-text-secondary text-right relative z-10">{formatSize(cumulativeTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-text-secondary font-semibold uppercase tracking-wider border-b border-border-subtle pb-2 flex-shrink-0 mb-2">
              <span>Price</span>
              <span className="text-right">Size (token)</span>
              <span className="text-right">Time</span>
            </div>

            {/* Trades - Scrollable */}
            <div className="h-[402px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <div className="space-y-1">
                {displayTrades.slice(0, 50).map((trade, index) => {
                  // Handle real trades from WebSocket
                  const tradeType = trade.side === 'B' ? 'Buy' : 'Sell';
                  const tradePrice = parseFloat(trade.px);
                  const tradeSize = parseFloat(trade.sz);
                  const tradeTime = new Date(trade.time).toLocaleTimeString();

                  return (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-white/5 py-1 rounded px-1 transition-colors">
                      <span className={cn(
                        "font-medium",
                        tradeType === 'Buy' ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        ${formatPrice(tradePrice)}
                      </span>
                      <span className="text-white text-right">{formatSize(tradeSize)}</span>
                      <span className="text-text-secondary text-right text-xs">{tradeTime}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
