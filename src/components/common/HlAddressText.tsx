"use client";

import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { useHlName } from "@/services/names";

/**
 * An address as text: its .hl name (Hyperliquid Names) when it has one, else
 * the truncated hex. The full address stays in the tooltip.
 */
export function HlAddressText({ address, className }: { address: string; className?: string }) {
  const name = useHlName(address);
  return (
    <span className={className} title={address}>
      {name ?? truncateAddress(address)}
    </span>
  );
}
