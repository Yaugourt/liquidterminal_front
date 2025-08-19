import { memo, useCallback, useMemo } from "react";
import { useAddressBalance } from "@/services/explorer/address";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { OverviewCard } from "./OverviewCard";
import { PnLCard } from "./PnLCard";
import { InfoCard } from "./InfoCard";
import { AddressCardsProps } from "@/components/types/explorer.types";
import { useVaultDeposits } from '@/services/explorer/vault/hooks/useVaultDeposits';
import { FormattedUserTransaction } from "@/services/explorer/address/types";

const GRID_CLASSES = "grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6";

interface AddressCardsPropsWithTransactions extends AddressCardsProps {
    transactions?: FormattedUserTransaction[] | null;
    isLoadingTransactions?: boolean;
}

const AddressCardsComponent = ({ 
    portfolio, 
    loadingPortfolio, 
    onAddClick, 
    address,
    transactions,
    isLoadingTransactions
}: AddressCardsPropsWithTransactions) => {
    const { balances, isLoading: loadingBalances } = useAddressBalance(address);
    const { format } = useNumberFormat();
    const { totalEquity, isLoading: loadingVaultDeposits } = useVaultDeposits(address);

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
        balances: {
            ...balances,
            vaultBalance: totalEquity,
        },
        isLoading: loadingBalances || loadingVaultDeposits,
        formatCurrency
    }), [balances, loadingBalances, loadingVaultDeposits, totalEquity, formatCurrency]);

    const pnlProps = useMemo(() => ({
        portfolio,
        isLoading: loadingPortfolio,
        format
    }), [portfolio, loadingPortfolio, format]);

    const infoProps = useMemo(() => ({
        onAddClick,
        transactions,
        isLoadingTransactions
    }), [onAddClick, transactions, isLoadingTransactions]);

    return (
        <div className={GRID_CLASSES}>
            <OverviewCard {...overviewProps} />
            <PnLCard {...pnlProps} />
            <InfoCard {...infoProps} />
        </div>
    );
};

export const AddressCards = memo(AddressCardsComponent);
AddressCards.displayName = 'AddressCards';