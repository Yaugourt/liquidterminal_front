"use client"

import { useTransactionDetails } from '@/services/explorer';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Header } from "@/components/Header";
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
    } catch (err) {
      console.error('Failed to copy hash: ', err);
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
      <div className="min-h-screen">
        <Header customTitle="Explorer" showFees={true} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
            <span className="text-white font-inter">Loading transaction details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header customTitle="Explorer" showFees={true} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="text-white font-inter">Error loading transaction</span>
            <span className="text-[#FFFFFF80] text-sm font-inter">{error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="min-h-screen">
        <Header customTitle="Explorer" showFees={true} />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-8 w-8 text-[#FFFFFF80]" />
            <span className="text-white font-inter">Transaction not found</span>
            <span className="text-[#FFFFFF80] text-sm font-inter">The transaction hash may be invalid or not yet indexed</span>
          </div>
        </div>
      </div>
    );
  }

  // Formater les détails de la transaction
  const formattedData = TransactionFormatter.formatTransaction(transactionDetails as ExtendedTransactionDetails);

  return (
    <div className="min-h-screen">
      <Header customTitle="Explorer" showFees={true} />
      
      <div className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-6 max-w-[1920px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/explorer')}
          className="flex items-center gap-2 text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors font-inter"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Page Title */}
        <h1 className="text-2xl text-white font-medium font-inter">Transaction Details</h1>
        
        {/* Hash */}
        <div className="flex items-center gap-3 bg-[#051728E5] border border-[#83E9FF4D] rounded-lg p-4">
          <span className="text-[#FFFFFF80] text-sm font-inter">Hash:</span>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[#83E9FF] font-inter break-all">
              <span className="md:hidden">{truncateHash(txHash)}</span>
              <span className="hidden md:inline">{txHash}</span>
            </span>
            <button
              onClick={copyHashToClipboard}
              className="p-1 hover:bg-[#FFFFFF0A] rounded transition-colors flex-shrink-0"
            >
              {copiedHash ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-[#f9e370] opacity-60 hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        {/* Transaction Header */}
        <TransactionHeader transaction={transactionDetails as ExtendedTransactionDetails} />

        {/* Transaction Details */}
        <TransactionDetails data={formattedData} />
      </div>
    </div>
  );
} 