import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { OverviewCardProps } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES } from "./constants";

export const OverviewCard = memo(({ balances, isLoading, formatCurrency }: OverviewCardProps) => {
    return (
        <Card className={CARD_BASE_CLASSES}>
            <div className="flex justify-between items-start mb-5">
                <h3 className="text-white text-[16px] font-serif">Overview</h3>
                <span className="text-[#83E9FF] text-[16px] font-medium">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
                    ) : (
                        formatCurrency(balances.totalBalance)
                    )}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                    <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Spot:</div>
                    <div className="text-white text-sm font-medium">
                        {isLoading ? (
                            <span className="text-[#83E9FF60]">Loading...</span>
                        ) : (
                            formatCurrency(balances.spotBalance)
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Vault:</div>
                    <div className="text-white text-sm font-medium">
                        {isLoading ? (
                            <span className="text-[#83E9FF60]">Loading...</span>
                        ) : (
                            formatCurrency(balances.vaultBalance)
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Perps:</div>
                    <div className="text-white text-sm font-medium">
                        {isLoading ? (
                            <span className="text-[#83E9FF60]">Loading...</span>
                        ) : (
                            formatCurrency(balances.perpBalance)
                        )}
                    </div>
                </div>
                <div>
                    <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide">Staked:</div>
                    <div className="text-white text-sm font-medium">
                        {isLoading ? (
                            <span className="text-[#83E9FF60]">Loading...</span>
                        ) : (
                            formatCurrency(balances.stakedBalance)
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
});