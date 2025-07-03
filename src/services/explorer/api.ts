import { 
    BlockDetailsResponse,
    TransactionDetailsResponse,
    UserTransactionsResponse,
    NonFundingLedgerUpdate,
    UserFill,
    FormattedUserTransaction,
    UserTransaction,
    TransferData,
    DeployData,

} from './types';
import { 
    fetchExternal, 
    buildHyperliquidRpcUrl,
    buildHyperliquidUrl,
    buildHyperliquidUiUrl,
    buildHypurrscanUrl,
} from '../api/base';

const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

/**
 * Récupère les détails d'un block spécifique
 */
export async function fetchBlockDetails(height: number): Promise<BlockDetailsResponse> {
    try {
        const url = buildHyperliquidRpcUrl('EXPLORER_BLOCK_DETAILS');
        return await fetchExternal<BlockDetailsResponse>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "blockDetails",
                height: height
            })
        });
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
        const url = buildHyperliquidRpcUrl('EXPLORER_TX_DETAILS');
        return await fetchExternal<TransactionDetailsResponse>(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: "txDetails",
                hash: hash
            })
        });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        throw error;
    }
}

export async function getUserTransactionsRaw(address: string): Promise<UserTransactionsResponse> {
    try {
        const url = buildHyperliquidRpcUrl('EXPLORER_USER_DETAILS');
        return await fetchExternal<UserTransactionsResponse>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userDetails",
                user: address
            })
        });
    } catch (error) {
        console.error('Error fetching raw transactions:', error);
        throw error;
    }
}

export async function getUserNonFundingLedgerUpdates(address: string): Promise<NonFundingLedgerUpdate[]> {
    try {
        const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
        return await fetchExternal<NonFundingLedgerUpdate[]>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userNonFundingLedgerUpdates",
                user: address,
                startTime: 1640995200000 
            })
        });
    } catch (error) {
        console.error('Error fetching ledger updates:', error);
        throw error;
    }
}

