import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { TrendingTokensProps, SortableFields, SortOrder } from "@/components/types/dashboard.types";
import { PerpSortableFields } from "@/services/market/perp/types";
import { memo, useCallback, useMemo, useState } from "react";
import { TokensHeader } from "./TokensHeader";
import { TokensTable } from "./TokensTable";

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
        <div className="w-full">
            <TokensHeader {...headerProps} />   
            <TokensTable {...tableProps} />
        </div>
    );
});

TrendingTokens.displayName = 'TrendingTokens'; 