import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmLedgerTransfers } from "../api";
import type { EvmLedgerTransfer, UseEvmLedgerTransfersResult } from "../types";

export function useEvmLedgerTransfers(limit = 10): UseEvmLedgerTransfersResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmLedgerTransfer[]>({
    fetchFn: () => fetchEvmLedgerTransfers({ limit }),
    dependencies: [limit],
    refreshInterval: 30_000,
    maxRetries: 3,
  });

  return { transfers: data ?? [], isLoading, error, refetch };
}
