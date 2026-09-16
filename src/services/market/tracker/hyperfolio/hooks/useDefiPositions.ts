import { useCallback, useEffect } from 'react';
import { selectWallet, useDefiPositionsStore } from '../positions.store';
import type { UseDefiPositionsResult } from '../types';

/**
 * DeFi positions of a wallet, streamed protocol by protocol from the backend
 * SSE proxy (shared connection — see positions.store.ts). No polling: the
 * feed runs once per mount and `refresh()` re-opens it on demand.
 */
export const useDefiPositions = (address: string): UseDefiPositionsResult => {
  const state = useDefiPositionsStore(selectWallet(address));
  const subscribe = useDefiPositionsStore((s) => s.subscribe);
  const refreshWallet = useDefiPositionsStore((s) => s.refresh);

  useEffect(() => {
    if (!address) return undefined;
    return subscribe(address);
  }, [address, subscribe]);

  const refresh = useCallback(() => refreshWallet(address), [address, refreshWallet]);

  return {
    ...state,
    isLoading: state.status === 'idle' || (state.status === 'streaming' && state.protocols.length === 0),
    refresh,
  };
};
