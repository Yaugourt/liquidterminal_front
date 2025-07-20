import { UserTransaction, UserFill, NonFundingLedgerUpdate, FormattedUserTransaction } from './types';
import { HIP2_ADDRESS } from './hooks/useTransactions';

// Helper function pour déterminer from/to selon le type de transaction
export function getTransactionAddresses(tx: UserTransaction, address: string, ledgerUpdate?: any) {
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
            
        case "cStakingTransfer":
            return { from: "Spot", to: "Staking" };
            
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

export function formatAge(timestamp: number): string {
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

// HIP2 business logic functions
export function getFillAddresses(fill: any, address: string, isSpot: boolean, isShort: boolean, isLong: boolean, isClosePosition: boolean) {
    const fromAddress = isSpot ? (isShort ? address : 'HIP2') : (isClosePosition ? HIP2_ADDRESS : address);
    const toAddress = isSpot ? (isLong ? address : 'HIP2') : (isClosePosition ? address : HIP2_ADDRESS);
    return { from: fromAddress, to: toAddress };
}

export function getTwapOrderAddresses(order: any, address: string) {
    return {
        from: order.b ? HIP2_ADDRESS : address,
        to: order.b ? address : HIP2_ADDRESS
    };
}

export function isHip2Address(address: string): boolean {
    return address === HIP2_ADDRESS;
}

export function formatHip2Display(address: string): string {
    return address === HIP2_ADDRESS ? 'HIP2' : address;
}

export function mergeFillsByHash(fills: UserFill[]): UserFill[] {
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