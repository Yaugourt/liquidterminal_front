/**
 * Types pour les stablecoins on-spot — endpoint Hypurrscan `/spotUSDC`.
 *
 * Malgré son nom, `/spotUSDC` suit plusieurs stablecoins (USDC, USDT0, USDH,
 * USDE) : supply on-spot, nombre de holders et part HIP-2, en série temporelle.
 */

/** Une entrée brute de la série `/spotUSDC`. Les champs non-USDC peuvent
 * manquer sur les anciennes entrées — on ne lit que la plus récente. */
export interface SpotUsdcEntry {
  lastUpdate: number;
  totalSpotUSDC: number;
  totalSpotUSDT0?: number;
  totalSpotUSDE?: number;
  totalSpotUSDH?: number;
  USDC_holdersCount: number;
  USDT0_holdersCount?: number;
  USDE_holdersCount?: number;
  USDH_holdersCount?: number;
  USDC_HIP2?: number;
  USDT0_HIP2?: number;
  USDE_HIP2?: number;
  USDH_HIP2?: number;
}

export type SpotUsdcResponse = SpotUsdcEntry[];

/** Un stablecoin normalisé pour l'affichage. */
export interface Stablecoin {
  symbol: string;
  /** Supply on-spot en USD. */
  supply: number;
  /** Nombre de détenteurs. */
  holders: number;
}

/** Un point de la série temporelle stablecoins totale. */
export interface StablecoinSupplyPoint {
  time: number;  // ms
  value: number; // supply totale en USD
}

export interface UseSpotStablecoinsResult {
  stablecoins: Stablecoin[];
  /** Supply totale (somme des stablecoins) par point de la série — pour sparkline. */
  supplyHistory: number[];
  /** Série temporelle complète (time ms + supply totale) — pour chart. */
  supplyChart: StablecoinSupplyPoint[];
  /** Horodatage (s) de la dernière mise à jour Hypurrscan. */
  lastUpdate: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
