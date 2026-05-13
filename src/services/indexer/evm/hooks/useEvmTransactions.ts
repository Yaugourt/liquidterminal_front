import { useMemo } from "react";
import { useParamsFetch } from "@/services/common";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { fetchEvmTransactions } from "../api";
import type { EvmTransaction, UseEvmTransactionsResult } from "../types";

export function useEvmTransactions(limit = 10): UseEvmTransactionsResult {
  const params = useMemo(() => ({ limit }), [limit]);
  const { data, isLoading, error, refetch } = useParamsFetch<EvmTransaction[], { limit: number }>({
    fetchFn: (p) => fetchEvmTransactions(p),
    params,
    refreshInterval: REFRESH_INTERVALS.REALTIME,
  });

  return { transactions: data ?? [], isLoading, error, refetch };
}
