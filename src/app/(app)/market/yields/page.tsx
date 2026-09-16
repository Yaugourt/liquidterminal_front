"use client";

import { YieldsListHeader, YieldsKpiStrip, YieldsDirectoryTable } from "@/components/market/yields";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { PageFaq } from "@/components/common";
import { YIELDS_FAQ } from "@/lib/page-faqs";
import { useYieldsDirectory } from "@/services/market/yields";

/**
 * /market/yields — HyperEVM yield directory on the Vaults page-type:
 * PageHeader → SectionHead'd sections → KpiRibbon + TypedDataTable. Filters,
 * sort and pagination are server-side (Hyperfolio via the backend proxy).
 */
export default function YieldsPage() {
  const directory = useYieldsDirectory();

  return (
    <div className="space-y-8">
      <YieldsListHeader directory={directory} />

      <section className="space-y-2.5">
        <SectionHead title="Overview" subtitle="opportunities, depth & TVL-weighted APY for the current filters" />
        <YieldsKpiStrip directory={directory} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="All yields"
          subtitle="Lending, LP, vaults & staking · APY with base + rewards split, 7d/30d history where reported"
        />
        <YieldsDirectoryTable directory={directory} />
      </section>

      <PageFaq items={YIELDS_FAQ} />
    </div>
  );
}
