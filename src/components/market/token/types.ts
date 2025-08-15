export interface TokenData {
  // Common fields for both spot and perpetual
  symbol: string;
  name: string;
  type: 'spot' | 'perpetual';
  logo?: string | null; // Token logo URL
  
  // Price data
  mark?: number;
  oracle?: number;
  price?: number;
  
  // Market index for WebSocket connection
  marketIndex?: number;
  
  // Change data
  change24h: number;
  
  // Volume data
  volume24h: number;
  
  // Market specific fields
  marketCap?: number; // Spot only
  openInterest?: number; // Perpetual only
  
  // Contract/funding data
  contract?: string;
  fundingRate?: number; // Perpetual only
  countdown?: string; // Perpetual only
}

export interface TokenCardProps {
  token: TokenData;
  className?: string;
}
