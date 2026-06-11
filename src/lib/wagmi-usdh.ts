import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, walletConnect } from "wagmi/connectors";

const hyperEvmMainnet = defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.hyperliquid.xyz/evm"] } },
});

const hyperEvmTestnet = defineChain({
  id: 998,
  name: "HyperEVM Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.hyperliquid-testnet.xyz/evm"] } },
});

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiUsdhConfig = createConfig({
  chains: [hyperEvmMainnet, hyperEvmTestnet],
  connectors: [
    injected(),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
  transports: {
    [hyperEvmMainnet.id]: http(),
    [hyperEvmTestnet.id]: http(),
  },
  ssr: true,
});
