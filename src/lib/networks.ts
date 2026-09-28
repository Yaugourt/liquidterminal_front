/** Networks Liquid Terminal can show. Adding one = one entry here. */
export type NetworkId = "hyperliquid" | "elysium";

export interface NetworkDef {
  id: NetworkId;
  label: string;
  /** Short status shown next to the label (testnet networks say so). */
  status: string;
  /** Where the switch lands. */
  home: string;
}

export const NETWORKS: Record<NetworkId, NetworkDef> = {
  hyperliquid: { id: "hyperliquid", label: "Hyperliquid", status: "Mainnet", home: "/dashboard" },
  elysium: { id: "elysium", label: "Elysium", status: "Testnet", home: "/elysium" },
};

/** The active network follows the URL, so every page is shareable as-is. */
export function networkFromPath(pathname: string | null | undefined): NetworkId {
  return pathname?.startsWith("/elysium") ? "elysium" : "hyperliquid";
}
