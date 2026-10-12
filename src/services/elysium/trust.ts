import { createPublicClient, decodeFunctionData, defineChain, http, keccak256, parseAbi, parseAbiItem, toHex, type Address, type Hex } from "viem";
import { useDataFetching } from "@/hooks/useDataFetching";
import { ELYSIUM_CHAIN, ELYSIUM_TRUST_CONTRACTS as T, HYPEREVM_TESTNET_RPC_URL } from "@/lib/elysium-chain";
import { elysiumClient, PRECOMPILE } from "./rpc";

/**
 * Elysium trust facts: who orders, validates, upgrades and can change what,
 * read live from the rollup contracts on HyperEVM testnet and the system
 * contracts on Elysium. Nothing here comes from a database.
 */

const hyperEvmTestnet = defineChain({
  id: 998,
  name: "HyperEVM Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: { default: { http: [HYPEREVM_TESTNET_RPC_URL] } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
  testnet: true,
});

// One Multicall3 eth_call for every parent chain read: the public RPC rate limits bursts.
const parentClient = createPublicClient({
  chain: hyperEvmTestnet,
  batch: { multicall: true },
  transport: http(HYPEREVM_TESTNET_RPC_URL, { retryCount: 2, retryDelay: 1_000 }),
});

const ROLLUP = parseAbi([
  "function confirmPeriodBlocks() view returns (uint64)",
  "function validatorWhitelistDisabled() view returns (bool)",
  "function getValidators() view returns (address[])",
  "function baseStake() view returns (uint256)",
  "function anyTrustFastConfirmer() view returns (address)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "function latestConfirmed() view returns (bytes32)",
  "function getAssertion(bytes32) view returns ((uint64 firstChildBlock, uint64 secondChildBlock, uint64 createdAtBlock, bool isFirstChild, uint8 status, bytes32 configHash))",
]);
const INBOX = parseAbi([
  "function maxTimeVariation() view returns (uint256 delayBlocks, uint256 futureBlocks, uint256 delaySeconds, uint256 futureSeconds)",
  "function isDelayBufferable() view returns (bool)",
  "function batchCount() view returns (uint256)",
]);
const ACCESS = parseAbi(["function hasRole(bytes32 role, address account) view returns (bool)"]);
const BEACON = parseAbi(["function owner() view returns (address)", "function implementation() view returns (address)"]);

const EXECUTOR_ROLE = keccak256(toHex("EXECUTOR_ROLE"));
/** EIP-1967 admin slot. */
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

const slotAddress = (v: Hex | undefined): Address | null =>
  v && BigInt(v) !== 0n ? (`0x${v.slice(-40)}` as Address) : null;

/** ArbOwner calls the chain owner can make, for decoding the change history. */
const ARB_OWNER = parseAbi([
  "function addChainOwner(address)",
  "function removeChainOwner(address)",
  "function setNetworkFeeAccount(address)",
  "function setInfraFeeAccount(address)",
  "function setMinimumL2BaseFee(uint256)",
  "function setSpeedLimit(uint64)",
  "function setMaxTxGasLimit(uint64)",
  "function setL2GasPricingInertia(uint64)",
  "function setL2GasBacklogTolerance(uint64)",
  "function setL1PricingEquilibrationUnits(uint256)",
  "function setL1PricingInertia(uint64)",
  "function setL1PricingRewardRecipient(address)",
  "function setL1PricingRewardRate(uint64)",
  "function setL1PricePerUnit(uint256)",
  "function setPerBatchGasCharge(int64)",
  "function setAmortizedCostCapBips(uint64)",
  "function setBrotliCompressionLevel(uint64)",
  "function scheduleArbOSUpgrade(uint64,uint64)",
  "function setChainConfig(string)",
  "function setWasmMaxSize(uint32)",
  "function setWasmMaxStackDepth(uint32)",
  "function setWasmActivationGas(uint64)",
  "function setWasmInkPrice(uint32)",
  "function setWasmFreePages(uint16)",
  "function setWasmPageGas(uint16)",
  "function setWasmPageLimit(uint16)",
  "function setWasmExpiryDays(uint16)",
  "function setWasmKeepaliveDays(uint16)",
  "function setInkPrice(uint32)",
]);

