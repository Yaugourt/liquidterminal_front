import { createPublicClient, defineChain, fallback, http, parseAbi, type Address, type Hex } from "viem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { ELYSIUM_RPC_URL } from "./api";

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

/** Second public Elysium RPC: CORS open and no rate limit hit in testing, unlike the default one. */
export const ELYSIUM_ALT_RPC_URL = "https://elysium-testnet-rpc.hypedexer.com";

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

export interface SimCall {
  from: Address;
  to: Address;
  value: bigint;
  data: Hex;
  /** Credit `from` with this balance for the simulation only (state override). */
  fundWei?: bigint;
}

export interface SimLog { address: Address; topics: Hex[]; data: Hex }

export interface SimResult {
  status: "success" | "reverted";
  /** Execution gas from eth_simulateV1 (L2 only). */
  gasUsed: bigint;
  /** eth_estimateGas, L1 posting cost included; null when the call reverts. */
  gasEstimate: bigint | null;
  gasPriceWei: bigint;
  returnData: Hex;
  logs: SimLog[];
  revertData: Hex | null;
  revertMessage: string | null;
  block: number;
}

/** The ERC-7528 pseudo-address traceTransfers uses for native HYPE movements. */
export const NATIVE_TRANSFER_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const hex = (n: bigint) => `0x${n.toString(16)}` as Hex;

interface RawSimCall { status: Hex; gasUsed: Hex; returnData: Hex; logs: SimLog[]; error?: { message?: string; data?: Hex } }

/**
 * Dry-runs one call against the latest Elysium state with eth_simulateV1
 * (native transfers traced as logs) and prices it with eth_estimateGas.
 * Nothing is signed or sent.
 */
export async function simulateElysiumCall(call: SimCall): Promise<SimResult> {
  const c = elysiumClient;
  const overrides = call.fundWei ? { [call.from]: { balance: hex(call.fundWei) } } : undefined;
  const tx = { from: call.from, to: call.to, value: hex(call.value), data: call.data };
  const [blocks, gasPriceWei, gasEstimate] = await Promise.all([
    c.request({
      method: "eth_simulateV1" as never,
      params: [{ blockStateCalls: [{ stateOverrides: overrides, calls: [tx] }], traceTransfers: true, validation: false }, "latest"] as never,
    }) as Promise<{ number: Hex; calls: RawSimCall[] }[]>,
    c.getGasPrice(),
    c
      .request({ method: "eth_estimateGas" as never, params: (overrides ? [tx, "latest", overrides] : [tx, "latest"]) as never })
      .then((g) => BigInt(g as Hex))
      .catch(() => null),
  ]);
  const r = blocks[0].calls[0];
  const ok = r.status === "0x1";
  return {
    status: ok ? "success" : "reverted",
    gasUsed: BigInt(r.gasUsed),
    gasEstimate: ok ? gasEstimate : null,
    gasPriceWei,
    returnData: r.returnData,
    logs: r.logs.map((l) => ({ address: l.address, topics: l.topics, data: l.data })),
    revertData: r.error?.data ?? null,
    revertMessage: r.error?.message ?? null,
    block: Number(BigInt(blocks[0].number)),
  };
}

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
