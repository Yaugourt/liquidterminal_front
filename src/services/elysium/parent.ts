import { createPublicClient, defineChain, http } from "viem";
import { HYPEREVM_TESTNET_RPC_URL } from "@/lib/elysium-chain";

/** HyperEVM testnet, the chain Elysium settles on. */
export const hyperEvmTestnet = defineChain({
  id: 998,
  name: "HyperEVM Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: [HYPEREVM_TESTNET_RPC_URL] } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  testnet: true,
});

// One Multicall3 eth_call for every parent chain read: the public RPC rate limits bursts.
export const parentClient = createPublicClient({
  chain: hyperEvmTestnet,
  batch: { multicall: true },
  transport: http(HYPEREVM_TESTNET_RPC_URL, { retryCount: 2, retryDelay: 1_000 }),
});