const TARGET_CALL = parseAbiItem("event TargetCallExecuted(address indexed target, uint256 value, bytes data)");

export interface ChainChange {
  block: number;
  time: number;
  txHash: Hex;
  target: Address;
  fn: string;
  args: string[];
}

export interface ElysiumTrust {
  parent: {
    head: number;
    /** Mean HyperEVM block interval over the last 1,000 blocks, seconds. */
    blockTimeS: number;
    confirmPeriodBlocks: number;
    whitelistOn: boolean;
    validators: Address[];
    baseStakeWei: bigint;
    fastConfirmer: Address | null;
    paused: boolean;
    latestConfirmedAtBlock: number;
    forceInclusionBlocks: number;
    forceInclusionSeconds: number;
    delayBuffer: boolean;
    batches: number;
    rollupOwner: Address;
    deployerStillExecutor: boolean;
    /** The holder found from the role events still holds the executor role. */
    holderIsExecutor: boolean;
    holderIsContract: boolean;
  };
  child: {
    chainOwners: Address[];
    /** The HyperEVM executor (aliased) can act on Elysium. */
    parentControlsChild: boolean;
    deployerStillExecutor: boolean;
    /** Mean Elysium block interval over the last 500 blocks, seconds. */
    blockTimeS: number;
    speedLimitGasPerS: number;
  };
  bridge: {
    walletBeaconOwner: Address;
    walletBeaconImpl: Address;
    walletBeaconOwnerIsContract: boolean;
    mirrorBeaconOwner: Address;
    mirrorBeaconImpl: Address;
    mirrorBeaconOwnerIsContract: boolean;
    bridgeFactoryAdmin: Address | null;
    mirrorFactoryAdmin: Address | null;
  };
  changes: ChainChange[];
}

const ZERO = "0x0000000000000000000000000000000000000000";

