"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { YieldsListHeader, YieldsKpiStrip, YieldsDirectoryTable } from "@/components/market/yields";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { PageFaq } from "@/components/common";
import { YIELDS_FAQ } from "@/lib/page-faqs";
import { useYieldsDirectory, type YieldCategory, type YieldsQuery } from "@/services/market/yields";

const CATEGORIES: YieldCategory[] = ["lending", "amm", "yield", "staking", "derivatives"];

/**
 * /market/yields — HyperEVM yield directory on the Vaults page-type:
 * PageHeader → SectionHead'd sections → KpiRibbon + TypedDataTable. Filters,
 * sort and pagination are server-side (Hyperfolio via the backend proxy).
 */
function YieldsPageContent() {
  // Deep links from project pages: /market/yields?protocol=hyperlend&category=lending
  const params = useSearchParams();
  const protocol = params.get("protocol") || undefined;
  const category = params.get("category") as YieldCategory | null;
  const initial: Partial<YieldsQuery> = {
    // Lending markets report no TVL upstream: a protocol's page lists all of
    // its pools, so its link must not apply the TVL floor.
    ...(protocol ? { protocol, minTvl: undefined } : {}),
    ...(category && CATEGORIES.includes(category) ? { category } : {}),
  };
  // A client navigation that only changes the query keeps this page mounted:
  // the key restarts the directory from the new link's filters.
  return <YieldsDirectoryView key={`${initial.protocol ?? ""}|${initial.category ?? ""}`} initial={initial} />;
}

function YieldsDirectoryView({ initial }: { initial: Partial<YieldsQuery> }) {
  const directory = useYieldsDirectory(initial);

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

export default function YieldsPage() {
  // useSearchParams needs a Suspense boundary for the static shell.
  return (
    <Suspense fallback={null}>
      <YieldsPageContent />
    </Suspense>
  );
}
