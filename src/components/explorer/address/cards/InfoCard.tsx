import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InfoCardProps } from "@/components/types/explorer.types";
import { CARD_BASE_CLASSES } from "./constants";
import { FormattedUserTransaction } from "@/services/explorer/address/types";

interface InfoCardPropsWithTransactions extends InfoCardProps {
    transactions?: FormattedUserTransaction[] | null;
    isLoadingTransactions?: boolean;
}

const InfoCardComponent = ({ onAddClick, transactions, isLoadingTransactions }: InfoCardPropsWithTransactions) => {
    const formatTransactionDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTransactionDates = () => {
        if (isLoadingTransactions) {
            return { latest: "Loading...", first: "Loading..." };
        }
        
        if (!transactions || transactions.length === 0) {
            return { latest: "No transactions", first: "No transactions" };
        }

        // Les transactions sont déjà triées par date décroissante (b.time - a.time)
        const latest = transactions[0]; // Première = plus récente
        const first = transactions[transactions.length - 1]; // Dernière = plus ancienne

        return {
            latest: formatTransactionDate(latest.time),
            first: formatTransactionDate(first.time)
        };
    };

    const { latest, first } = getTransactionDates();

    return (
        <Card className={CARD_BASE_CLASSES}>
            <h3 className="text-white text-[16px] font-inter mb-5">More Info</h3>
            <div className="space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white text-sm">Private name tags</span>
                        <Button 
                            variant="outline"
                            size="sm"
                            className="bg-[#F3DC4D] text-black px-2 py-1 h-7 rounded-md text-xs font-medium hover:bg-opacity-90 transition-colors border-none"
                            onClick={onAddClick}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                    </div>
                </div>
                <div>
                    <div className="text-white text-sm mb-3">Transactions sent</div>
                    <div className="flex gap-5">
                        <div>
                            <span className="text-[#FFFFFF80] text-xs">Latest:</span>
                            <span className="text-[#83E9FF] ml-1.5 text-xs">{latest}</span>
                        </div>
                        <div>
                            <span className="text-[#FFFFFF80] text-xs">First:</span>
                            <span className="text-[#83E9FF] ml-1.5 text-xs">{first}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const InfoCard = memo(InfoCardComponent);
InfoCard.displayName = 'InfoCard';