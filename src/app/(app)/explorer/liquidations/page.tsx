import {
  LiquidationsProvider,
  LiquidationsPageHeader,
  LiquidationsKpiStrip,
  LiquidationsChartSection,
  LiquidationsSection,
} from "@/components/explorer/liquidation";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { PageFaq } from "@/components/common";
import { LIQUIDATIONS_FAQ } from "@/lib/page-faqs";

/**
 * /explorer/liquidations — composed on the main-dashboard page-type (same as
 * /explorer/vaults): PageHeader → SectionHead'd sections → primitive cards.
 * One provider feeds the ribbon, the history chart and the live table.
 */
export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <div className="space-y-8">
        <LiquidationsPageHeader />

        {/* Overview (2×3 KPI grid) beside the history chart — the pre-V4
            arrangement, kept on the V4 primitives. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
          <section className="flex flex-col gap-2.5 min-w-0">
            <SectionHead title="Overview" subtitle="24h snapshot · volume, count, long/short split" />
            <LiquidationsKpiStrip />
          </section>

          <section className="flex flex-col gap-2.5 min-w-0 md:col-span-2">
            <SectionHead
              title="History"
              subtitle="Volume or count per bucket · bars colored by the dominant side"
            />
            <LiquidationsChartSection />
          </section>
        </div>

        <section className="space-y-2.5">
          <SectionHead
            title="Recent liquidations"
            subtitle="Seeded from the API, streamed live over WebSocket · filter by notional"
          />
          <LiquidationsSection />
        </section>

        <PageFaq items={LIQUIDATIONS_FAQ} />
      </div>
    </LiquidationsProvider>
  );
}
