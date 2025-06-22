import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatLargeNumber } from "@/lib/formatting";
import { StatItemProps, TokensHeaderProps } from "@/components/types/dashboard.types";

// Composant pour les statistiques
const StatItem = memo(({ label, value }: StatItemProps) => (
    <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#FFFFFF99]">{label}:</span>
        <span className="text-sm text-white">
            {formatLargeNumber(value || 0, { prefix: '$', decimals: 1, forceDecimals: true })}
        </span>
    </div>
));

StatItem.displayName = 'StatItem';

export const TokensHeader = memo(({ type, title, totalVolume, dailyFees, openInterest }: TokensHeaderProps) => {
    const secondaryMetric = type === "spot" 
        ? { label: "Daily Fees", value: dailyFees || 0 }
        : { label: "Open Interest", value: openInterest || 0 };

    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] text-white font-medium">
                {title || (type === "perp" ? "Trending perpetual" : "Trending spot")}
            </h3>

            <div className="flex items-center gap-4 max-[480px]:hidden">
                <StatItem label="Volume" value={totalVolume} />
                <StatItem label={secondaryMetric.label} value={secondaryMetric.value} />
            </div>

            <Link href={type === "spot" ? "/market/spot" : "/market/perp"} passHref>
                <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 bg-[#83E9FF08] hover:bg-[#83E9FF14] transition-colors"
                >
                    <span className="text-[#83E9FF] text-xs">See All</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#83E9FF]" strokeWidth={1.5} />
                </Button>
            </Link>
        </div>
    );
});

TokensHeader.displayName = 'TokensHeader'; 