import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ElysiumNet = "testnet" | "mainnet";

/**
 * Elysium mainnet (chain 99901) goes public on 9 Nov 2026. Until this flag is
 * flipped the network switch stays hidden; `?network=mainnet` on any Elysium
 * page previews it.
 */
export const ELYSIUM_MAINNET_PUBLIC = false;

export const ELYSIUM_CHAIN_ID: Record<ElysiumNet, number> = { testnet: 99801, mainnet: 99901 };

interface ElysiumNetworkState {
  network: ElysiumNet;
  setNetwork: (network: ElysiumNet) => void;
}

/** Which Elysium chain the section reads. Persisted per browser. */
export const useElysiumNetwork = create<ElysiumNetworkState>()(
  persist((set) => ({ network: "testnet", setNetwork: (network) => set({ network }) }), { name: "elysium-network" })
);

/** For plain fetchers outside React. */
export const currentElysiumNetwork = (): ElysiumNet => useElysiumNetwork.getState().network;
