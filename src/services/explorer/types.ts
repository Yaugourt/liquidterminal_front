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

// Types étendus pour les détails de transaction
export interface TransactionAction {
  type: string;
  
  // Pour les ordres
  orders?: Array<{
    a: number;        // asset/amount
    b: boolean;       // buy/sell
    p: string;        // price
    s: string;        // size
    r: boolean;       // reduce only
    t: {
      limit?: {
        tif: string;  // time in force
      };
      trigger?: {
        triggerPx: string;
        tpsl: string;
        isMarket: boolean;
      };
    };
  }>;
  
  // Pour les ordres TWAP
  twap?: {
    a: number;
    b: boolean;
    s: string;
    r: boolean;
    m: number;
    t: boolean;
  };
  
  // Pour les annulations
  cancels?: Array<{
    a: number;
    o: number;
  }>;
  
  // Pour les transferts
  destination?: string;
  amount?: string;
  token?: string;
  wei?: string;
  
  // Pour les transferts spot
  signatureChainId?: string;
  hyperliquidChain?: string;
  
  // Pour les déploiements
  registerToken2?: {
    spec?: {
      name: string;
      szDecimals: number;
      weiDecimals: number;
    };
    maxGas?: number;
  };
  
  // Pour les déploiements spot
  userGenesis?: {
    token: number;
    userAndWei: Array<[string, string]>;
  };
  
  genesis?: {
    token: number;
    maxSupply: string;
    noHyperliquidity?: boolean;
  };
  
  registerSpot?: {
    tokens: number[];
  };
  
  // Pour les staking
  validator?: string;
  
  // Pour les votes
  proposal?: number;
  vote?: boolean;
  
  // Propriétés génériques
  [key: string]: any;
}

export interface ExtendedTransactionDetails {
  time: number;
  user: string;
  action: TransactionAction;
  block: number;
  error: string | null;
  hash: string;
}

export interface ExtendedTransactionDetailsResponse {
  type: "txDetails";
  tx: ExtendedTransactionDetails;
}

// Types pour l'affichage formaté
export interface FormattedTransactionField {
  label: string;
  value: string | number | boolean | null;
  type: 'text' | 'hash' | 'address' | 'amount' | 'boolean' | 'timestamp' | 'link' | 'json';
  subFields?: FormattedTransactionField[];
}

export interface FormattedTransactionSection {
  title: string;
  fields: FormattedTransactionField[];
}

export interface FormattedTransactionData {
  hash: string;
  time: number;
  user: string;
  block: number;
  error: string | null;
  sections: FormattedTransactionSection[];
}

// Types pour les hooks étendus
export interface UseExtendedTransactionDetailsResult {
  transactionDetails: ExtendedTransactionDetails | null;
  isLoading: boolean;
  error: Error | null;
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
  timestamp: number;
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
  timestamp: number;
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

// Types pour les données WebSocket temps réel
export interface Block {
  height: number;
  blockTime: number;
  hash: string;
  numTxs: number;
  proposer: string;
}

export interface Transaction {
  time: number;
  user: string;
  hash: string;
  block: number;
  error: string | null;
  action: {
    type: string;
    cancels?: Array<{
      a: number;
      o: number;
    }>;
    // Add other action types as needed
  };
}

export interface ExplorerState {
  blocks: Block[];
  transactions: Transaction[];
  isBlocksConnected: boolean;
  isTransactionsConnected: boolean;
  error: string | null;
}

export interface ExplorerStore extends ExplorerState {
  connectBlocks: () => void;
  disconnectBlocks: () => void;
  connectTransactions: () => void;
  disconnectTransactions: () => void;
  connect: () => void;
  disconnect: () => void;
  addBlock: (block: Block) => void;
  addTransaction: (transaction: Transaction) => void;
  setError: (error: string | null) => void;
}

 