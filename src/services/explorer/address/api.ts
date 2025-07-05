import { 
    UserTransactionsResponse,
    NonFundingLedgerUpdate,
    UserFill,
    FormattedUserTransaction,
    PortfolioApiResponse,
} from './types';
import { 
    fetchExternal, 
    buildHyperliquidRpcUrl,
    buildHyperliquidUrl,
    buildHyperliquidUiUrl,
} from '../../api/base';
import { 
    processFillTransactions, 
    processUserTransactions, 
    processOrphanLedgerUpdates 
} from './processors';


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
        const fillTransactions = processFillTransactions(fills, address);

        // Créer un Set des hashs déjà traités
        const processedHashes = new Set(fillTransactions.map(tx => tx.hash));
        const ledgerMap = new Map(ledgerUpdates.map(update => [update.hash, update]));
        const fillsMap = new Map(fills.map(fill => [fill.hash, fill]));

        // Traiter les autres transactions
        const otherTransactions = processUserTransactions(txsResponse.txs, address, processedHashes, ledgerMap, fillsMap);

        // Ajout des ledgerUpdates orphelins (withdraw/deposit sans tx brute associée)
        const allHashes = new Set([
            ...fillTransactions.map(tx => tx.hash),
            ...otherTransactions.map(tx => tx.hash)
        ]);
        const orphanLedgerTxs = processOrphanLedgerUpdates(ledgerUpdates, allHashes, address);

        // Combiner et trier les transactions
        const allTxs = [...fillTransactions, ...otherTransactions, ...orphanLedgerTxs].sort((a, b) => b.time - a.time);
    
        return allTxs;
    } catch (error) {
        console.error("Error formatting user transactions:", error);
        throw error;
    }
}

export async function fetchPortfolio(address: string): Promise<PortfolioApiResponse> {
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

 