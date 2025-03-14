import { MarketStatsCard } from "../MarketStatsCard";
import { AuctionHistory } from "@/services/markets/types";
import { Clock, DollarSign } from "lucide-react";
import { memo } from "react";

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
    nextAuctionTime: string;
}

// Composant pour afficher les informations de la prochaine enchère
const NextAuctionInfo = ({ timeUntilStart, nextAuctionPrice }: { timeUntilStart: string; nextAuctionPrice: string }) => (
    <>
        <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#83E9FF]" />
            <span className="text-[#83E9FF] text-sm">
                Next auction starts in {timeUntilStart}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#83E9FF]" />
            <span className="text-white text-sm sm:text-base font-mono">
                Starting price: ${nextAuctionPrice}
            </span>
        </div>
    </>
);

// Composant pour afficher les informations de l'enchère en cours
const CurrentAuctionInfo = ({ 
    currentPrice, 
    displayPrice, 
    isActive, 
    isUpcoming, 
    progress, 
    timeUntilStart 
}: Pick<AuctionCardProps, 'currentPrice' | 'displayPrice' | 'isActive' | 'isUpcoming' | 'progress' | 'timeUntilStart'>) => (
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
);

// Composant pour afficher les informations des dernières enchères
const LastAuctionInfo = ({ lastAuction }: { lastAuction: AuctionHistory | null }) => (
    <div>
        <p className="text-[#FFFFFF99] text-xs sm:text-sm">Last auctions:</p>
        <p className="text-white text-sm sm:text-base">
            {lastAuction
                ? `${lastAuction.name} for $${parseFloat(lastAuction.deployGas).toFixed(2)}`
                : "No recent auctions"}
        </p>
        {lastAuction && (
            <p className="text-[#FFFFFF99] text-xs">
                by {lastAuction.deployer.substring(0, 6)}...{lastAuction.deployer.substring(lastAuction.deployer.length - 4)}
            </p>
        )}
    </div>
);

export const AuctionCard = memo(function AuctionCard({
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
    const showNextAuction = isPurchased || (!isActive && !isUpcoming);
    
    return (
        <MarketStatsCard title="Auction" className="md:col-span-2 lg:col-span-1">
            <div className="space-y-2 sm:space-y-3">
                {loading ? (
                    <p className="text-white text-sm">Loading auction data...</p>
                ) : (
                    <>
                        <div>
                            {showNextAuction ? (
                                <NextAuctionInfo 
                                    timeUntilStart={timeUntilStart} 
                                    nextAuctionPrice={nextAuctionPrice} 
                                />
                            ) : (
                                <CurrentAuctionInfo 
                                    currentPrice={currentPrice}
                                    displayPrice={displayPrice}
                                    isActive={isActive}
                                    isUpcoming={isUpcoming}
                                    progress={progress}
                                    timeUntilStart={timeUntilStart}
                                />
                            )}
                        </div>

                        <LastAuctionInfo lastAuction={lastAuction} />
                    </>
                )}
            </div>
        </MarketStatsCard>
    );
}); 