export async function getUserFills(address: string): Promise<UserFill[]> {
    try {
        const url = buildHyperliquidUrl('HYPERLIQUID_INFO');
        return await fetchExternal<UserFill[]>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "userFills",
                user: address
            })
        });
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
    

        // Traiter les fills d'abord
        const fillTransactions = mergeFillsByHash(fills).map(fill => {
            const isClosePosition = fill.dir.toLowerCase().includes('close');
            
            return {
                hash: fill.hash,
                method: fill.dir,
                age: formatAge(fill.time),
                from: isClosePosition ? HIP2_ADDRESS : address,
                to: isClosePosition ? address : HIP2_ADDRESS,
                amount: fill.sz,
                token: fill.coin,
                price: fill.px,
                total: (Number(fill.px) * Number(fill.sz)).toFixed(2),
                time: fill.time
            };
        });

        // Créer un Set des hashs déjà traités
        const processedHashes = new Set(fillTransactions.map(tx => tx.hash));
        const ledgerMap = new Map(ledgerUpdates.map(update => [update.hash, update]));

        // Traiter les autres transactions
        const otherTransactions = txsResponse.txs
            .filter((tx: UserTransaction) => {
                if (processedHashes.has(tx.hash)) return false;
                if (tx.action.type === "evmRawTx" && !tx.action.orders?.[0]?.s) return false;
                if (tx.action.type === "withdraw3") return false;
                return true;
            })
            .map((tx: UserTransaction) => {
                const order = tx.action.orders?.[0];
                const ledgerUpdate = ledgerMap.get(tx.hash);

                if (ledgerUpdate) {
                    const addresses = getTransactionAddresses({ action: { type: ledgerUpdate.delta.type } } as UserTransaction, address, ledgerUpdate);
                    return {
                        hash: tx.hash,
                        method: ledgerUpdate.delta.type,
                        age: formatAge(tx.time),
                        from: addresses.from,
                        to: addresses.to,
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

                const addresses = getTransactionAddresses(tx, address);
                return {
                    hash: tx.hash,
                    method: tx.action.type,
                    age: formatAge(tx.time),
                    from: addresses.from,
                    to: addresses.to,
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
            .filter(update => !allHashes.has(update.hash) && update.delta.type !== "withdraw3")
            .map(ledgerUpdate => {
                const addresses = getTransactionAddresses({ action: { type: ledgerUpdate.delta.type } } as UserTransaction, address, ledgerUpdate);
                return {
                    hash: ledgerUpdate.hash,
                    method: ledgerUpdate.delta.type,
                    age: formatAge(ledgerUpdate.time),
                    from: addresses.from,
                    to: addresses.to,
                    amount: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer"
                        ? ledgerUpdate.delta.usdc || "0"
                        : ledgerUpdate.delta.amount || ledgerUpdate.delta.usdc || "0",
                    token: ledgerUpdate.delta.type === "withdraw" || ledgerUpdate.delta.type === "accountClassTransfer"
                        ? "USDC"
                        : ledgerUpdate.delta.token || ledgerUpdate.delta.coin || "unknown",
                    time: ledgerUpdate.time
                };
            });
    

        // Combiner et trier les transactions
        const allTxs = [...fillTransactions, ...otherTransactions, ...orphanLedgerTxs].sort((a, b) => b.time - a.time);
    
        return allTxs;
    } catch (error) {
        console.error("Error formatting user transactions:", error);
        throw error;
    }
}

// Helper function pour déterminer from/to selon le type de transaction
function getTransactionAddresses(tx: UserTransaction, address: string, ledgerUpdate?: any) {
    const method = tx.action.type;
    
    switch (method) {
        case "deposit":
            return { from: "Arbitrum", to: address };
            
        case "VoteEthDepositAction":
        case "approveAgent":
            return { from: address, to: "" };
            
        case "order":
            // Pour les orders, le 'to' dépend du type d'ordre (t property)
            const orderType = tx.action.orders?.[0]?.t;
            let toValue = "";
            if (orderType) {
                const keys = Object.keys(orderType);
                if (keys.length > 0) {
                    toValue = keys[0]; // Prend le premier type (limit, trigger, market, etc.)
                }
            }
            return { from: address, to: toValue };
            
        case "accountClassTransfer":
            if (ledgerUpdate?.delta) {
                // Pour accountClassTransfer, utiliser toPerp pour déterminer la direction
                if (ledgerUpdate.delta.toPerp === true) {
                    return { from: "Spot", to: "Perp" };
                } else if (ledgerUpdate.delta.toPerp === false) {
                    return { from: "Perp", to: "Spot" };
                }
                // Fallback au comportement normal si toPerp n'est pas défini
                return {
                    from: ledgerUpdate.delta.user || address,
                    to: ledgerUpdate.delta.destination || address
                };
            }
            return { from: address, to: address };
            
        case "spotTransfer":
            if (ledgerUpdate?.delta) {
                return {
                    from: ledgerUpdate.delta.user || address,
                    to: ledgerUpdate.delta.destination || address
                };
            }
            return { from: address, to: address };
            
        case "withdraw":
            return { from: address, to: "Arbitrum" };
            
        default:
            return { from: address, to: address };
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
    const url = buildHyperliquidUiUrl('HYPERLIQUID_UI_INFO');
    return await fetchExternal(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'portfolio',
            user: address,
        }),
    });
}


export async function fetchTransfers(): Promise<TransferData[]> {
    try {
        const url = buildHypurrscanUrl('HYPURRSCAN_TRANSFERS');
        return await fetchExternal<TransferData[]>(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });
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
        const url = buildHypurrscanUrl('HYPURRSCAN_DEPLOYS');
        return await fetchExternal<DeployData[]>(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching deploys:', error);
        throw error;
    }
}

 