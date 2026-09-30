import { createPublicClient, formatUnits, http, parseAbi } from "viem";
import { ELYSIUM_CHAIN } from "@/lib/elysium-chain";

/**
 * Server-side Elysium chain reads for share tiles. The client-side reader
 * (services/elysium/rpc.ts) ships React hooks, which route handlers cannot
 * import. Reads are folded into one Multicall3 call.
 */
const client = createPublicClient({
  chain: {
    id: ELYSIUM_CHAIN.chainId,
    name: "Elysium Testnet",
    nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
    rpcUrls: { default: { http: [ELYSIUM_CHAIN.rpc] } },
    contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  },
  batch: { multicall: true },
  transport: http(ELYSIUM_CHAIN.rpc, { retryCount: 2, retryDelay: 800 }),
});

const SYS = parseAbi(["function arbOSVersion() view returns (uint256)"]);
const GAS = parseAbi([
  "function getPricesInWei() view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
  "function getGasAccountingParams() view returns (uint256,uint256,uint256)",
]);
const WASM = parseAbi(["function stylusVersion() view returns (uint16)"]);
const RETRY = parseAbi(["function getLifetime() view returns (uint256)"]);

export interface ElysiumSpecs {
  chainId: number;
  head: number;
  arbOS: number;
  stylus: number | null;
  blockTimeS: number;
  sampleBlocks: number;
  gasPriceGwei: number;
  perByteGwei: number;
  speedLimit: number;
  txGasLimit: number;
  transferHype: number;
  retryableDays: number;
}

export const elysiumHead = () => client.getBlockNumber();

export async function readElysiumSpecs(sample = 500): Promise<ElysiumSpecs> {
  const head = await client.getBlock();
  const [past, gasPrice, arbOS, prices, acct, stylus, lifetime, transferGas] = await Promise.all([
    client.getBlock({ blockNumber: head.number - BigInt(sample) }),
    client.getGasPrice(),
    client.readContract({ address: "0x0000000000000000000000000000000000000064", abi: SYS, functionName: "arbOSVersion" }),
    client.readContract({ address: "0x000000000000000000000000000000000000006C", abi: GAS, functionName: "getPricesInWei" }),
    client.readContract({ address: "0x000000000000000000000000000000000000006C", abi: GAS, functionName: "getGasAccountingParams" }),
    client.readContract({ address: "0x0000000000000000000000000000000000000071", abi: WASM, functionName: "stylusVersion" }).catch(() => null),
    client.readContract({ address: "0x000000000000000000000000000000000000006E", abi: RETRY, functionName: "getLifetime" }),
    client.estimateGas({ account: "0x0000000000000000000000000000000000000001", to: "0x0000000000000000000000000000000000000002", value: 0n }),
  ]);
  return {
    chainId: ELYSIUM_CHAIN.chainId,
    head: Number(head.number),
    // ArbSys.arbOSVersion() returns 55 + the ArbOS version.
    arbOS: Number(arbOS) - 55,
    stylus: stylus == null ? null : Number(stylus),
    blockTimeS: Number(head.timestamp - past.timestamp) / sample,
    sampleBlocks: sample,
    gasPriceGwei: Number(formatUnits(gasPrice, 9)),
    perByteGwei: Number(formatUnits(prices[1], 9)),
    speedLimit: Number(acct[0]),
    txGasLimit: Number(acct[2]),
    transferHype: Number(formatUnits(transferGas * gasPrice, 18)),
    retryableDays: Math.round(Number(lifetime) / 86400),
  };
}
