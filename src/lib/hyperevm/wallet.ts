"use client";

import { createPublicClient, createWalletClient, custom, fallback, http, type Address, type EIP1193Provider } from "viem";
import { hyperEvm } from "viem/chains";

/**
 * Browser wallet bridge for HyperEVM mainnet (chain 999). Same contract as
 * the Elysium bridge: the page never sees a key, it asks the injected wallet
 * to switch network and to confirm each transaction itself.
 */

export { connectWallet, injectedWallet, walletChainId, walletError } from "@/lib/elysium/wallet";

const CHAIN_HEX = `0x${hyperEvm.id.toString(16)}`;
const RPC = "https://rpc.hyperliquid.xyz/evm";

export const hyperEvmClient = createPublicClient({
  chain: hyperEvm,
  transport: fallback([http(RPC, { retryCount: 2, retryDelay: 600 })]),
});

/** Switches the wallet to HyperEVM, adding the network first if it does not know it. */
export async function switchToHyperEvm(provider: EIP1193Provider): Promise<void> {
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] });
  } catch (e) {
    const code = (e as { code?: number; data?: { originalError?: { code?: number } } }).code ?? (e as { data?: { originalError?: { code?: number } } }).data?.originalError?.code;
    if (code !== 4902) throw e;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_HEX,
          chainName: "HyperEVM",
          nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
          rpcUrls: [RPC],
          blockExplorerUrls: ["https://hyperevmscan.io"],
        },
      ],
    });
  }
}

/** Wallet client bound to HyperEVM: viem refuses to sign if the wallet sits on another chain. */
export function hyperEvmWallet(provider: EIP1193Provider, account: Address) {
  return createWalletClient({ account, chain: hyperEvm, transport: custom(provider) });
}
