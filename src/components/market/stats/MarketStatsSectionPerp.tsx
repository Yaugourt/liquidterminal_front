import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumberWithoutDecimals } from "./utils";
import { PerpToken } from "@/api/markets/types";
import { formatNumber } from "@/lib/format";

interface MarketStatsSectionPerpProps {
    totalMarketCap: number;
    totalVolume: number;
    totalPerpVolume: number;
    trendingTokens: PerpToken[];
    totalTokenCount: number;
}

export function MarketStatsSectionPerp({
    totalMarketCap,
    totalVolume,
    totalPerpVolume,
    trendingTokens,
    totalTokenCount,
}: MarketStatsSectionPerpProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 md:my-8">
            <MarketStatsCard title="Market Cap">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                        <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total marketcap:</p>
                        <p className="text-white text-sm sm:text-base">${formatNumberWithoutDecimals(totalMarketCap)}</p>
                    </div>
                    <div>
                        <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h perp volume:</p>
                        <p className="text-white text-sm sm:text-base">${formatNumberWithoutDecimals(totalPerpVolume)}</p>
                    </div>
                    <div>
                        <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total perp token:</p>
                        <p className="text-white text-sm sm:text-base">{formatNumber(totalTokenCount)}</p>
                    </div>
                    <div>
                        <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h spot volume:</p>
                        <p className="text-white text-sm sm:text-base">$0</p>
                    </div>
                </div>
            </MarketStatsCard>

            <MarketStatsCard title="Top Volume Tokens">
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
        </div>
    );
} 