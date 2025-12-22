"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
    text: string;
    className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Error handled silently
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "group p-1 rounded transition-colors",
                className
            )}
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100" />
            )}
        </button>
    );
}
