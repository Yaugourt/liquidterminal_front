import { memo } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { StatItemProps, TokensHeaderProps } from "@/components/types/dashboard.types";

// Composant pour les statistiques
const StatItem = memo(({ label, value }: StatItemProps) => (
    <div className="flex items-center gap-2">
        <span className="text-[11px] text-white">{label}:</span>
        <span className="text-sm text-white">
            {formatLargeNumber(value || 0, { prefix: '$', decimals: 1, forceDecimals: true })}
        </span>
    </div>
));

StatItem.displayName = 'StatItem';

export const TokensHeader = memo(({ type, totalVolume, dailyFees, openInterest }: TokensHeaderProps) => {
    const secondaryMetric = type === "spot" 
        ? { label: "Daily Fees", value: dailyFees || 0 }
        : { label: "Open Interest", value: openInterest || 0 };

    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 max-[480px]:hidden">
                <StatItem label="Volume" value={totalVolume} />
                <StatItem label={secondaryMetric.label} value={secondaryMetric.value} />
            </div>

            <Link
                href={type === "spot" ? "/market/spot" : "/market/perp"}
                className="flex items-center gap-1 px-3 py-1 text-sm text-brand-gold hover:text-white transition-colors"
            >
                See All
                <ExternalLink size={14} />
            </Link>
        </div>
    );
});

TokensHeader.displayName = 'TokensHeader'; 