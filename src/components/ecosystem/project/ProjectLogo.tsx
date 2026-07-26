"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Project logo with an initials fallback — several r2.dev logos 404 in prod,
 * so the broken-image glyph would otherwise leak into every project list.
 */
export function ProjectLogo({
  logo,
  name,
  size = 24,
  muted,
}: {
  logo: string;
  name: string;
  /** Square side in px. */
  size?: number;
  muted?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <span
        className={`rounded bg-surface-2 border border-border-subtle grid place-items-center text-[8px] font-semibold shrink-0 ${
          muted ? "text-text-tertiary" : "text-text-secondary"
        }`}
        style={{ width: size, height: size }}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={logo}
      alt={name}
      width={size}
      height={size}
      className="rounded object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  );
}
