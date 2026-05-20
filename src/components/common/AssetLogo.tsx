"use client";

import { useState } from "react";
import Image from "next/image";

interface AssetLogoProps {
    assetName: string;
    isDelisted?: boolean;
    className?: string;
    showTickerOnly?: boolean;
}

export function AssetLogo({ assetName, isDelisted, className = "w-6 h-6", showTickerOnly = false }: AssetLogoProps) {
    const [hasError, setHasError] = useState(false);
    const ticker = assetName.split(':')[1] || assetName;
    const logoUrl = `https://app.hyperliquid.xyz/coins/${assetName}.svg`;

    if (hasError || showTickerOnly) {
        return (
            <div className={`${className} rounded-full bg-brand/20 flex items-center justify-center ${isDelisted ? 'opacity-50' : ''}`}>
                <span className="text-label text-brand">{ticker.charAt(0)}</span>
            </div>
        );
    }

    return (
        <div className={`${className} relative rounded-full overflow-hidden flex items-center justify-center ${isDelisted ? 'opacity-50' : ''}`}>
            <Image
                src={logoUrl}
                alt={assetName}
                fill
                className="object-cover"
                sizes="96px"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
