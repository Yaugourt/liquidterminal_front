import { memo, useCallback, useMemo } from "react";
import { useAddressBalance } from "@/services/explorer/address";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatting';
import { OverviewCard } from "./OverviewCard";
import { PnLCard } from "./PnLCard";
import { InfoCard } from "./InfoCard";
import { AddressCardsProps } from "@/components/types/explorer.types";

const GRID_CLASSES = "grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6";

export const AddressCards = memo(({ 
    portfolio, 
    loadingPortfolio, 
    onAddClick, 
    address 
}: AddressCardsProps) => {
    const { balances, isLoading: loadingBalances } = useAddressBalance(address);
    const { format } = useNumberFormat();

    // Mémoisation de la fonction de formatage
    const formatCurrency = useCallback((value: number) => {
        if (isNaN(value) || value === 0) return "$0.00";
        return formatNumber(value, format, {
            currency: '$',
            showCurrency: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, [format]);

    // Mémoisation des props des composants enfants
    const overviewProps = useMemo(() => ({
        balances,
        isLoading: loadingBalances,
        formatCurrency
    }), [balances, loadingBalances, formatCurrency]);

    const pnlProps = useMemo(() => ({
        portfolio,
        isLoading: loadingPortfolio,
        format
    }), [portfolio, loadingPortfolio, format]);

    return (
        <div className={GRID_CLASSES}>
            <OverviewCard {...overviewProps} />
            <PnLCard {...pnlProps} />
            <InfoCard onAddClick={onAddClick} />
        </div>
    );
}); 