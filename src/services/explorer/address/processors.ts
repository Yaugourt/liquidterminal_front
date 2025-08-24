import { UserTransaction, UserFill, NonFundingLedgerUpdate, FormattedUserTransaction } from './types';
import { getTransactionAddresses, formatAge, mergeFillsByHash, getFillAddresses, getTwapOrderAddresses } from './utils';

export function processFillTransactions(fills: UserFill[], address: string): FormattedUserTransaction[] {
    return mergeFillsByHash(fills).map(fill => {
        const isSpot = fill.coin.startsWith('@');
        let isClosePosition = false;
        let isShort = false;
        let isLong = false;
        
        if (isSpot) {
            isLong = fill.dir === 'Buy';
            isShort = fill.dir === 'Sell';
            isClosePosition = false; // No close for spot
        } else {
            isClosePosition = fill.dir.toLowerCase().includes('close');
            isShort = fill.dir.toLowerCase().includes('short');
            isLong = fill.dir.toLowerCase().includes('long');
        }
        
        // Le prix reste toujours positif, la logique de signe est sur le montant
        const displayPrice = fill.px;
        
        const addresses = getFillAddresses(fill, address, isSpot, isShort, isLong, isClosePosition);
        
        return {
            hash: fill.hash,
            method: fill.dir,
            age: formatAge(fill.time),
            from: addresses.from,
            to: addresses.to,
            amount: fill.sz,
            token: fill.coin,
            price: displayPrice,
            total: (Number(fill.px) * Number(fill.sz)).toFixed(2),
            time: fill.time,
            isShort: isShort,
            isLong: isLong,
            isClose: isClosePosition
        };
    });
}

export function processUserTransactions(
    txs: UserTransaction[], 
    address: string, 
    processedHashes: Set<string>,
    ledgerMap: Map<string, NonFundingLedgerUpdate>,
    fillsMap?: Map<string, UserFill>
): FormattedUserTransaction[] {
    return txs
        .filter((tx: UserTransaction) => {
            if (processedHashes.has(tx.hash)) return false;
            if (tx.action.type === "evmRawTx" && !tx.action.orders?.[0]?.s) return false;
            if (tx.action.type === "withdraw3") return false;
            return true;
        })
        .map((tx: UserTransaction) => {
            let order;
            if (tx.action.type === 'order') {
                order = tx.action.orders?.[0];
            } else if (tx.action.type === 'twapOrder') {
                order = tx.action.twap;
            }

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
            
            if (tx.action.type === 'twapOrder' && order) {
                const twapAddresses = getTwapOrderAddresses(order, address);
                addresses.from = twapAddresses.from;
                addresses.to = twapAddresses.to;
            }
            
            // Récupérer le prix depuis userFills si disponible
            const fill = fillsMap?.get(tx.hash);
            const isShortFromFill = fill?.dir.toLowerCase().includes('short');
            const isLongFromFill = fill?.dir.toLowerCase().includes('long');
            
            const isShort = isShortFromFill || ((tx.action.type === 'order' || tx.action.type === 'twapOrder') && order && !order.b && order.a > 10000);
            const isLong = isLongFromFill || ((tx.action.type === 'order' || tx.action.type === 'twapOrder') && order && order.b && order.a > 10000);
            const displayPrice = fill ? fill.px : (order && 'p' in order ? order.p : undefined);
            
            return {
                hash: tx.hash,
                method: (tx.action.type === 'order' || tx.action.type === 'twapOrder') && order && order.a > 10000 ? (order.b ? 'Buy' : 'Sell') : tx.action.type,
                age: formatAge(tx.time),
                from: addresses.from,
                to: addresses.to,
                amount,
                token: order?.a?.toString() || (tx.action.token?.includes(':') ? tx.action.token.split(':')[0] : tx.action.token) || "unknown",
                price: displayPrice,
                time: tx.time,
                isShort: isShort || false,
                isLong: isLong || false
            };
        });
}

export function processOrphanLedgerUpdates(
    ledgerUpdates: NonFundingLedgerUpdate[],
    allHashes: Set<string>,
    address: string
): FormattedUserTransaction[] {
    return ledgerUpdates
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
} 