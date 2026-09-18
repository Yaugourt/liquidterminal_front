"use client";

import { PageHeader, DataStatus, SourceBadge } from "@/components/common";
import type { UseYieldsDirectoryResult } from "@/services/market/yields";

interface YieldsListHeaderProps {
  directory: UseYieldsDirectoryResult;
}

export function YieldsListHeader({ directory }: YieldsListHeaderProps) {
  const { dataUpdatedAt, isRefreshing, isLoading, error, refetch } = directory;

  // Same contract as VaultsListHeader: no stats here (they live in the KPI
  // ribbon), only the freshness cue + manual refresh in the actions slot.
  return (
    <PageHeader
      title="Yields"
      titleQualifier="on HyperEVM"
      description="Lending markets, LP pools, vaults and staking across the HyperEVM ecosystem, ranked by APY and depth."
      actions={
        <>
          <SourceBadge source="hyperfolio" status={error ? "error" : isLoading && !dataUpdatedAt ? "loading" : "ok"} />
          <DataStatus variant="polled" updatedAt={dataUpdatedAt} isRefreshing={isRefreshing} onRefresh={refetch} />
        </>
      }
    />
  );
}
