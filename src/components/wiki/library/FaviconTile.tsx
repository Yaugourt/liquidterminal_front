"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaviconTileProps {
  favicon?: string | null;
  /** Hostname used for the initial fallback and alt text. */
  hostname: string;
  /** Tile square size in px (default 24). */
  size?: number;
  className?: string;
}

/**
 * Small source tile: the site's favicon, falling back to the domain
 * initial when missing or broken. Shared by the library table and rails.
 */
export function FaviconTile({ favicon, hostname, size = 24, className }: FaviconTileProps) {
  const [errored, setErrored] = useState(false);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-md bg-surface-2 text-text-secondary",
        className
      )}
      style={{ width: size, height: size }}
    >
      {favicon && !errored ? (
        <Image
          src={favicon}
          alt={hostname}
          width={Math.round(size * 0.66)}
          height={Math.round(size * 0.66)}
          className="rounded-sm"
          onError={() => setErrored(true)}
          unoptimized
        />
      ) : (
        <span className="select-none text-[10px] font-semibold uppercase">
          {hostname.charAt(0)}
        </span>
      )}
    </span>
  );
}
