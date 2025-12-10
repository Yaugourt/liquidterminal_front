import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { TrendingTokensProps, SortableFields, SortOrder, StatItemProps, TokensHeaderProps } from "@/components/types/dashboard.types";
import { PerpSortableFields } from "@/services/market/perp/types";
import { memo, useCallback, useMemo, useState } from "react";
import { TokensTable } from "./TokensTable";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";

const StatItem = memo(({ label, value }: StatItemProps) => (
    <div className="flex items-center gap-2">
        <span className="text-[11px] text-white">{label}:</span>
        <span className="text-sm text-white">
            {formatLargeNumber(value || 0, { prefix: '$', decimals: 1, forceDecimals: true })}
        </span>
    </div>
));
StatItem.displayName = 'StatItem';

const TokensHeader = memo(({ type, totalVolume, dailyFees, openInterest }: TokensHeaderProps) => {
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

export const TrendingTokens = memo(({ type, title }: TrendingTokensProps) => {
    const defaultSort = "change24h" as SortableFields;
    const [sortBy, setSortBy] = useState<SortableFields>(defaultSort);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const {
        data: spotTokens,
        isLoading: isLoadingSpot,
        totalVolume: spotTotalVolume
    } = useTrendingSpotTokens(5, sortBy, sortOrder);

    const {
        data: perpTokens,
        isLoading: isLoadingPerp,
        updateParams: updatePerpParams,
        totalVolume: perpTotalVolume
    } = useTrendingPerpMarkets();

    const { feesStats } = useFeesStats();
    const { stats: perpStats } = usePerpGlobalStats();

    const handleSort = useCallback((field: string) => {
        const newOrder: SortOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
        setSortBy(field as SortableFields);
        setSortOrder(newOrder);

        if (type === "perp") {
            updatePerpParams({
                sortBy: field as PerpSortableFields,
                sortOrder: newOrder
            });
        }
    }, [sortBy, sortOrder, type, updatePerpParams]);

    const headerProps = useMemo(() => ({
        type,
        title,
        totalVolume: type === "spot" ? spotTotalVolume : perpTotalVolume,
        dailyFees: feesStats?.dailySpotFees,
        openInterest: perpStats?.totalOpenInterest
    }), [type, title, spotTotalVolume, perpTotalVolume, feesStats?.dailySpotFees, perpStats?.totalOpenInterest]);

    const tableProps = useMemo(() => ({
        type,
        data: type === "spot" ? spotTokens : perpTokens,
        isLoading: type === "spot" ? isLoadingSpot : isLoadingPerp,
        onSort: handleSort,
        activeSort: sortBy
    }), [type, spotTokens, perpTokens, isLoadingSpot, isLoadingPerp, handleSort, sortBy]);

    return (
        <div className="w-full h-full flex flex-col">
            <TokensHeader {...headerProps} />
            <div className="flex-1 flex flex-col">
                <TokensTable {...tableProps} />
            </div>
        </div>
    );
});

TrendingTokens.displayName = 'TrendingTokens'; 