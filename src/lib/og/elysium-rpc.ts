import { createPublicClient, encodeFunctionData, fallback, formatUnits, http, maxUint256, parseAbi } from "viem";
import { ELYSIUM_ALT_RPC_URL, ELYSIUM_CHAIN } from "@/lib/elysium-chain";

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

/** Simulations go to the RPC without a rate limit first (eth_simulateV1 is heavier than a read). */
export const elysiumSimClient = createPublicClient({
  transport: fallback([http(ELYSIUM_ALT_RPC_URL, { retryCount: 1 }), http(ELYSIUM_CHAIN.rpc, { retryCount: 2, retryDelay: 800 })]),
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

export interface ElysiumActionCost {
  label: string;
  detail: string;
  /** eth_estimateGas, parent-chain posting cost included. */
  gas: number;
  feeHype: number;
}

const COST_FROM = "0x1111111111111111111111111111111111111111";
const WHYPE = "0xcd57f65c2b0e5881cfc2e609f7cd53b746e1f234";

/**
 * What everyday actions cost on Elysium right now: eth_estimateGas of real
 * transactions (the sender is credited by a state override, so nothing needs
 * funding) times the current gas price.
 */
export async function readElysiumActionCosts(deployData: `0x${string}`): Promise<{ gasPriceGwei: number; head: number; actions: ElysiumActionCost[] }> {
  const override = { [COST_FROM]: { balance: "0x56bc75e2d63100000" } };
  const est = (tx: Record<string, string>) =>
    elysiumSimClient
      .request({ method: "eth_estimateGas" as never, params: [{ from: COST_FROM, ...tx }, "latest", override] as never })
      .then((g) => BigInt(g as string));
  const approve = encodeFunctionData({
    abi: parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]),
    functionName: "approve",
    args: ["0x2222222222222222222222222222222222222222", maxUint256],
  });
  const [gasPrice, head, transfer, wrap, approveGas, deploy] = await Promise.all([
    elysiumSimClient.getGasPrice(),
    elysiumSimClient.getBlockNumber(),
    est({ to: "0x2222222222222222222222222222222222222222", value: "0xde0b6b3a7640000" }),
    est({ to: WHYPE, value: "0xde0b6b3a7640000", data: "0xd0e30db0" }),
    est({ to: WHYPE, data: approve }),
    est({ data: deployData }),
  ]);
  const row = (label: string, detail: string, gas: bigint): ElysiumActionCost => ({ label, detail, gas: Number(gas), feeHype: Number(formatUnits(gas * gasPrice, 18)) });
  return {
    gasPriceGwei: Number(formatUnits(gasPrice, 9)),
    head: Number(head),
    actions: [
      row("Send HYPE", "native transfer to a wallet", transfer),
      row("Wrap HYPE", "WHYPE deposit()", wrap),
      row("Approve a token", "WHYPE approve()", approveGas),
      row("Deploy a contract", "Greeter, 1.6 KB of creation code", deploy),
    ],
  };
}
