import { useEffect, useCallback } from 'react';
import { useLiquidationWSStore } from '../websocket.store';
import { UseLiquidationsWSOptions, Liquidation, LiquidationWSFilters } from '../types';

/**
 * Hook pour se connecter au WebSocket des liquidations en temps réel
 * 
 * @example
 * ```tsx
 * const { 
 *   isConnected, 
 *   isSubscribed, 
 *   recentLiquidations,
 *   error 
 * } = useLiquidationsWebSocket({
 *   enabled: true,
 *   filters: { minAmountUsd: 10000 },
 *   onLiquidation: (liq) => console.log('New liquidation:', liq)
 * });
 * ```
 */
export function useLiquidationsWebSocket(options: UseLiquidationsWSOptions = {}) {
  const { 
    enabled = true, 
    filters = {}, 
    onLiquidation 
  } = options;

  const {
    isConnected,
    isSubscribed,
    error,
    recentLiquidations,
    connect,
    disconnect,
    updateFilters,
    clearLiquidations,
    setOnLiquidation
  } = useLiquidationWSStore();

  // Enregistrer le callback
  useEffect(() => {
    setOnLiquidation(onLiquidation);
    return () => setOnLiquidation(undefined);
  }, [onLiquidation, setOnLiquidation]);

  // Connexion/déconnexion basée sur enabled
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Ne pas déconnecter au unmount si d'autres composants utilisent le WS
      // Le store Zustand persiste entre les composants
    };
  }, [enabled, connect, disconnect]);

  // Mise à jour des filtres
  useEffect(() => {
    if (isConnected) {
      updateFilters(filters);
    }
  }, [filters, isConnected, updateFilters]);

  // Helper pour mettre à jour les filtres manuellement
  const setFilters = useCallback((newFilters: LiquidationWSFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  return {
    // État
    isConnected,
    isSubscribed,
    error,
    recentLiquidations,
    
    // Actions
    updateFilters: setFilters,
    clearLiquidations,
    disconnect
  };
}

/**
 * Hook simplifié pour juste écouter les nouvelles liquidations
 * sans gérer la connexion (utilise le store global)
 */
export function useLiquidationEvents(onLiquidation: (liq: Liquidation) => void) {
  const { setOnLiquidation } = useLiquidationWSStore();

  useEffect(() => {
    setOnLiquidation(onLiquidation);
    return () => setOnLiquidation(undefined);
  }, [onLiquidation, setOnLiquidation]);
}
