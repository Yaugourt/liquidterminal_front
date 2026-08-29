"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/common";
import { EvmOverview } from "@/components/evm/EvmOverview";
import { usePageTitle } from "@/store/use-page-title";

/**
 * HyperEVM explorer overview — the general-purpose execution layer secured by
 * the same HyperBFT consensus as HyperCore. Wired to the indexer's EVM
 * endpoints: lifetime chain stats, daily activity, and recent blocks.
 */
export default function HyperEvmPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => {
    setTitle("HyperEVM");
  }, [setTitle]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="HyperEVM"
        titleQualifier="· the EVM layer"
        description="Blocks, transactions and gas on HyperEVM — the general-purpose execution layer secured by the same HyperBFT consensus as HyperCore."
      />
      <EvmOverview />
    </div>
  );
}
