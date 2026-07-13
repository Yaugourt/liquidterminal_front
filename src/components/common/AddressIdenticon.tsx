import { memo } from "react";

interface AddressIdenticonProps {
  address: string;
  /** Rendered size in px (width = height). */
  size?: number;
  className?: string;
}

/**
 * "Liquid Silhouette" identicon: the Hyperliquid drop as an avatar head
 * (terminal-ink variant). Deterministic: one address, one hue, everywhere.
 * Pure SVG, no request.
 */
function hashAddress(address: string): number {
  let h = 0;
  for (let i = 2; i < address.length; i++) {
    h = (h * 31 + address.charCodeAt(i)) >>> 0;
  }
  return h;
}

export const AddressIdenticon = memo(function AddressIdenticon({
  address,
  size = 20,
  className,
}: AddressIdenticonProps) {
  const hue = hashAddress(address) % 360;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: "9999px", flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="var(--surface-2, #141B2A)" />
      <g fill={`hsl(${hue} 75% 66%)`}>
        <path d="M 50 76 C 41 76 29 67 24 52 C 17 32 28 14 50 14 C 72 14 83 32 76 52 C 71 67 59 76 50 76 Z M 50 84 C 77 84 95 99 99 126 L 1 126 C 5 99 23 84 50 84 Z" />
      </g>
    </svg>
  );
});
