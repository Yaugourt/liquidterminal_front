"use client";

import { PulseBar } from "@/components/dashboard/PulseBar";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { VaultsModule } from "@/components/dashboard/modules/VaultsModule";
import { ProtocolsModule } from "@/components/dashboard/modules/ProtocolsModule";
import { PopularArticlesModule } from "@/components/dashboard/ecosystem/PopularArticlesModule";
import { SectionHead } from "@/components/dashboard/SectionHead";

/**
 * Dashboard · Overview — the short scope.
 *
 * Network ribbon plus one signal per sibling scope. It routes, it does not
 * duplicate: the depth lives in Market, Capital and Ecosystem, each of which
 * only mounts its own hooks.
 */
export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Network Pulse */}
      <section className="space-y-2.5">
        <SectionHead
          title="Network Pulse"
          subtitle="Real-time ecosystem metrics"
        />
        <PulseBar />
      </section>

      {/* One module per scope, each linking to its own page */}
      <section className="space-y-2.5">
        <SectionHead
          title="Across the terminal"
          subtitle="One signal per scope"
        />
        {/* Two columns, not three: the leaderboard modules carry four columns
            and clip below ~570px of card width. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoversCard market="perp" />
          <VaultsModule />
          <ProtocolsModule />
          <PopularArticlesModule />
        </div>
      </section>
    </div>
  );
}
