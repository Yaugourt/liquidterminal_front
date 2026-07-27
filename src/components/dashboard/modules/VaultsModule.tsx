"use client";

import { memo, useMemo } from "react";
import { Vault } from "lucide-react";
import { ExportButton } from "@/components/export/ExportButton";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  DataStatus,
} from "@/components/common";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import {
  compactUsd,
  truncateAddress,
} from "@/lib/formatters/numberFormatting";

/** VaultsModule — résumé de /explorer/vaults sur le Dashboard (table "Top Vaults"). */
export const VaultsModule = memo(function VaultsModule() {
  const { vaults, totalTvl, isLoading, isRefreshing, refetch, dataUpdatedAt } = useVaults({
    limit: 1000,
    sortBy: "tvl",
  });

  const topVaults = useMemo(() => vaults.slice(0, 5), [vaults]);

  return (
    <OverviewModule
      title="Top Vaults"
      icon={<Vault size={13} className="text-brand" />}
      tag={`${compactUsd(totalTvl)} TVL`}
      viewAllLabel="All vaults"
      href="/explorer/vaults"
      actions={
        <>
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
          <ExportButton datasetId="vault-summaries" />
        </>
      }
    >
      {/* Three columns, leader folded into the vault identity: a fourth dense
          column needs ~86px for an address, which a half-width card (and every
          mobile card) cannot spare without clipping. Declared widths also switch
          the table to `table-fixed`, so long vault names truncate. */}
      <ModuleTable
        columns={[
          { header: "Vault" },
          { header: "APR", width: 72 },
          { header: "TVL", width: 96 },
        ]}
      >
        {isLoading && topVaults.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {topVaults.map((v) => (
          <ModuleTableRow
            key={v.summary.vaultAddress}
            href={`/explorer/vaults/${encodeURIComponent(v.summary.vaultAddress)}`}
            cells={[
              <ModuleAsset
                key="vault"
                logo={v.summary.name.slice(0, 2).toUpperCase()}
                name={v.summary.name}
                sub={truncateAddress(v.summary.leader)}
              />,
              <span key="apr" className="mono font-semibold text-success">
                {`${v.apr.toFixed(1)}%`}
              </span>,
              <span key="tvl" className="mono text-text-primary">
                {compactUsd(parseFloat(v.summary.tvl))}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
