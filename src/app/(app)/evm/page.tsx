"use client";

import { useEffect } from "react";
import { Cpu } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Hypurr } from "@/components/hypurr/Hypurr";
import { usePageTitle } from "@/store/use-page-title";

/**
 * HyperEVM explorer — the other half of the chain.
 *
 * Placeholder on purpose. The navigation now carries a HyperEVM entry (the doc
 * treats HyperCore and HyperEVM as one chain, two execution layers), but the
 * page itself is not wired yet. The data source is decided: HypurrTrace
 * (`trace.hypurrscan.io/api/v1`), a keyless HyperEVM indexer, feeds blocks,
 * transactions, contracts, ERC-20s and the CoreWriter call stream. No numbers
 * are shown here rather than faked ones (DS rule: no data → no metric).
 */
export default function HyperEvmPage() {
  const { setTitle } = usePageTitle();
  useEffect(() => {
    setTitle("HyperEVM");
  }, [setTitle]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="HyperEVM"
        titleQualifier="· the EVM layer"
        description="Blocks, transactions, contracts and ERC-20s on HyperEVM — the general-purpose execution layer secured by the same HyperBFT consensus as HyperCore."
      />

      <Card className="px-6 py-12 grid place-items-center">
        <div className="flex flex-col items-center text-center gap-4 max-w-md">
          <Hypurr mood="theories" height={72} />
          <div className="flex items-center gap-2 text-text-primary">
            <Cpu className="w-4 h-4 text-brand" />
            <span className="text-[15px] font-semibold">Explorer on the way</span>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            This is where the HyperEVM side lands: dual-block activity, contract
            calls, ERC-20 transfers, and the contracts that read or write
            HyperCore through CoreWriter. Wired to a keyless indexer, coming next.
          </p>
        </div>
      </Card>
    </div>
  );
}
