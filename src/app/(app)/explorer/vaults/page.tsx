"use client";

import {
  VaultsKpiStrip,
  VaultsEcosystemShape,
  VaultsDirectoryTable,
  VaultsListHeader,
  VaultsLeaderboards,
} from "@/components/explorer/vault";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { PageFaq } from "@/components/common";
import { VAULTS_FAQ } from "@/lib/page-faqs";
import { useVaultsDirectory } from "@/services/explorer/vault/hooks/useVaultsDirectory";

/**
 * /explorer/vaults — composed on the main-dashboard page-type: PageHeader →
 * SectionHead'd sections → primitive cards. Minimal DS treatment throughout
 * (plain KpiRibbon, text tabs, neutral avatars). Leaderboards live in a 3-col
 * section (like the dashboard's "Capital Allocators"), not a sticky rail.
 */
export default function VaultsPage() {
  const directory = useVaultsDirectory();

  return (
    <div className="space-y-8">
      <VaultsListHeader directory={directory} />

      <section className="space-y-2.5">
        <SectionHead title="Overview" subtitle="TVL, APR & followers across tracked vaults" />
        <VaultsKpiStrip directory={directory} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Ecosystem shape"
          subtitle="growth · capital distribution · return spread — current snapshot"
        />
        <VaultsEcosystemShape directory={directory} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="All vaults"
          subtitle="Directory + leaderboards · current APR, 24h follower growth & outflows"
        />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
          <VaultsDirectoryTable directory={directory} />
          <VaultsLeaderboards directory={directory} />
        </div>
      </section>
      <PageFaq items={VAULTS_FAQ} />
    </div>
  );
}
