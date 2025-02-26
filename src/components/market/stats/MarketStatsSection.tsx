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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 md:my-8">
      <MarketStatsCard title="Market Cap">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total volume:</p>
            <p className="text-white text-sm sm:text-base">${formatNumber(totalVolume)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h spot volume:</p>
            <p className="text-white text-sm sm:text-base">${formatNumber(totalSpotVolume)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total spot token:</p>
            <p className="text-white text-sm sm:text-base">${formatNumber(3)}</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h perp volume:</p>
            <p className="text-white text-sm sm:text-base">$0.00</p>
          </div>
        </div>
      </MarketStatsCard>

      <MarketStatsCard title="Trending Tokens">
        <div className="space-y-2 sm:space-y-3">
          {trendingTokens.map((token) => (
            <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
              <span className="text-white col-span-5 truncate text-xs sm:text-sm">{token.name}</span>
              <span className="text-white col-span-4 text-right text-xs sm:text-sm">${formatNumber(token.price)}</span>
              <span
                className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? "text-[#37983F]" : "text-red-500"
                  }`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {formatNumber(token.change24h)}%
              </span>
            </div>
          ))}
        </div>
      </MarketStatsCard>

      <MarketStatsCard title="Auction" className="md:col-span-2 lg:col-span-1">
        <div className="space-y-2 sm:space-y-3">
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Current price:</p>
            <p className="text-white text-sm sm:text-base">351,343.24$</p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Last auctions:</p>
            <p className="text-white text-sm sm:text-base">NEURAL for 205,149.38$</p>
          </div>
        </div>
      </MarketStatsCard>
    </div>
  );
}
