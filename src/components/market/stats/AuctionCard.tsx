import { MarketStatsCard } from "../MarketStatsCard";
import { AuctionHistory } from "@/api/markets/types";

interface AuctionCardProps {
    currentPrice: number | null;
    displayPrice: string;
    progress: number;
    isActive: boolean;
    isUpcoming: boolean;
    timeUntilStart: string;
    lastAuction: AuctionHistory | null;
    loading: boolean;
    isPurchased: boolean;
    nextAuctionPrice: string;
}

export function AuctionCard({
    currentPrice,
    displayPrice,
    progress,
    isActive,
    isUpcoming,
    timeUntilStart,
    lastAuction,
    loading,
    isPurchased,
    nextAuctionPrice,
}: AuctionCardProps) {
    return (
        <MarketStatsCard title="Auction" className="md:col-span-2 lg:col-span-1">
            <div className="space-y-2 sm:space-y-3">
                {loading ? (
                    <p className="text-white text-sm">Loading auction data...</p>
                ) : (
                    <>
                        <div>
                            {isPurchased ? (
                                <>
                                    <p className="text-[#FFFFFF99] text-xs sm:text-sm">Purchased</p>
                                    <p className="text-[#83E9FF] text-sm sm:text-base mb-2">
                                        Next auction price: ${nextAuctionPrice}
                                    </p>
                                    <div className="mt-2">
                                        <p className="text-[#83E9FF] text-xs sm:text-sm">
                                            Next auction in: {timeUntilStart}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[#FFFFFF99] text-xs sm:text-sm">Current price:</p>
                                    <p className="text-white text-sm sm:text-base font-mono">
                                        {currentPrice ? `$${displayPrice}` : "No active auction"}
                                    </p>

                                    {isActive && (
                                        <div className="mt-2">
                                            <div className="w-full bg-[#051728] h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-[#83E9FF] h-full transition-all duration-100 ease-linear"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {isUpcoming && (
                                        <div className="mt-2">
                                            <p className="text-[#83E9FF] text-xs sm:text-sm">
                                                Starts in: {timeUntilStart}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div>
                            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Last auctions:</p>
                            <p className="text-white text-sm sm:text-base">
                                {lastAuction
                                    ? `${lastAuction.name} for ${parseFloat(lastAuction.deployGas).toFixed(2)}$`
                                    : "No recent auctions"}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </MarketStatsCard>
    );
} 