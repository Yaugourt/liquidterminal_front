"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { truncateAddress } from "@/lib/formatters/numberFormatting";

interface AddressDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
    truncate?: boolean;
    showCopy?: boolean;
    showExternalLink?: boolean;
    href?: string;
    className?: string;
    copyMessage?: string;
    label?: React.ReactNode;
    externalLinkHref?: string;
}

export function AddressDisplay({
    address,
    truncate = true,
    showCopy = true,
    showExternalLink = false,
    href,
    className,
    copyMessage = "Address copied to clipboard",
    label,
    externalLinkHref,
    ...props
}: AddressDisplayProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success(copyMessage);
        setTimeout(() => setCopied(false), 2000);
    };

    const safeAddress = address || "";
    const displayAddress = truncate ? truncateAddress(safeAddress) : safeAddress;
    const linkHref = href || `/explorer/address/${safeAddress}`;

    return (
        <div className={cn("inline-flex items-center gap-1.5", className)} {...props}>
            <Link
                href={linkHref}
                className="font-mono text-sm text-brand-accent hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {label || displayAddress}
            </Link>

            {showCopy && (
                <button
                    onClick={handleCopy}
                    className="text-text-muted hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/10"
                    aria-label="Copy address"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </button>
            )}

            {showExternalLink && (
                externalLinkHref ? (
                    <Link
                        href={externalLinkHref}
                        className="text-text-muted hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                ) : (
                    <a
                        href={`https://app.hyperliquid.xyz/explorer/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-white transition-colors p-0.5 rounded-md hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )
            )}
        </div>
    );
}
