"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenWebSocket, marketIndexToCoinId } from "@/services/market/token";
import { cn } from "@/lib/utils";
import "@/styles/scrollbar.css";

interface OrderBookProps {
  symbol?: string;
  marketIndex?: number;
  className?: string;
}



export function OrderBook({ symbol, marketIndex, className }: OrderBookProps) {
  // Connect to WebSocket for real-time order book and trades
  const coinId = marketIndex ? marketIndexToCoinId(marketIndex) : '';
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
    <Card className={`bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] ${className}`}>
      <div className="p-3">
        <Tabs defaultValue="orderbook" className="w-full">
          <TabsList className="grid grid-cols-2 mb-1 bg-[#112941] border border-[#83E9FF33] h-6">
            <TabsTrigger value="orderbook" className="text-white text-xs data-[state=active]:bg-[#83E9FF4D] py-0">Order Book</TabsTrigger>
            <TabsTrigger value="trades" className="text-white text-xs data-[state=active]:bg-[#83E9FF4D] py-0">Trades</TabsTrigger>
          </TabsList>

          <TabsContent value="orderbook" className="mt-2">
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                <span>Price</span>
                <span className="text-right">Size ({tokenName})</span>
                <span className="text-right">Total ({tokenName})</span>
              </div>

              {/* Scrollable content - Hauteur calculée: 500px - padding(24px) - tabs(32px) - header(30px) - spacing(12px) = ~402px */}
              <div className="h-[440px] overflow-y-auto pr-1 scrollbar-thin">
                
                {/* Asks (Sell orders) - 7 ordres */}
                <div className="space-y-1 mb-3">
                  {displayAsks.slice(0, 7).reverse().map((ask, index) => {
                    const cumulativeTotal = asksCumulativeMap.get(ask.px) || 0;
                    const maxCumulative = Math.max(...Array.from(asksCumulativeMap.values()));
                    const depthPercentage = maxCumulative > 0 ? (cumulativeTotal / maxCumulative) * 100 : 0;
                    
                    return (
                      <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-xs hover:bg-[#83E9FF10] py-1 rounded relative">
                        <div 
                          className="absolute inset-0 bg-red-500/25 rounded"
                          style={{ 
                            width: `${Math.min(depthPercentage * 1.5, 100)}%`,
                            right: 0
                          }}
                        />
                        <span className="text-[#F87171] relative z-10">${formatPrice(ask.px)}</span>
                        <span className="text-white text-right relative z-10">{formatSize(ask.sz)}</span>
                        <span className="text-gray-400 text-right relative z-10">{formatSize(cumulativeTotal)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Spread */}
                <div className="border-y border-[#83E9FF33] py-0.5 text-center mb-2 mx-1 h-6 flex items-center justify-center gap-5">
                  <span className="text-xs text-gray-400">Spread</span>
                  <span className="text-xs text-white">
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
                      <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-xs hover:bg-[#83E9FF10] py-1 rounded relative">
                        <div 
                          className="absolute inset-0 bg-green-500/25 rounded"
                          style={{ 
                            width: `${Math.min(depthPercentage * 1.7, 100)}%`,
                            left: 0
                          }}
                        />
                        <span className="text-[#4ADE80] relative z-10">${formatPrice(bid.px)}</span>
                        <span className="text-white text-right relative z-10">{formatSize(bid.sz)}</span>
                        <span className="text-gray-400 text-right relative z-10">{formatSize(cumulativeTotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trades" className="mt-2">
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 border-b border-[#83E9FF33] pb-2">
                <span>Price</span>
                <span className="text-right">Size (token)</span>
                <span className="text-right">Time</span>
              </div>

              {/* Trades - Scrollable - Même hauteur que orderbook */}
              <div className="h-[402px] overflow-y-auto pr-1 scrollbar-thin">
                <div className="space-y-1">
                {displayTrades.map((trade, index) => {
                  // Handle real trades from WebSocket
                  const tradeType = trade.side === 'B' ? 'Buy' : 'Sell';
                  const tradePrice = parseFloat(trade.px);
                  const tradeSize = parseFloat(trade.sz);
                  const tradeTime = new Date(trade.time).toLocaleTimeString();
                  
                  return (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs hover:bg-[#83E9FF10] py-1 rounded px-1">
                      <span className={cn(
                        "font-medium",
                        tradeType === 'Buy' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                      )}>
                        ${formatPrice(tradePrice)}
                      </span>
                      <span className="text-white text-right">{formatSize(tradeSize)}</span>
                      <span className="text-gray-400 text-right text-xs">{tradeTime}</span>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </TabsContent>


        </Tabs>
      </div>
    </Card>
  );
}
