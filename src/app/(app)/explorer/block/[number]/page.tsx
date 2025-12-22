"use client"

import { useRouter } from "next/navigation"
import { useBlockDetails } from "@/services/explorer"
import { use, useCallback } from "react"
import { BlockHeader, BlockTransactionList as TransactionList } from "@/components/explorer"
import { Loader2, AlertCircle } from "lucide-react"

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
        return (
            <div className="flex justify-center items-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
                    <p className="text-white text-lg">Loading block details...</p>
                </div>
            </div>
        );
    }

    if (error || !blockDetails) {
        return (
            <div className="flex justify-center items-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="text-red-500 text-lg">{error?.message || 'Failed to load block details'}</p>
                </div>
            </div>
        );
    }

    return (
        <>
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
        </>
    );
}