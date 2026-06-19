"use client"

import { useTransactionDetails } from '@/services/explorer';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";
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
    return <ErrorState title="Error loading transaction" message={error.message} />;
  }

  if (!transactionDetails) {
    return (
      <EmptyState
        title="Transaction not found"
        description="The transaction hash may be invalid or not yet indexed."
      />
    );
  }

  // Formater les détails de la transaction
  const formattedData = TransactionFormatter.formatTransaction(transactionDetails as ExtendedTransactionDetails);

  return (
    <>
      <PageHeader
        title="Transaction Details"
        breadcrumb={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/explorer')}
            className="-ml-2 text-brand hover:text-text-primary hover:bg-surface-2"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back
          </Button>
        }
      />

      {/* Hash */}
      <Card className="flex items-center gap-3 p-4">
        <span className="text-text-tertiary text-sm font-inter">Hash:</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
      </Card>

      {/* Transaction Header */}
      <TransactionHeader transaction={transactionDetails as ExtendedTransactionDetails} />

      {/* Transaction Details */}
      <TransactionDetails data={formattedData} />
    </>
  );
}
