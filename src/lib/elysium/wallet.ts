"use client";

import { createWalletClient, custom, getAddress, type Address, type EIP1193Provider, type Hash, type Hex } from "viem";
import { ELYSIUM_CHAIN } from "@/lib/elysium-chain";
import { elysiumTestnet } from "@/services/elysium/rpc";

/**
 * Browser wallet bridge for Elysium deployments. The page never sees a key:
 * it asks the injected wallet (EIP-1193) for an account, makes it switch to
 * the Elysium testnet, and hands it one unsigned transaction the user
 * confirms in the wallet itself.
 */

const CHAIN_HEX = `0x${ELYSIUM_CHAIN.chainId.toString(16)}`;

export function injectedWallet(): EIP1193Provider | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as { ethereum?: EIP1193Provider }).ethereum ?? null);
}

export async function connectWallet(provider: EIP1193Provider): Promise<Address> {
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts[0]) throw new Error("The wallet returned no account");
  return getAddress(accounts[0]);
}

export async function walletChainId(provider: EIP1193Provider): Promise<number> {
  return Number(BigInt((await provider.request({ method: "eth_chainId" })) as string));
}

/** Switches the wallet to Elysium testnet, adding the network first if it does not know it. */
export async function switchToElysium(provider: EIP1193Provider): Promise<void> {
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
          chainName: "Elysium Testnet",
          nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
          rpcUrls: [ELYSIUM_CHAIN.rpc],
          blockExplorerUrls: [ELYSIUM_CHAIN.explorer],
        },
      ],
    });
  }
}

/**
 * Sends a contract creation from `account`. viem checks the wallet is on the
 * Elysium chain id before asking for a signature, so a wallet that switched
 * network in between is refused instead of deploying elsewhere.
 */
export async function sendDeployment(provider: EIP1193Provider, tx: { account: Address; data: Hex; value: bigint; gas: bigint }): Promise<Hash> {
  const wallet = createWalletClient({ account: tx.account, chain: elysiumTestnet, transport: custom(provider) });
  return wallet.sendTransaction({ account: tx.account, chain: elysiumTestnet, data: tx.data, value: tx.value, gas: tx.gas, to: null });
}

/** Wrapped HYPE on Elysium (a proxy; `deposit()` mints WHYPE 1:1 for the HYPE sent). */
export const ELYSIUM_WHYPE: Address = "0xcd57f65c2b0e5881cfc2e609f7cd53b746e1f234";

/** Wraps `value` wei of HYPE into WHYPE from `account`: a one-call first transaction. */
export async function sendWrapHype(provider: EIP1193Provider, account: Address, value: bigint): Promise<Hash> {
  const wallet = createWalletClient({ account, chain: elysiumTestnet, transport: custom(provider) });
  // deposit() selector
  return wallet.sendTransaction({ account, chain: elysiumTestnet, to: ELYSIUM_WHYPE, data: "0xd0e30db0", value });
}

/** Short message for wallet errors (user rejection reads as a plain sentence). */
export function walletError(e: unknown): string {
  const code = (e as { code?: number }).code;
  if (code === 4001) return "Request rejected in the wallet.";
  if (code === -32002) return "The wallet already has a pending request: open it to continue.";
  const msg = e instanceof Error ? (e as { shortMessage?: string }).shortMessage ?? e.message : String(e);
  return msg.split("\n")[0];
}
