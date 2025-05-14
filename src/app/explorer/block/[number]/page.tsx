"use client"

import { useRouter } from "next/navigation"
import { useBlockDetails } from "@/services/explorer/hooks/useBlockDetails"
import { Header } from "@/components/Header"
import { use, useCallback } from "react"
import { BlockHeader } from "@/components/explorer/block/BlockHeader"
import { TransactionList } from "@/components/explorer/block/TransactionList"
import { LoadingState, ErrorState } from "@/components/explorer/LoadingErrorStates"

interface BlockDetailsProps {
    params: Promise<{
        number: string
    }>
}

export default function BlockDetails({ params }: BlockDetailsProps) {
    const router = useRouter()
    const { number } = use(params)
    const { blockDetails, isLoading, error } = useBlockDetails(number);

    // Gérer la navigation vers la page de transaction
    const handleTransactionClick = useCallback((hash: string) => {
        router.push(`/explorer/transaction/${hash}`);
    }, [router]);

    // Gérer la navigation vers la page d'adresse
    const handleAddressClick = useCallback((address: string) => {
        router.push(`/explorer/address/${address}`);
    }, [router]);

    if (isLoading) {
        return <LoadingState message="Loading block details..." />;
    }

    if (error || !blockDetails) {
        return <ErrorState message={error?.message || 'Failed to load block details'} />;
    }

    return (
        <div className="min-h-screen">
            <Header customTitle="Explorer" showFees={true} />
            <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
                {/* Block Header */}
                <BlockHeader 
                    blockDetails={blockDetails} 
                    onAddressClick={handleAddressClick} 
                />

                {/* Transactions List */}
                <TransactionList 
                    transactions={blockDetails.txs} 
                    onTransactionClick={handleTransactionClick}
                    onAddressClick={handleAddressClick}
                />
            </div>
        </div>
    );
} 