export async function fetchElysiumTrust(): Promise<ElysiumTrust> {
  const p = parentClient;
  const c = elysiumClient;
  const deployer = ELYSIUM_CHAIN.initialChainOwner as Address;

  const headBlock = await p.getBlock();
  const [
    past,
    confirm,
    whitelistOff,
    validators,
    baseStake,
    fastConfirmer,
    paused,
    owner,
    latest,
    mtv,
    buffer,
    batches,
    parentDeployerExec,
    mirrorOwner,
    mirrorImpl,
    mirrorFactoryAdminSlot,
    holderExec,
  ] = await Promise.all([
    p.getBlock({ blockNumber: headBlock.number - 1_000n }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "confirmPeriodBlocks" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "validatorWhitelistDisabled" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "getValidators" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "baseStake" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "anyTrustFastConfirmer" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "paused" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "owner" }),
    p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "latestConfirmed" }),
    p.readContract({ address: T.sequencerInbox, abi: INBOX, functionName: "maxTimeVariation" }),
    p.readContract({ address: T.sequencerInbox, abi: INBOX, functionName: "isDelayBufferable" }),
    p.readContract({ address: T.sequencerInbox, abi: INBOX, functionName: "batchCount" }),
    p.readContract({ address: T.parentExecutor, abi: ACCESS, functionName: "hasRole", args: [EXECUTOR_ROLE, deployer] }),
    p.readContract({ address: T.mirrorTokenBeacon, abi: BEACON, functionName: "owner" }),
    p.readContract({ address: T.mirrorTokenBeacon, abi: BEACON, functionName: "implementation" }),
    p.getStorageAt({ address: T.mirrorFactory, slot: ADMIN_SLOT }),
    p.readContract({ address: T.parentExecutor, abi: ACCESS, functionName: "hasRole", args: [EXECUTOR_ROLE, T.parentExecutorHolder] }),
  ]);
  const assertion = await p.readContract({ address: T.rollup, abi: ROLLUP, functionName: "getAssertion", args: [latest] });
  const [mirrorOwnerCode, holderCode] = await Promise.all([
    p.getCode({ address: mirrorOwner }),
    p.getCode({ address: T.parentExecutorHolder }),
  ]);

  const childHead = await c.getBlock();
  const [owners, childParentExec, childDeployerExec, walletOwner, walletImpl, bridgeFactoryAdminSlot, logs, childPast, acct] = await Promise.all([
    c.readContract({
      address: PRECOMPILE.ArbOwnerPublic,
      abi: parseAbi(["function getAllChainOwners() view returns (address[])"]),
      functionName: "getAllChainOwners",
    }),
    c.readContract({ address: T.childExecutor, abi: ACCESS, functionName: "hasRole", args: [EXECUTOR_ROLE, T.parentExecutorAliased] }),
    c.readContract({ address: T.childExecutor, abi: ACCESS, functionName: "hasRole", args: [EXECUTOR_ROLE, deployer] }),
    c.readContract({ address: T.bridgeWalletBeacon, abi: BEACON, functionName: "owner" }),
    c.readContract({ address: T.bridgeWalletBeacon, abi: BEACON, functionName: "implementation" }),
    c.getStorageAt({ address: T.bridgeFactory, slot: ADMIN_SLOT }),
    c.getLogs({ address: T.childExecutor, event: TARGET_CALL, fromBlock: 0n, toBlock: "latest" }),
    c.getBlock({ blockNumber: childHead.number - 500n }),
    c.readContract({
      address: PRECOMPILE.ArbGasInfo,
      abi: parseAbi(["function getGasAccountingParams() view returns (uint256,uint256,uint256)"]),
      functionName: "getGasAccountingParams",
    }),
  ]);
  const walletOwnerCode = await c.getCode({ address: walletOwner });

  const times = new Map<bigint, number>();
  await Promise.all(
    [...new Set(logs.map((l) => l.blockNumber))].map(async (n) => {
      const b = await c.getBlock({ blockNumber: n });
      times.set(n, Number(b.timestamp));
    })
  );

  const changes: ChainChange[] = logs
    .map((l) => {
      const data = (l.args.data ?? "0x") as Hex;
      let fn = data.slice(0, 10);
      let args: string[] = [];
      try {
        const d = decodeFunctionData({ abi: ARB_OWNER, data });
        fn = d.functionName;
        args = (d.args ?? []).map((a) => String(a));
      } catch {
        // Unknown selector: keep the raw 4 bytes.
      }
      return {
        block: Number(l.blockNumber),
        time: times.get(l.blockNumber) ?? 0,
        txHash: l.transactionHash as Hex,
        target: (l.args.target ?? ZERO) as Address,
        fn,
        args,
      };
    })
    .reverse();

  return {
    parent: {
      head: Number(headBlock.number),
      blockTimeS: Number(headBlock.timestamp - past.timestamp) / 1_000,
      confirmPeriodBlocks: Number(confirm),
      whitelistOn: !whitelistOff,
      validators: [...validators],
      baseStakeWei: baseStake,
      fastConfirmer: fastConfirmer === ZERO ? null : fastConfirmer,
      paused,
      latestConfirmedAtBlock: Number(assertion.createdAtBlock),
      forceInclusionBlocks: Number(mtv[0]),
      forceInclusionSeconds: Number(mtv[2]),
      delayBuffer: buffer,
      batches: Number(batches),
      rollupOwner: owner,
      deployerStillExecutor: parentDeployerExec,
      holderIsExecutor: holderExec,
      holderIsContract: !!holderCode && holderCode !== "0x",
    },
    child: {
      chainOwners: [...owners],
      parentControlsChild: childParentExec,
      deployerStillExecutor: childDeployerExec,
      blockTimeS: Number(childHead.timestamp - childPast.timestamp) / 500,
      speedLimitGasPerS: Number(acct[0]),
    },
    bridge: {
      walletBeaconOwner: walletOwner,
      walletBeaconImpl: walletImpl,
      walletBeaconOwnerIsContract: !!walletOwnerCode && walletOwnerCode !== "0x",
      mirrorBeaconOwner: mirrorOwner,
      mirrorBeaconImpl: mirrorImpl,
      mirrorBeaconOwnerIsContract: !!mirrorOwnerCode && mirrorOwnerCode !== "0x",
      bridgeFactoryAdmin: slotAddress(bridgeFactoryAdminSlot),
      mirrorFactoryAdmin: slotAddress(mirrorFactoryAdminSlot),
    },
    changes,
  };
}

export const useElysiumTrust = () =>
  useDataFetching<ElysiumTrust>({ fetchFn: fetchElysiumTrust, refreshInterval: 120_000, maxRetries: 1 });
