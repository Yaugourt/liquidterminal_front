"use client";

import {
  Activity,
  Wallet,
  ListOrdered,
  Timer,
  History,
  Layers,
  Coins,
  type LucideIcon,
} from "lucide-react";

export type AddressTabId =
  | "transactions"
  | "holdings"
  | "orders"
  | "twap"
  | "fills"
  | "vaults"
  | "staking";

export interface AddressTabDefinition {
  id: AddressTabId;
  label: string;
  icon: LucideIcon;
}

export const ADDRESS_TAB_REGISTRY: Record<AddressTabId, AddressTabDefinition> = {
  transactions: { id: "transactions", label: "Transactions", icon: Activity },
  holdings: { id: "holdings", label: "Holdings", icon: Wallet },
  orders: { id: "orders", label: "Orders", icon: ListOrdered },
  twap: { id: "twap", label: "TWAP", icon: Timer },
  fills: { id: "fills", label: "Recent Fills", icon: History },
  vaults: { id: "vaults", label: "Vaults", icon: Layers },
  staking: { id: "staking", label: "Staking", icon: Coins },
};

/** Full tab list, in the canonical order. */
export const ALL_ADDRESS_TABS: AddressTabId[] = [
  "transactions",
  "holdings",
  "orders",
  "twap",
  "fills",
  "vaults",
  "staking",
];

export function resolveTabs(ids?: AddressTabId[]): AddressTabDefinition[] {
  const source = ids && ids.length > 0 ? ids : ALL_ADDRESS_TABS;
  return source.map((id) => ADDRESS_TAB_REGISTRY[id]);
}
