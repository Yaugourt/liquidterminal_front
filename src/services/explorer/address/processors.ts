import { UserTransaction, UserFill, NonFundingLedgerUpdate, FormattedUserTransaction } from './types';
import { getTransactionAddresses, formatAge, mergeFillsByHash } from './utils';

const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

export function processFillTransactions(fills: UserFill[], address: string): FormattedUserTransaction[] {
    return mergeFillsByHash(fills).map(fill => {
        const isClosePosition = fill.dir.toLowerCase().includes('close');
        const isShort = fill.dir.toLowerCase().includes('short');
        const isLong = fill.dir.toLowerCase().includes('long');
        
        // Le prix reste toujours positif, la logique de signe est sur le montant
        const displayPrice = fill.px;
        
        return {
            hash: fill.hash,
            method: fill.dir,
            age: formatAge(fill.time),
            from: isClosePosition ? HIP2_ADDRESS : address,
            to: isClosePosition ? address : HIP2_ADDRESS,
            amount: fill.sz,
            token: fill.coin,
            price: displayPrice,
            total: (Number(fill.px) * Number(fill.sz)).toFixed(2),
            time: fill.time,
            isShort: isShort,
            isLong: isLong
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
            
            // Récupérer le prix depuis userFills si disponible
            const fill = fillsMap?.get(tx.hash);
            const isShort = fill?.dir.toLowerCase().includes('short');
            const isLong = fill?.dir.toLowerCase().includes('long');
            const displayPrice = fill ? fill.px : undefined;
            
            return {
                hash: tx.hash,
                method: tx.action.type,
                age: formatAge(tx.time),
                from: addresses.from,
                to: addresses.to,
                amount,
                token: order?.a?.toString() || tx.action.token || "unknown",
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