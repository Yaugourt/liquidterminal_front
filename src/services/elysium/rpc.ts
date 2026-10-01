import { createPublicClient, defineChain, fallback, http, parseAbi, type Address } from "viem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { ELYSIUM_RPC_URL } from "./api";
import { ELYSIUM_ALT_RPC_URL } from "@/lib/elysium-chain";
import { simulateCall, simulateDeploy, type DeployCall, type SimCall } from "@/lib/elysium/simulate";

/** Elysium testnet as a viem chain (chain id and currency read from the RPC). */
export const elysiumTestnet = defineChain({
  id: 99801,
  name: "Elysium Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: [ELYSIUM_RPC_URL] } },
  blockExplorers: { default: { name: "Elysium Explorer", url: "https://test-explorer.elysium.kinetiq.xyz" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  testnet: true,
});

export { ELYSIUM_ALT_RPC_URL } from "@/lib/elysium-chain";

// Contract reads are folded into one Multicall3 eth_call; either RPC can serve.
export const elysiumClient = createPublicClient({
  chain: elysiumTestnet,
  batch: { multicall: true },
  transport: fallback([http(ELYSIUM_ALT_RPC_URL, { retryCount: 1 }), http(ELYSIUM_RPC_URL, { retryCount: 2, retryDelay: 800 })]),
});

/** Arbitrum precompiles, identical on every Nitro chain. */
export const PRECOMPILE = {
  ArbSys: "0x0000000000000000000000000000000000000064",
  ArbInfo: "0x0000000000000000000000000000000000000065",
  ArbAddressTable: "0x0000000000000000000000000000000000000066",
  ArbOwnerPublic: "0x000000000000000000000000000000000000006b",
  ArbGasInfo: "0x000000000000000000000000000000000000006C",
  ArbAggregator: "0x000000000000000000000000000000000000006D",
  ArbRetryableTx: "0x000000000000000000000000000000000000006E",
  ArbStatistics: "0x000000000000000000000000000000000000006F",
  ArbWasm: "0x0000000000000000000000000000000000000071",
  ArbWasmCache: "0x0000000000000000000000000000000000000072",
  NodeInterface: "0x00000000000000000000000000000000000000C8",
} as const satisfies Record<string, Address>;

const ABI = {
  sys: parseAbi(["function arbOSVersion() view returns (uint256)"]),
  gas: parseAbi([
    "function getPricesInWei() view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
    "function getL1BaseFeeEstimate() view returns (uint256)",
    "function getMinimumGasPrice() view returns (uint256)",
    "function getGasAccountingParams() view returns (uint256,uint256,uint256)",
  ]),
  owner: parseAbi(["function getAllChainOwners() view returns (address[])", "function getNetworkFeeAccount() view returns (address)"]),
  retry: parseAbi(["function getLifetime() view returns (uint256)"]),
  wasm: parseAbi(["function stylusVersion() view returns (uint16)"]),
};

export interface ElysiumNetworkInfo {
  chainId: number;
  /** ArbSys.arbOSVersion() returns 55 + the ArbOS version. */
  arbOS: number;
  stylusVersion: number | null;
  clientVersion: string;
  head: number;
  /** Mean block interval over the last `sampleBlocks` blocks, seconds. */
  blockTimeS: number;
  sampleBlocks: number;
  gasPriceWei: bigint;
  minGasPriceWei: bigint;
  prices: { perL2Tx: bigint; perL1CalldataByte: bigint; perStorageAlloc: bigint; perArbGasBase: bigint; perArbGasCongestion: bigint; perArbGasTotal: bigint };
  l1BaseFeeEstimateWei: bigint;
  speedLimitGasPerS: bigint;
  txGasLimit: bigint;
  chainOwners: Address[];
  networkFeeAccount: Address;
  retryableLifetimeS: number;
  /** eth_estimateGas of a plain HYPE transfer, L1 posting cost included. */
  plainTransferGas: bigint;
}

const SAMPLE = 500;

/** Live network parameters, read from the public RPC and the Arbitrum precompiles. */
export async function fetchElysiumNetwork(): Promise<ElysiumNetworkInfo> {
  const c = elysiumClient;
  const read = <T,>(address: Address, abi: readonly unknown[], functionName: string) =>
    c.readContract({ address, abi: abi as never, functionName: functionName as never }) as Promise<T>;
  const head = await c.getBlock();
  const [past, chainId, clientVersion, gasPriceWei, arbOSRaw, prices, l1, minGas, acct, owners, feeAcct, lifetime, stylus, plain] = await Promise.all([
    c.getBlock({ blockNumber: head.number - BigInt(SAMPLE) }),
    c.getChainId(),
    c.request({ method: "web3_clientVersion" as never }) as Promise<string>,
    c.getGasPrice(),
    read<bigint>(PRECOMPILE.ArbSys, ABI.sys, "arbOSVersion"),
    read<readonly bigint[]>(PRECOMPILE.ArbGasInfo, ABI.gas, "getPricesInWei"),
    read<bigint>(PRECOMPILE.ArbGasInfo, ABI.gas, "getL1BaseFeeEstimate"),
    read<bigint>(PRECOMPILE.ArbGasInfo, ABI.gas, "getMinimumGasPrice"),
    read<readonly bigint[]>(PRECOMPILE.ArbGasInfo, ABI.gas, "getGasAccountingParams"),
    read<readonly Address[]>(PRECOMPILE.ArbOwnerPublic, ABI.owner, "getAllChainOwners"),
    read<Address>(PRECOMPILE.ArbOwnerPublic, ABI.owner, "getNetworkFeeAccount"),
    read<bigint>(PRECOMPILE.ArbRetryableTx, ABI.retry, "getLifetime"),
    read<number>(PRECOMPILE.ArbWasm, ABI.wasm, "stylusVersion").catch(() => null),
    c.estimateGas({ account: "0x0000000000000000000000000000000000000001", to: "0x0000000000000000000000000000000000000002", value: 0n }),
  ]);
  return {
    chainId,
    arbOS: Number(arbOSRaw) - 55,
    stylusVersion: stylus == null ? null : Number(stylus),
    clientVersion,
    head: Number(head.number),
    blockTimeS: Number(head.timestamp - past.timestamp) / SAMPLE,
    sampleBlocks: SAMPLE,
    gasPriceWei,
    minGasPriceWei: minGas,
    prices: {
      perL2Tx: prices[0], perL1CalldataByte: prices[1], perStorageAlloc: prices[2],
      perArbGasBase: prices[3], perArbGasCongestion: prices[4], perArbGasTotal: prices[5],
    },
    l1BaseFeeEstimateWei: l1,
    speedLimitGasPerS: acct[0],
    txGasLimit: acct[2],
    chainOwners: [...owners],
    networkFeeAccount: feeAcct,
    retryableLifetimeS: Number(lifetime),
    plainTransferGas: plain,
  };
}

export const useElysiumNetwork = () =>
  useDataFetching<ElysiumNetworkInfo>({ fetchFn: fetchElysiumNetwork, refreshInterval: 60_000, maxRetries: 1 });

// ── Simulation ───────────────────────────────────────────────────────────────

export {
  MAX_INITCODE_BYTES,
  MAX_RUNTIME_BYTES,
  NATIVE_TRANSFER_ADDRESS,
  type DeployCall,
  type DeploySimResult,
  type SimCall,
  type SimFollowUp,
  type SimLog,
  type SimResult,
} from "@/lib/elysium/simulate";

/** Dry-runs one call against the latest Elysium state. Nothing is signed or sent. */
export const simulateElysiumCall = (call: SimCall) => simulateCall(elysiumClient, call);

/** Dry-runs a contract creation, plus an optional call on the new contract. */
export const simulateElysiumDeploy = (call: DeployCall) => simulateDeploy(elysiumClient, call);

/** ERC-20 symbol and decimals for the tokens touched by a simulation. */
export async function fetchTokenMeta(addresses: Address[]): Promise<Record<string, { symbol: string; decimals: number }>> {
  const abi = parseAbi(["function symbol() view returns (string)", "function decimals() view returns (uint8)"]);
  const out: Record<string, { symbol: string; decimals: number }> = {};
  await Promise.all(
    addresses.map(async (a) => {
      try {
        const [symbol, decimals] = await Promise.all([
          elysiumClient.readContract({ address: a, abi, functionName: "symbol" }),
          elysiumClient.readContract({ address: a, abi, functionName: "decimals" }),
        ]);
        out[a.toLowerCase()] = { symbol, decimals: Number(decimals) };
      } catch {
        // Not an ERC-20 (or a non-standard one): amounts stay raw.
      }
    })
  );
  return out;
}
