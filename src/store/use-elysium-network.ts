import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ElysiumNet = "testnet" | "mainnet";

/**
 * Elysium mainnet (chain 99901) went live on 19 Oct 2026 and is public here
 * since 10 Nov 2026: the network switch shows and mainnet is the default. The
 * flag stays so the switch can be hidden again if the upstream mainnet data
 * ever regresses.
 */
export const ELYSIUM_MAINNET_PUBLIC = true;

export const ELYSIUM_CHAIN_ID: Record<ElysiumNet, number> = { testnet: 99801, mainnet: 99901 };

interface ElysiumNetworkState {
  network: ElysiumNet;
  setNetwork: (network: ElysiumNet) => void;
}

/** Which Elysium chain the section reads. Persisted per browser. */
export const useElysiumNetwork = create<ElysiumNetworkState>()(
  persist((set) => ({ network: "mainnet", setNetwork: (network) => set({ network }) }), { name: "elysium-network" })
);

/** For plain fetchers outside React. */
export const currentElysiumNetwork = (): ElysiumNet => useElysiumNetwork.getState().network;
