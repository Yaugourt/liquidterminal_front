"use client";

import type { ReactNode } from "react";
import { AddressDigest } from "./digest";

export type AddressSummaryVariant = "explorer" | "tracker";

interface AddressSummaryProps {
  address: string;
  /**
   * Controls the summary layout — both variants are the same digest model
   * (`useAddressDigest`), differently laid out:
   * - `explorer` (default): KPI ribbon + insights, the profile, then the tabs.
   * - `tracker`: KPI ribbon, performance chart beside the insights, the
   *   profile, then the tabs — with HyperEVM balances folded in.
   */
  variant?: AddressSummaryVariant;
  /** Tab bar + panels, placed at the bottom, after the detailed profile. */
  children: ReactNode;
  onShowPositions?: () => void;
}

/** Unified summary for the address analytics page, wrapped around the tabs. */
export function AddressSummary({ address, variant = "explorer", children, onShowPositions }: AddressSummaryProps) {
  return (
    <AddressDigest address={address} variant={variant} onShowPositions={onShowPositions}>
      {children}
    </AddressDigest>
  );
}
