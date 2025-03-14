export interface Holding {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
}

export interface WalletInfo {
  address: string;
  holdings: Holding[];
}

export interface Wallet {
  id: string;
  address: string;
  name?: string;
  info?: WalletInfo;
}

export interface WalletStats {
  totalBalance: number;
  usdcBalance: number;
  otherTokens: number;
}

export interface HoldingDisplay {
  id: string;
  coin: string;
  token: number;
  total: string;
  hold?: string;
  entryNtl: string;
  totalValue: number;
  price: number;
} 