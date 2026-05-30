"use client";

import {
  VaultsKpiStrip,
  VaultsDirectoryTable,
  VaultsListHeader,
  VaultsLeaderboards,
} from "@/components/explorer/vault";
import { SectionHead } from "@/components/dashboard/SectionHead";
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
          title="All vaults"
          subtitle="Directory · sortable · HL TVL/APR joined with indexer follower data"
        />
        <VaultsDirectoryTable directory={directory} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Leaderboards"
          subtitle="by current APR, 24h follower growth & 24h outflows"
        />
        <VaultsLeaderboards directory={directory} />
      </section>
    </div>
  );
}
