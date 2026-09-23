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
    /** `href` points off-site (block explorer…): open it in a new tab. */
    external?: boolean;
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
    external = false,
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
            {external ? (
                <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-brand hover:text-brand-hover transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {label || displayAddress}
                </a>
            ) : (
                <Link
                    href={linkHref}
                    className="mono text-brand hover:text-brand-hover transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {label || displayAddress}
                </Link>
            )}

            {showCopy && (
                <button
                    onClick={handleCopy}
                    className="group p-0.5 rounded-md hover:bg-surface-2 transition-colors"
                    aria-label="Copy address"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-success" />
                    ) : (
                        <Copy className="h-3 w-3 text-text-tertiary group-hover:text-text-primary transition-colors" />
                    )}
                </button>
            )}

            {showExternalLink && (
                externalLinkHref ? (
                    <Link
                        href={externalLinkHref}
                        className="text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded-md hover:bg-surface-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                ) : (
                    <a
                        href={`https://app.hyperliquid.xyz/explorer/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded-md hover:bg-surface-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )
            )}
        </div>
    );
}
