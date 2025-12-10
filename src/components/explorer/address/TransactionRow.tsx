import React from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { formatHash, isHip2Address } from '@/services/explorer/address';
import {
    getTokenPrice,
    getTokenName,
    calculateValueWithDirection,
    formatAmountWithDirection,
    getAmountColorClass,
    TransactionType
} from '@/services/explorer/address';
import { AddressDisplay } from "@/components/ui/address-display";

import { SpotToken } from '@/services/market/spot/types';
import { PerpMarketData } from '@/services/market/perp/types';
import { NumberFormatType } from "@/store/number-format.store";

interface FormatterConfig {
    spotTokens?: SpotToken[];
    perpMarkets?: PerpMarketData[];
    format: NumberFormatType;
    currentAddress?: string;
}

interface TransactionRowProps {
    tx: TransactionType;
    formatterConfig: FormatterConfig;
    currentAddress?: string;
}

export function TransactionRow({ tx, formatterConfig, currentAddress }: TransactionRowProps) {
    const { spotTokens, perpMarkets, format } = formatterConfig;
    const tokenName = getTokenName(tx.token, spotTokens, perpMarkets);
    const tokenPrice = getTokenPrice(tokenName, spotTokens);

    // Copy state is handled locally per row for simplicity or could be lifted.
    // For now, implementing local copy state.
    const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

    const copyHashToClipboard = async (hash: string) => {
        try {
            await navigator.clipboard.writeText(hash);
            setCopiedHash(hash);
            setTimeout(() => setCopiedHash(null), 2000);
        } catch {
            // Error handled silently
        }
    };

    const renderAddressCell = (address: string) => {
        if (!address) {
            return (
                <TableCell className="py-3 px-4 text-sm text-white">
                    <span>-</span>
                </TableCell>
            );
        }

        // Special cases
        if (["Spot", "Perp", "Staking"].includes(address)) {
            return (
                <TableCell className="py-3 px-4 text-sm text-white">
                    <span>{address}</span>
                </TableCell>
            );
        }

        if (address === "Arbitrum") {
            return (
                <TableCell className="py-3 px-4 text-sm">
                    <Link
                        href={`https://arbiscan.io/address/${currentAddress}#tokentxns`}
                        className="text-brand-accent hover:text-brand-accent/80 truncate block"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {address}
                    </Link>
                </TableCell>
            );
        }

        if (isHip2Address(address)) {
            return (
                <TableCell className="py-3 px-4 text-sm">
                    <Link
                        href={`/explorer/address/${address}`}
                        className="text-brand-accent hover:text-brand-accent/80 truncate block"
                    >
                        HIP2
                    </Link>
                </TableCell>
            );
        }

        // Standard address with AddressDisplay
        // Note: TransactionList logic for currentAddress was custom with a copy button.
        // AddressDisplay supports this.

        // Logic from original:
        // if (currentAddress && address.toLowerCase() === currentAddress.toLowerCase()) ...

        const isCurrent = !!currentAddress && address.toLowerCase() === currentAddress.toLowerCase();

        return (
            <TableCell className="py-3 px-4 text-sm">
                <AddressDisplay
                    address={address}
                    showCopy={isCurrent} // Only show copy if it's current address in original logic?
                    // actually original logic had copy button for current address, and link for others.
                    // AddressDisplay by default has link + copy if enabled.
                    // Let's use AddressDisplay fully but customize styling matching original if needed.
                    // Original:
                    // Current: Text + Copy Button
                    // Other: Link (text-brand-accent)

                    showExternalLink={false}
                    className={isCurrent ? "text-white" : "text-brand-accent"}
                    href={isCurrent ? undefined : `/explorer/address/${address}`} // Disable link for current address?
                // Original had NO link for current address, just text.
                />
            </TableCell>
        );
    };

    return (
        <TableRow
            className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
        >
            <TableCell className="py-3 px-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <Link
                        href={`/explorer/transaction/${tx.hash}`}
                        prefetch={false}
                        className="text-brand-accent hover:text-brand-accent/80 transition-colors"
                        title={tx.hash}
                    >
                        {formatHash(tx.hash)}
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            copyHashToClipboard(tx.hash);
                        }}
                        className="group p-1 rounded transition-colors"
                    >
                        {copiedHash === tx.hash ? (
                            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                    </button>
                </div>
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-white">
                {tx.method === 'accountClassTransfer' || tx.method === 'cStakingTransfer' ? 'Internal Transfer' : tx.method}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-white">{tx.age}</TableCell>
            {renderAddressCell(tx.from)}
            {renderAddressCell(tx.to)}
            <TableCell className={`py-3 px-4 text-sm ${getAmountColorClass(tx, formatterConfig)}`}>
                {formatAmountWithDirection(tx, formatterConfig)}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-white text-right">
                {tx.price ? formatNumber(parseFloat(tx.price), format, {
                    currency: '$',
                    showCurrency: true,
                    minimumFractionDigits: 4
                }) : (tokenPrice > 0 ? formatNumber(tokenPrice, format, {
                    currency: '$',
                    showCurrency: true,
                    minimumFractionDigits: 4
                }) : '-')}
            </TableCell>
            <TableCell className="py-3 px-4 text-sm text-white text-right">
                {calculateValueWithDirection(tx, formatterConfig)}
            </TableCell>
        </TableRow>
    );
}
