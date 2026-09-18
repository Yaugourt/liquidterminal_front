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

        <section className="space-y-2.5">
          <SectionHead title="Overview" subtitle="24h snapshot · volume, count, long/short split" />
          <LiquidationsKpiStrip />
        </section>

        <section className="space-y-2.5">
          <SectionHead
            title="History"
            subtitle="Volume or count per bucket · bars colored by the dominant side"
          />
          <LiquidationsChartSection />
        </section>

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
