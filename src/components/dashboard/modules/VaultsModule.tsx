"use client";

import { memo, useMemo } from "react";
import { Vault } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import {
  compactUsd,
  truncateAddress,
} from "@/lib/formatters/numberFormatting";

/** VaultsModule — résumé de /explorer/vaults sur le Dashboard (table "Top Vaults"). */
export const VaultsModule = memo(function VaultsModule() {
  const { vaults, totalTvl, isLoading } = useVaults({
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
    >
      <ModuleTable
        columns={[
          { header: "Vault" },
          { header: "APR" },
          { header: "TVL" },
          { header: "Leader" },
        ]}
      >
        {isLoading && topVaults.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-2.5 text-[12px] text-text-tertiary">
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
              />,
              <span key="apr" className="mono font-semibold text-success">
                {`${v.apr.toFixed(1)}%`}
              </span>,
              <span key="tvl" className="mono text-text-primary">
                {compactUsd(parseFloat(v.summary.tvl))}
              </span>,
              <span key="leader" className="mono text-text-secondary">
                {truncateAddress(v.summary.leader)}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
