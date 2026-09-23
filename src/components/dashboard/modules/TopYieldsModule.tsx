"use client";

import { memo } from "react";
import { OverviewModule, ModuleTable, ModuleTableRow, ModuleAsset, DataStatus, SourceBadge } from "@/components/common";
import { useTopYields } from "@/services/market/yields";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/** TopYieldsModule — résumé de /market/yields sur le Dashboard (table "Top Yields"). */
export const TopYieldsModule = memo(function TopYieldsModule() {
  const { yields, isLoading, isRefreshing, refetch, dataUpdatedAt, error } = useTopYields(5);

  return (
    <OverviewModule
      title="Top Yields"
      tag="≥ $100k TVL"
      viewAllLabel="All yields"
      href="/market/yields"
      actions={
        <>
          <SourceBadge source="hyperfolio" status={error ? "error" : isLoading && !dataUpdatedAt ? "loading" : "ok"} />
          <DataStatus variant="polled" updatedAt={dataUpdatedAt} isRefreshing={isRefreshing} onRefresh={refetch} />
        </>
      }
    >
      {/* Same three-column budget as VaultsModule: pool identity, APY, TVL. */}
      <ModuleTable
        columns={[
          { header: "Pool" },
          { header: "APY", width: 72 },
          { header: "TVL", width: 96 },
        ]}
      >
        {isLoading && yields.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {!isLoading && error && yields.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              Yields unavailable right now.
            </td>
          </tr>
        )}
        {yields.map((y) => (
          <ModuleTableRow
            key={y.id}
            href="/market/yields"
            cells={[
              <ModuleAsset
                key="pool"
                logo={y.protocol.name.slice(0, 2).toUpperCase()}
                name={y.poolName}
                sub={`${y.protocol.name} · ${y.type.toUpperCase()}`}
              />,
              <span key="apy" className="mono font-semibold text-success">
                {`${y.apy.total.toFixed(1)}%`}
              </span>,
              <span key="tvl" className="mono text-text-primary">
                {y.tvl !== null ? compactUsd(y.tvl) : "—"}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
