"use client";

import { Card } from "@/components/ui/card";
import { decodeAction, useAssetResolver } from "@/services/explorer/address";
import type { UserTransaction } from "@/services/explorer/address/types";
import type { ExtendedTransactionDetails } from "@/services/explorer/types";
import { ActionLabel, ActivityDetails, ActivityValue } from "@/components/explorer/address";

/**
 * The transaction in one line, before the raw fields: what was done, on which
 * market, for how much, with whom. Same decoder as the address activity.
 */
export function TransactionSummary({ transaction }: { transaction: ExtendedTransactionDetails }) {
  const assets = useAssetResolver();
  if (!assets) return null;
  const a = decodeAction(transaction as unknown as UserTransaction, assets);
  return (
    <Card className="px-4 py-3.5">
      <div className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold mb-2">In short</div>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
        <ActionLabel a={a} />
        <div className="flex-1 min-w-[220px]">
          <ActivityDetails a={a} currentAddress={transaction.user} />
        </div>
        <ActivityValue a={a} />
      </div>
    </Card>
  );
}
