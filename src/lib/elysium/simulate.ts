import { getContractAddress, size, type Address, type Hex, type PublicClient } from "viem";

/**
 * Dry-runs on Elysium with eth_simulateV1 (native transfers traced as logs),
 * priced with eth_estimateGas. Pure functions over a viem public client so the
 * browser simulator and the server-rendered share tiles run the same code.
 * Nothing is signed or sent.
 */

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

/** A follow-up call run in the same simulated block, after the deployment. */
export interface SimFollowUp {
  status: "success" | "reverted";
  gasUsed: bigint;
  returnData: Hex;
  revertData: Hex | null;
  revertMessage: string | null;
}

export interface DeploySimResult extends SimResult {
  /** Address the contract gets: sender + current nonce (CREATE). */
  address: Address;
  nonce: number;
  /** Creation bytecode + encoded constructor arguments, bytes. */
  initcodeSize: number;
  /** Code stored at `address` after the constructor ran, bytes (0 on revert). */
  runtimeSize: number;
  /** Sender balance at the simulated block, before any override. */
  senderBalanceWei: bigint;
  followUp: SimFollowUp | null;
}

/** EIP-170: largest runtime code a contract can store. */
export const MAX_RUNTIME_BYTES = 24_576;
/** EIP-3860: largest creation code a transaction can carry. */
export const MAX_INITCODE_BYTES = 49_152;

/** The ERC-7528 pseudo-address traceTransfers uses for native HYPE movements. */
export const NATIVE_TRANSFER_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const hex = (n: bigint) => `0x${n.toString(16)}` as Hex;

interface RawSimCall { status: Hex; gasUsed: Hex; returnData: Hex; logs: SimLog[]; error?: { message?: string; data?: Hex } }
interface RawSimTx { from: Address; to?: Address; value?: Hex; data: Hex }

type Client = Pick<PublicClient, "request" | "getGasPrice" | "getTransactionCount" | "getBalance">;

async function simulateBlock(client: Client, calls: RawSimTx[], overrides: Record<string, { balance: Hex }> | undefined) {
  const blocks = (await client.request({
    method: "eth_simulateV1" as never,
    params: [{ blockStateCalls: [{ stateOverrides: overrides, calls }], traceTransfers: true, validation: false }, "latest"] as never,
  })) as { number: Hex; calls: RawSimCall[] }[];
  return { block: Number(BigInt(blocks[0].number)), calls: blocks[0].calls };
}

const estimate = (client: Client, tx: RawSimTx, overrides: Record<string, { balance: Hex }> | undefined) =>
  client
    .request({ method: "eth_estimateGas" as never, params: (overrides ? [tx, "latest", overrides] : [tx, "latest"]) as never })
    .then((g) => BigInt(g as Hex))
    .catch(() => null);

function toResult(r: RawSimCall, block: number, gasPriceWei: bigint, gasEstimate: bigint | null): SimResult {
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
    block,
  };
}

/** One call against the latest Elysium state. */
export async function simulateCall(client: Client, call: SimCall): Promise<SimResult> {
  const overrides = call.fundWei ? { [call.from]: { balance: hex(call.fundWei) } } : undefined;
  const tx: RawSimTx = { from: call.from, to: call.to, value: hex(call.value), data: call.data };
  const [sim, gasPriceWei, gasEstimate] = await Promise.all([simulateBlock(client, [tx], overrides), client.getGasPrice(), estimate(client, tx, overrides)]);
  return toResult(sim.calls[0], sim.block, gasPriceWei, gasEstimate);
}

export interface DeployCall {
  from: Address;
  value: bigint;
  /** Creation bytecode with the constructor arguments appended. */
  data: Hex;
  fundWei?: bigint;
  /** Calldata sent to the new contract right after deployment, same block. */
  followUpData?: Hex;
}

/**
 * A contract creation (no `to`) against the latest Elysium state. The address
 * is predicted from the sender's nonce, and an optional follow-up call is run
 * on the new contract in the same simulated block.
 */
export async function simulateDeploy(client: Client, call: DeployCall): Promise<DeploySimResult> {
  const overrides = call.fundWei ? { [call.from]: { balance: hex(call.fundWei) } } : undefined;
  const [nonce, senderBalanceWei] = await Promise.all([client.getTransactionCount({ address: call.from }), client.getBalance({ address: call.from })]);
  const address = getContractAddress({ from: call.from, nonce: BigInt(nonce) });
  const tx: RawSimTx = { from: call.from, value: hex(call.value), data: call.data };
  const calls: RawSimTx[] = [tx];
  if (call.followUpData) calls.push({ from: call.from, to: address, value: "0x0", data: call.followUpData });
  const [sim, gasPriceWei, gasEstimate] = await Promise.all([simulateBlock(client, calls, overrides), client.getGasPrice(), estimate(client, tx, overrides)]);
  const base = toResult(sim.calls[0], sim.block, gasPriceWei, gasEstimate);
  const f = sim.calls[1];
  return {
    ...base,
    address,
    nonce,
    initcodeSize: size(call.data),
    runtimeSize: base.status === "success" ? size(base.returnData) : 0,
    senderBalanceWei,
    followUp: f
      ? {
          status: f.status === "0x1" ? "success" : "reverted",
          gasUsed: BigInt(f.gasUsed),
          returnData: f.returnData,
          revertData: f.error?.data ?? null,
          revertMessage: f.error?.message ?? null,
        }
      : null,
  };
}
