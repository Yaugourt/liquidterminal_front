import { useDataFetching } from "@/hooks/useDataFetching";
import { fetchEvmTransactions } from "../api";
import type { EvmTransaction, UseEvmTransactionsResult } from "../types";

export function useEvmTransactions(limit = 10): UseEvmTransactionsResult {
  const { data, isLoading, error, refetch } = useDataFetching<EvmTransaction[]>({
    fetchFn: () => fetchEvmTransactions({ limit }),
    dependencies: [limit],
    refreshInterval: 5_000,
    maxRetries: 3,
  });

  return { transactions: data ?? [], isLoading, error, refetch };
}
