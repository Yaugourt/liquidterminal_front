"use client";

import { Activity, Users, Receipt } from "lucide-react";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useMetricHistory } from "@/services/market/metrics";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { MetricHistoryCard } from "@/components/dashboard/MetricHistoryCard";

const usd = (v: number) => `$${compactUsd(v).replace(/^\$/, "")}`;

/**
 * Network growth — trends for headline numbers that have no upstream history
 * (total perp open interest, 24h active users). The backend samples them
 * hourly; this section owns both fetches and self-gates: until at least one
 * series has two points, the whole block (header included) renders nothing, so
 * it appears cleanly once history has accrued rather than showing an empty
 * header over blank cards.
 */
export function NetworkGrowthSection() {
  const { history: oi } = useMetricHistory("total_oi", 168);
  const { history: users } = useMetricHistory("active_users_24h", 168);
  const { history: fees } = useMetricHistory("total_fees_24h", 168);

  const hasOi = oi.length >= 2;
  const hasUsers = users.length >= 2;
  const hasFees = fees.length >= 2;
  if (!hasOi && !hasUsers && !hasFees) return null;

  return (
    <section className="space-y-2.5">
      <SectionHead
        title="Network growth"
        subtitle="Open interest, active users and protocol fees, sampled hourly · trailing 7d"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {hasOi && (
          <MetricHistoryCard
            title="Open interest"
            subtitle="Total perp OI across all markets"
            icon={<Activity size={15} className="text-brand" />}
            format={usd}
            latestLabel="Current OI"
            history={oi}
          />
        )}
        {hasUsers && (
          <MetricHistoryCard
            title="Active users"
            subtitle="Unique traders over the last 24h"
            icon={<Users size={15} className="text-brand" />}
            format={compactCount}
            latestLabel="Active (24h)"
            history={users}
          />
        )}
        {hasFees && (
          <MetricHistoryCard
            title="Protocol fees"
            subtitle="Total fees earned over the last 24h"
            icon={<Receipt size={15} className="text-brand" />}
            format={usd}
            latestLabel="Fees (24h)"
            history={fees}
          />
        )}
      </div>
    </section>
  );
}
