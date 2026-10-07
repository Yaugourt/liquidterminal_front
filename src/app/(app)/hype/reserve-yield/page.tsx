"use client";

import { DataStatus } from "@/components/common";
import { Card } from "@/components/ui/card";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  ReserveYieldEstimatorCard,
  ReserveYieldLedgerCard,
  ReserveYieldMethodCard,
  ReserveYieldOverviewCard,
  ReserveYieldScheduleCard,
} from "@/components/hype";
import { useReserveYield } from "@/services/market/reserve-yield";

/**
 * HYPE · Reserve Yield: the USDC reserve yield (AQAv2) paid to the protocol.
 *
 * A new revenue line next to trading fees: the deployers of USDC on Hyperliquid
 * pay the protocol its share of the yield on the reserves, every 30 days, and
 * the Assistance Fund turns it into HYPE buybacks. The page follows one payment
 * from the treasury balance it is charged on to the fund that spends it.
 */
export default function HypeReserveYieldPage() {
  const { data, isInitialLoading, error, dataUpdatedAt, isRefreshing, refetch } = useReserveYield();

  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionHead
            title="Reserve Yield"
            subtitle="USDC reserve yield paid to the protocol · read from HyperEVM and HyperCore"
          />
          <DataStatus variant="polled" updatedAt={dataUpdatedAt} isRefreshing={isRefreshing} onRefresh={refetch} />
        </div>
        {data ? (
          <ReserveYieldOverviewCard data={data} />
        ) : (
          <Card className="px-4 py-10 text-center text-[12px] text-text-tertiary">
            {error && !isInitialLoading
              ? "The chain reads did not come back. Retrying in a moment."
              : "Reading the treasury balance for every date since activation…"}
          </Card>
        )}
      </section>

      {data && (
        <>
          <section className="space-y-2.5">
            <SectionHead title="Payments" subtitle="Each 30-date interval and the money that moved" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:items-start">
              <ReserveYieldScheduleCard data={data} />
              <ReserveYieldLedgerCard data={data} />
            </div>
          </section>

          <section className="space-y-2.5">
            <SectionHead title="Mechanism" subtitle="What one interval and one year are worth · how it is computed" />
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 xl:items-start">
              <ReserveYieldEstimatorCard data={data} />
              <ReserveYieldMethodCard />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
