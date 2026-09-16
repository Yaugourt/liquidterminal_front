"use client";

import { useState } from "react";
import Image from "next/image";

const SIZE_CLASS = { sm: "w-5 h-5 text-[9px]", md: "w-6 h-6 text-[10px]", lg: "w-8 h-8 text-[11px]" } as const;
const SIZE_PX = { sm: 20, md: 24, lg: 32 } as const;

interface ProtocolAvatarProps {
  name: string;
  logo: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

const initials = (name: string): string =>
  name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/**
 * Logo square for a HyperEVM protocol or token when the source is an
 * arbitrary URL (Hyperfolio / DeBank), not the Hyperliquid asset CDN that
 * `TokenAvatar` resolves. Same chrome as `TokenAvatar`, initials on error.
 */
export function ProtocolAvatar({ name, logo, size = "md", className = "" }: ProtocolAvatarProps) {
  const [errored, setErrored] = useState(false);
  const px = SIZE_PX[size];
  return (
    <span
      className={`${SIZE_CLASS[size]} shrink-0 rounded-md flex items-center justify-center font-semibold bg-brand/10 text-brand overflow-hidden ${className}`}
    >
      {errored || !logo ? (
        initials(name)
      ) : (
        <Image
          src={logo}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
          unoptimized
        />
      )}
    </span>
  );
}
