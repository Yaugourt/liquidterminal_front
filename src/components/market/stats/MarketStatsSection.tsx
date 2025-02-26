import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumber } from "@/lib/format";

interface MarketStatsSectionProps {
  totalMarketCap: number;
  totalVolume: number;
  totalSpotVolume: number;
  trendingTokens: any[];
}

export function MarketStatsSection({
  totalMarketCap,
  totalVolume,
  totalSpotVolume,
  trendingTokens,
}: MarketStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <MarketStatsCard title="Market Cap">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[#FFFFFF99] text-sm">Total volume:</p>
            <p className="text-white">${formatNumber(totalVolume)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm">24h spot volume:</p>
            <p className="text-white">${formatNumber(totalSpotVolume)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm">Total spot token:</p>
            <p className="text-white">${formatNumber(3)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm">24h perp volume:</p>
            <p className="text-white">$0.00</p>
          </div>
        </div>
      </MarketStatsCard>

      <MarketStatsCard title="Trending Tokens">
        <div className="space-y-3">
          {trendingTokens.map((token) => (
            <div key={token.name} className="flex justify-between items-center">
              <span className="text-white">{token.name}</span>
              <div className="flex gap-4">
                <span className="text-white">${formatNumber(token.price)}</span>
                <span
                  className={
                    token.change24h >= 0 ? "text-[#26A69A]" : "text-red-500"
                  }
                >
                  {token.change24h >= 0 ? "+" : ""}
                  {formatNumber(token.change24h)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </MarketStatsCard>

      <MarketStatsCard title="Auction">
        <div className="space-y-3">
          <div>
            <p className="text-[#FFFFFF99] text-sm">Current price:</p>
            <p className="text-white">351,343.24$</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-sm">Last auctions:</p>
            <p className="text-white">NEURAL for 205,149.38$</p>
          </div>
        </div>
      </MarketStatsCard>
    </div>
  );
}
