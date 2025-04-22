/**
 * Type pour les tokens spot
 */
export interface Token {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  liquidity: number;
  supply: number;
}

/**
 * Type pour les tokens perpétuels
 */
export interface PerpToken {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
} 