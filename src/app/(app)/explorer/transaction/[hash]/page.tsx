"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTransactionDetails } from "@/services/explorer";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/common";
import { TransactionFormatter, TransactionView } from "@/components/explorer/transaction";
import type { ExtendedTransactionDetails } from "@/services/explorer/types";

export default function TransactionPage() {
  const params = useParams();
  const txHash = params.hash as string;
  const { transactionDetails, isLoading, error } = useTransactionDetails(txHash);

  const back = (
    <Link href="/explorer" className="inline-flex items-center gap-1.5 text-[12.5px] text-brand hover:text-text-primary">
      <ArrowLeft size={14} /> Explorer
    </Link>
  );

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
    return <EmptyState title="Transaction not found" description="The transaction hash may be invalid or not yet indexed." />;
  }

  const tx = transactionDetails as ExtendedTransactionDetails;
  return (
    <>
      <PageHeader title="Transaction" breadcrumb={back} />
      <TransactionView tx={tx} formatted={TransactionFormatter.formatTransaction(tx)} />
    </>
  );
}
