import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Wallet, Vault, TrendingUp, DollarSign, Coins } from "lucide-react";
import { OverviewCardProps } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES } from "./constants";

export const OverviewCard = memo(({ balances, isLoading, formatCurrency }: OverviewCardProps) => {
    // Fonction pour obtenir l'icône selon le type
    const getIcon = (type: string) => {
        switch (type) {
            case "spot":
                return <Coins size={16} className="text-[#f9e370]" />;
            case "vault":
                return <Vault size={16} className="text-[#f9e370]" />;
            case "perps":
                return <TrendingUp size={16} className="text-[#f9e370]" />;
            case "staked":
                return <DollarSign size={16} className="text-[#f9e370]" />;
            default:
                return <Wallet size={16} className="text-[#f9e370]" />;
        }
    };

    const balanceItems = [
        { type: "spot", label: "Spot", value: balances.spotBalance },
        { type: "vault", label: "Vault", value: balances.vaultBalance },
        { type: "perps", label: "Perps", value: balances.perpBalance },
        { type: "staked", label: "Staked", value: balances.stakedBalance }
    ];

    return (
        <Card className={CARD_BASE_CLASSES}>
            {/* Header avec total balance rapproché */}
            <div className="flex justify-between items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 ml-4">
                    <Wallet size={16} className="text-[#f9e370]" />
                    <h3 className="text-[11px] text-[#FFFFFF] font-medium tracking-wide font-inter">OVERVIEW</h3>
                </div>
                <span className="text-[16px] text-white font-medium font-inter mr-4">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
                    ) : (
                        formatCurrency(balances.totalBalance)
                    )}
                </span>
            </div>

            {/* Balance breakdown en grille 2x2 */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 ml-4">
                {balanceItems.map((item) => (
                    <div key={item.type}>
                        <div className="text-xs text-white mb-1 tracking-wide font-medium font-inter">
                            {item.label}
                        </div>
                        <div className="text-sm text-white font-medium font-inter">
                            {isLoading ? (
                                <span className="text-[#83E9FF60]">Loading...</span>
                            ) : (
                                formatCurrency(item.value)
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
});