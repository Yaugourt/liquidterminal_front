export interface BlockTransaction {
  time: number;
  user: string;
  action: {
    type: string;
   
  };
  block: number;
  error: null | string;
  hash: string;
}

export interface BlockDetails {
  height: number;
  blockTime: number;
  hash: string;
  numTxs: number;
  proposer: string;
  txs: BlockTransaction[];
}

export interface BlockDetailsResponse {
  type: "blockDetails";
  blockDetails: BlockDetails;
}

export interface UseBlockDetailsResult {
  blockDetails: BlockDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export interface TransactionDetails {
  time: number;
  user: string;
  action: {
    type: string;
    cancels?: { a: number; o: number }[];
  };
  block: number;
  error: null | string;
  hash: string;
}

export interface TransactionDetailsResponse {
  type: "txDetails";
  tx: TransactionDetails;
}

export interface UseTransactionDetailsResult {
  transactionDetails: TransactionDetails | null;
  isLoading: boolean;
  error: Error | null;
}

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
}

// Types pour les transferts
export interface TransferData {
  time: number;
  user: string;
  action: {
    type: string;
    signatureChainId: string;
    hyperliquidChain: string;
    destination: string;
    token: string;
    amount: string;
    time: number;
  };
  block: number;
  hash: string;
  error: null | string;
}

export interface FormattedTransfer {
  hash: string;
  time: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  blockNumber: number;
}

export interface UseTransfersResult {
  transfers: FormattedTransfer[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Types pour les déploiements
export interface DeployData {
  time: number;
  user: string;
  action: {
    type: string;
    registerToken2?: {
      spec?: {
        name: string;
        szDecimals: number;
        weiDecimals: number;
      };
      maxGas?: number;
    };
    // Autres propriétés possibles selon la structure API
  };
  block: number;
  hash: string;
  error: string | null;
}

export interface FormattedDeploy {
  hash: string;
  time: string;
  user: string;
  action: string;
  blockNumber: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface UseDeploysResult {
  deploys: FormattedDeploy[] | null;
  isLoading: boolean;
  error: Error | null;
} 