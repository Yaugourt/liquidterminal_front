"use client"

import { useTransactionDetails } from '@/services/explorer';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Copy, Check } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { useState } from 'react';
import {
  TransactionHeader,
  TransactionDetails,
  TransactionFormatter
} from '@/components/explorer/transaction';
import { ExtendedTransactionDetails } from '@/services/explorer/types';

export default function TransactionPage() {
  const params = useParams();
  const txHash = params.hash as string;
  const { transactionDetails, isLoading, error } = useTransactionDetails(txHash);
  const router = useRouter();
  const [copiedHash, setCopiedHash] = useState(false);

  const copyHashToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      // Error handled silently
    }
  };

  const truncateHash = (hash: string) => {
    if (hash.length > 20) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
    }
    return hash;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingState message="Loading transaction details..." size="md" withCard={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <span className="text-text-primary font-inter">Error loading transaction</span>
          <span className="text-text-tertiary text-sm font-inter">{error.message}</span>
        </div>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-text-tertiary" />
          <span className="text-text-primary font-inter">Transaction not found</span>
          <span className="text-text-tertiary text-sm font-inter">The transaction hash may be invalid or not yet indexed</span>
        </div>
      </div>
    );
  }

  // Formater les détails de la transaction
  const formattedData = TransactionFormatter.formatTransaction(transactionDetails as ExtendedTransactionDetails);

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.push('/explorer')}
        className="flex items-center gap-2 text-brand hover:text-brand/80 transition-colors font-inter"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Page Title */}
      <h1 className="text-2xl text-text-primary font-medium font-inter">Transaction Details</h1>

      {/* Hash */}
      <div className="flex items-center gap-3 bg-surface/90 border border-brand/30 rounded-lg p-4">
        <span className="text-text-tertiary text-sm font-inter">Hash:</span>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-brand font-inter break-all">
            <span className="md:hidden">{truncateHash(txHash)}</span>
            <span className="hidden md:inline">{txHash}</span>
          </span>
          <button
            onClick={copyHashToClipboard}
            className="p-1 hover:bg-surface-2 rounded transition-colors flex-shrink-0"
          >
            {copiedHash ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-gold opacity-60 hover:opacity-100" />
            )}
          </button>
        </div>
      </div>

      {/* Transaction Header */}
      <TransactionHeader transaction={transactionDetails as ExtendedTransactionDetails} />

      {/* Transaction Details */}
      <TransactionDetails data={formattedData} />
    </>
  );
}