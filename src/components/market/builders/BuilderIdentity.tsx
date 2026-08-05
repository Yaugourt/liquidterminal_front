"use client";

import { useState } from "react";
import Image from "next/image";
import { avatarColor } from "@/lib/avatarColor";
import { builderBrand, builderLogoUrl } from "@/lib/builderBrands";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

/**
 * Builder mark: the brand logo when we have one, otherwise the deterministic
 * initial avatar. Falls back on load error too — R2 objects can 404 after a
 * bucket cleanup and a broken-image glyph in every table row is worse than
 * the initial.
 */
export function BuilderAvatar({
  address,
  label,
  size = 20,
  className = "",
}: {
  address: string;
  /** Text the initial is derived from. */
  label: string;
  /** Square side in px. */
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const logo = builderLogoUrl(address);
  const isAnonymous = label === "—" || label === "";

  if (logo && !failed) {
    return (
      <Image
        src={logo}
        alt=""
        width={size}
        height={size}
        className={`rounded object-cover shrink-0 bg-surface-3 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  const initial = isAnonymous ? "?" : label.charAt(0).toUpperCase();
  const color = isAnonymous ? null : avatarColor(address);
  return (
    <div
      className={`rounded shrink-0 flex items-center justify-center font-semibold ${
        color ? "" : "bg-surface-3 text-text-secondary"
      } ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.5)),
        ...(color ? { background: `${color}22`, color } : {}),
      }}
    >
      {initial}
    </div>
  );
}

/**
 * Resolves what a builder row should read as: the curated brand when known,
 * the on-chain builder code otherwise, and a truncated address as last resort.
 */
export function resolveBuilderLabel(
  address: string,
  indexerName: string | null | Record<string, unknown> | undefined
): { label: string; code: string | null; isAnonymous: boolean } {
  const code = formatBuilderDisplayName(indexerName);
  const brand = builderBrand(address);
  if (brand) {
    // Hide the code when it is just the brand shouted in caps (PVP / pvp.trade).
    const redundant =
      code !== "—" && code.replace(/[^a-z0-9]/gi, "").toLowerCase() ===
        brand.name.replace(/[^a-z0-9]/gi, "").toLowerCase();
    return { label: brand.name, code: redundant || code === "—" ? null : code, isAnonymous: false };
  }
  if (code !== "—") return { label: code, code: null, isAnonymous: false };
  return {
    label: `${address.slice(0, 6)}…${address.slice(-4)}`,
    code: null,
    isAnonymous: true,
  };
}

/**
 * Table cell for a builder: logo + brand name, with the raw on-chain builder
 * code kept alongside as a muted chip when it differs from the brand.
 */
export function BuilderIdentity({
  address,
  name,
  size = 20,
  showCode = true,
}: {
  address: string;
  /** Raw `builderName` from the indexer. */
  name: string | null | Record<string, unknown> | undefined;
  size?: number;
  showCode?: boolean;
}) {
  const { label, code, isAnonymous } = resolveBuilderLabel(address, name);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <BuilderAvatar address={address} label={isAnonymous ? "—" : label} size={size} />
      <span
        className={`text-xs truncate ${
          isAnonymous ? "mono text-text-secondary" : "text-text-primary font-medium"
        }`}
      >
        {label}
      </span>
      {showCode && code && (
        <span className="hidden lg:inline mono text-[10px] text-text-tertiary bg-surface-2 rounded px-1 py-px shrink-0">
          {code}
        </span>
      )}
    </div>
  );
}
