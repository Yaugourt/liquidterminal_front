// Response de l'API pour les transactions utilisateur
export interface UserTransactionsResponse {
    type: string;
    txs: UserTransaction[];
}

// Structure d'une action d'ordre
export interface OrderAction {
    type: string;
    orders?: Array<{
        a: number;        // amount
        b: boolean;       // buy/sell
        p: string;        // price
        s: string;        // size
        r: boolean;       // reduce only
        t: {
            limit: {
                tif: string;  // time in force
            };
        };
    }>;
    twap?: {
        a: number;
        b: boolean;
        s: string;
        r: boolean;
        m: number;
        t: boolean;
    };
    amount?: string;
    token?: string;
    destination?: string;
    wei?: string;
}

// Transaction brute de l'utilisateur
export interface UserTransaction {
    time: number;
    user: string;
    action: OrderAction;
    grouping: string;
    block: number;
    error: string | null;
    hash: string;
}

// Mise à jour du ledger non-funding
export interface NonFundingLedgerUpdate {
    delta: {
        coin?: string;
        type: string;
        usdc?: string;
        amount?: string;
        token?: string;
        user?: string;
        destination?: string;
        fee?: string;
        nativeTokenFee?: string;
        usdcValue?: string;
        toPerp?: boolean;
    };
    hash: string;
    time: number;
}

// Fill d'utilisateur (exécution d'ordre)
export interface UserFill {
    coin: string;
    px: string;          // price executed
    sz: string;          // size executed
    side: string;
    time: number;
    startPosition: string;
    cloid: string;       // client order id
    closedPnl: string;
    crossed: boolean;
    dir: string;         // direction (buy/sell)
    fee: string;
    feeToken: string;
    hash: string;
    oid: number;         // order id
    tid: number;         // trade id
}

// Response de l'API pour les fills
export type UserFillsResponse = UserFill[];

// Transaction formatée pour l'affichage
export interface FormattedUserTransaction {
    hash: string;
    method: string;
    age: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    price?: string;
    total?: string;
    time: number;
    isShort?: boolean;
    isLong?: boolean;
    isClose?: boolean;
}

// Response finale avec les transactions formatées
export interface TransactionResponse {
    data: FormattedUserTransaction[];
    error?: string;
}

export interface UseTransactionsResult {
    transactions: FormattedUserTransaction[] | null;
    isLoading: boolean;
    error: Error | null;
}

export interface PortfolioPeriodData {
  accountValueHistory?: [number, string][];
  pnlHistory: [number, string][];
  vlm: string;
}

export type PortfolioApiResponse = [string, PortfolioPeriodData][];

// Update TransactionType to match the actual return type from useTransactions
export interface TransactionType {
  hash: string;
  method: string;
  age: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  price?: string;
  total?: string; // Make total optional
  time: number;
  isShort?: boolean;
  isLong?: boolean;
} 

// Types pour les ordres ouverts
export interface OpenOrder {
    coin: string;
    side: "B" | "A"; // B = Buy, A = Sell
    limitPx: string;
    sz: string;
    oid: number;
    children: unknown[];
    cloid: string | null;
    isPositionTpsl: boolean;
    isTrigger: boolean;
    orderType: string;
    origSz: string;
    reduceOnly: boolean;
    tif: string;
    timestamp: number;
    triggerCondition: string;
    triggerPx: string;
}

export type OpenOrdersResponse = OpenOrder[];

// TWAP Orders types
export interface TwapTableData {
  id: string;
  type: 'Buy' | 'Sell';
  value: number;
  token: string;
  amount: string;
  progression: number;
  time: number;
  hash: string;
  duration: number;
  reduceOnly: boolean;
  ended: string | null;
  error: string | null;
}

export interface UseUserTwapOrdersResult {
  orders: TwapTableData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} 