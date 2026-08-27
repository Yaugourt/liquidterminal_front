"use client";

import { FeesRevenuePanel } from "@/components/dashboard/FeesRevenuePanel";
import { StablecoinsCard } from "@/components/dashboard/StablecoinsCard";
import { VaultsModule } from "@/components/dashboard/modules/VaultsModule";
import { ValidatorsModule } from "@/components/dashboard/modules/ValidatorsModule";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  TopTradersPreview,
  ActiveUsersPreview,
  PublicListsPreview,
  TrackedWalletsPreview,
} from "@/components/market/tracker/home";

/**
 * Dashboard · Capital — where the money sits and who moves it.
 *
 * Revenue and stablecoin supply, then the allocators (vaults, validators),
 * then the Tracker recap: the tracker had no presence on the dashboard at all
 * even though its hooks were already shipped.
 */
export default function DashboardCapital() {
  return (
    <div className="space-y-8">
      {/* Protocol revenue + stablecoin supply */}
      <section className="space-y-2.5">
        <SectionHead
          title="Protocol Revenue & Capital"
          subtitle="Daily fees decomposition · stablecoin supply on spot"
          linkLabel="Revenue history →"
          linkHref="/hype"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeesRevenuePanel />
          <StablecoinsCard />
        </div>
      </section>

      {/* Vaults + validators */}
      <section className="space-y-2.5">
        <SectionHead
          title="Capital Allocators"
          subtitle="Top vaults & validators by TVL and stake"
          linkLabel="All vaults →"
          linkHref="/explorer/vaults"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VaultsModule />
          <ValidatorsModule />
        </div>
      </section>

      {/* Tracker recap */}
      <section className="space-y-2.5">
        <SectionHead
          title="Tracker"
          subtitle="Top traders, most active users, public lists & your watchlist"
          linkLabel="Open tracker →"
          linkHref="/market/tracker"
        />
        {/* xl, not lg: these tracker modules split into their own inner grid on
            a viewport media query, so halving them at 1024 nests two splits and
            leaves ~150px cards. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <TopTradersPreview />
          <ActiveUsersPreview />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PublicListsPreview />
          <TrackedWalletsPreview />
        </div>
      </section>
    </div>
  );
}
