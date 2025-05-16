import { 
    BlockDetailsResponse,
    TransactionDetailsResponse,
    UserTransactionsResponse,
    NonFundingLedgerUpdate,
    UserFill,
    FormattedUserTransaction,
    UserTransaction,
    TransferData,
    DeployData
} from './types';

/**
 * Récupère les détails d'un block spécifique
 */
export async function fetchBlockDetails(height: number): Promise<BlockDetailsResponse> {
    try {
        const response = await fetch('https://rpc.hyperliquid.xyz/explorer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "blockDetails",
                height: height
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch block details: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching block details:', error);
        throw error;
    }
}

/**
 * Récupère les détails d'une transaction spécifique
 */
export async function fetchTransactionDetails(hash: string): Promise<TransactionDetailsResponse> {
    try {
        const response = await fetch('https://rpc.hyperliquid.xyz/explorer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "txDetails",
                hash: hash
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transaction details: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}

export async function getUserTransactionsRaw(address: string): Promise<UserTransactionsResponse> {
    try {
        const response = await fetch('https://rpc.hyperliquid.xyz/explorer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userDetails",
                user: address
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching raw transactions:', error);
        throw error;
    }
}

export async function getUserNonFundingLedgerUpdates(address: string): Promise<NonFundingLedgerUpdate[]> {
    try {
        const response = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userNonFundingLedgerUpdates",
                user: address,
                startTime: 1640995200000 // 1er janvier 2022 en ms
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching ledger updates:', error);
        throw error;
    }
}

export async function getUserFills(address: string): Promise<UserFill[]> {
    try {
        const response = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userFills",
                user: address
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user fills:', error);
        throw error;
    }
}

export async function getUserTransactions(address: string): Promise<FormattedUserTransaction[]> {
    try {
        const [txsResponse, ledgerUpdates, fills] = await Promise.all([
            getUserTransactionsRaw(address),
            getUserNonFundingLedgerUpdates(address),
            getUserFills(address)
        ]);
        console.log('ledgerUpdates', ledgerUpdates);

        // Traiter les fills d'abord
        const fillTransactions = mergeFillsByHash(fills).map(fill => ({
            hash: fill.hash,
            method: fill.dir,
            age: formatAge(fill.time),
            from: address,
            to: "HIP-2",
            amount: fill.sz,
            token: fill.coin,
            price: fill.px,
            total: (Number(fill.px) * Number(fill.sz)).toFixed(2),
            time: fill.time
        }));

        // Créer un Set des hashs déjà traités
        const processedHashes = new Set(fillTransactions.map(tx => tx.hash));
        const ledgerMap = new Map(ledgerUpdates.map(update => [update.hash, update]));

        // Traiter les autres transactions
        const otherTransactions = txsResponse.txs
            .filter((tx: UserTransaction) => {
                if (processedHashes.has(tx.hash)) return false;
                if (tx.action.type === "evmRawTx" && !tx.action.orders?.[0]?.s) return false;
                return true;
            })
            .map((tx: UserTransaction) => {
                const order = tx.action.orders?.[0];
                const ledgerUpdate = ledgerMap.get(tx.hash);

                if (ledgerUpdate) {
                    return {
                        hash: tx.hash,
                        method: ledgerUpdate.delta.type,
                        age: formatAge(tx.time),
                        from: address,
                        to: (ledgerUpdate.delta.type === "withdraw")
                            ? "arbitrum"
                            : ledgerUpdate.delta.destination || "0x2222222222222222222222222222222222222222",
                        amount: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer" 
                            ? ledgerUpdate.delta.usdc || "0"
                            : ledgerUpdate.delta.amount || ledgerUpdate.delta.usdc || "0",
                        token: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer"
                            ? "USDC"
                            : ledgerUpdate.delta.token || ledgerUpdate.delta.coin || "unknown",
                        time: ledgerUpdate.time
                    };
                }

                let amount = "0";
                if (order?.s) {
                    amount = order.s;
                } else if (tx.action.type === "SystemSpotSendAuction" && tx.action.wei) {
                    amount = (Number(tx.action.wei) / 100000000).toString();
                } else if (tx.action.amount !== undefined) {
                    amount = tx.action.amount;
                }

                return {
                    hash: tx.hash,
                    method: tx.action.type,
                    age: formatAge(tx.time),
                    from: address,
                    to: tx.action.destination || "0x2222222222222222222222222222222222222222",
                    amount,
                    token: order?.a?.toString() || tx.action.token || "unknown",
                    time: tx.time
                };
            });

        // Ajout des ledgerUpdates orphelins (withdraw/deposit sans tx brute associée)
        const allHashes = new Set([
            ...fillTransactions.map(tx => tx.hash),
            ...otherTransactions.map(tx => tx.hash)
        ]);
        const orphanLedgerTxs = ledgerUpdates
            .filter(update => !allHashes.has(update.hash))
            .map(ledgerUpdate => ({
                hash: ledgerUpdate.hash,
                method: ledgerUpdate.delta.type,
                age: formatAge(ledgerUpdate.time),
                from: address,
                to: (ledgerUpdate.delta.type === "withdraw")
                    ? "arbitrum"
                    : ledgerUpdate.delta.destination || "0x2222222222222222222222222222222222222222",
                amount: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer"
                    ? ledgerUpdate.delta.usdc || "0"
                    : ledgerUpdate.delta.amount || ledgerUpdate.delta.usdc || "0",
                token: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer"
                    ? "USDC"
                    : ledgerUpdate.delta.token || ledgerUpdate.delta.coin || "unknown",
                time: ledgerUpdate.time
            }));
        console.log('orphanLedgerTxs', orphanLedgerTxs);

        // Combiner et trier les transactions
        const allTxs = [...fillTransactions, ...otherTransactions, ...orphanLedgerTxs].sort((a, b) => b.time - a.time);
        console.log('Total transactions returned:', allTxs.length);
        return allTxs;
    } catch (error) {
        console.error("Error formatting user transactions:", error);
        throw error;
    }
}

function formatAge(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

function mergeFillsByHash(fills: UserFill[]): UserFill[] {
    if (!fills || !Array.isArray(fills)) {
        return [];
    }

    const fillsByHash = new Map<string, UserFill[]>();
    
    // Grouper les fills par hash
    fills.forEach(fill => {
        if (!fillsByHash.has(fill.hash)) {
            fillsByHash.set(fill.hash, []);
        }
        fillsByHash.get(fill.hash)!.push(fill);
    });

    // Fusionner les fills avec le même hash
    return Array.from(fillsByHash.values()).map(hashFills => {
        if (hashFills.length === 1) return hashFills[0];

        const base = hashFills[0];
        const totalSize = hashFills.reduce((sum, fill) => sum + Number(fill.sz), 0);
        const totalFee = hashFills.reduce((sum, fill) => sum + Number(fill.fee), 0);

        return {
            ...base,
            sz: totalSize.toString(),
            fee: totalFee.toString()
        };
    });
}

export async function fetchPortfolio(address: string) {
    const response = await fetch('https://api-ui.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'portfolio',
            user: address,
        }),
    });
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
}

/**
 * Récupère les transferts depuis l'API Hypurrscan
 * @returns Liste des transferts bruts
 */
export async function fetchTransfers(): Promise<TransferData[]> {
    try {
        const response = await fetch('https://api.hypurrscan.io/transfers', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transfers: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching transfers:', error);
        throw error;
    }
}

/**
 * Récupère les déploiements depuis l'API Hypurrscan
 * @returns Liste des déploiements bruts
 */
export async function fetchDeploys(): Promise<DeployData[]> {
    try {
        const response = await fetch('https://api.hypurrscan.io/deploys', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch deploys: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching deploys:', error);
        throw error;
    }
} 