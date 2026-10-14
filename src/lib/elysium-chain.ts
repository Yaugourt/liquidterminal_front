/**
 * Elysium testnet deployment facts that never change after genesis, copied
 * from the chain config Conduit publishes (not readable from a browser: CORS):
 * https://api.conduit.xyz/file/v1/arbitrum/chaininfo/elysium-testnet (read 2026-09-30).
 */
export const ELYSIUM_CHAIN_INFO_URL = "https://api.conduit.xyz/file/v1/arbitrum/chaininfo/elysium-testnet";

export const ELYSIUM_CHAIN = {
  chainId: 99801,
  parentChainId: 998,
  initialArbOSVersion: 51,
  /** `DataAvailabilityCommittee: true` in the chain config: an AnyTrust chain. */
  anyTrust: true,
  initialChainOwner: "0x58a1f95a4C7B9195D20e691C1F993100E6c42a11",
  rollupDeployedAtParentBlock: 63983746,
  rpc: "https://testnet-rpc.elysium.kinetiq.xyz",
  explorer: "https://test-explorer.elysium.kinetiq.xyz",
  sequencerFeed: "wss://relay-elysium-testnet.t.conduit.xyz/",
  dasRestAggregator: "https://das-elysium-testnet.t.conduit.xyz",
} as const;

/** Second public Elysium RPC: CORS open and no rate limit hit in testing, unlike the default one. */
export const ELYSIUM_ALT_RPC_URL = "https://elysium-testnet-rpc.hypedexer.com";

/** Rollup contracts on HyperEVM testnet (the parent chain). */
export const ELYSIUM_ROLLUP_CONTRACTS: { name: string; address: string; role: string }[] = [
  { name: "Rollup", address: "0xEbf08e34941fd93a0Fc1cD89dbBF7447267039Df", role: "Assertions and validation" },
  { name: "Bridge", address: "0x36dAbc3CEE2E1084B7d04c8015Ef68Cac78f4f37", role: "Holds bridged HYPE, relays messages" },
  { name: "Inbox", address: "0x11178Df40CBf87a4343f4B3F8B09B366ceFA8Ec0", role: "Deposits and retryable tickets from HyperEVM" },
  { name: "Sequencer inbox", address: "0xb5B1a0AebfFeF819Ec3F8c39a17b5C4E70A001E3", role: "Receives the batches posted by the sequencer" },
  { name: "Validator wallet creator", address: "0xe78adb2A4d3eF1c9Bd39bC06b7161E150C00C967", role: "Deploys validator wallets" },
  { name: "Stake token", address: "0x5555555555555555555555555555555555555555", role: "Token validators stake" },
];

/** What each Arbitrum precompile is for, as documented by Offchain Labs. */
export const PRECOMPILE_ROLES: Record<string, string> = {
  ArbSys: "L2 to parent messages (withdrawals), ArbOS version, block number",
  ArbInfo: "Balance and code of any account",
  ArbAddressTable: "Address compression for calldata",
  ArbOwnerPublic: "Chain owners, network fee account",
  ArbGasInfo: "Gas prices, parent chain posting cost, speed limit",
  ArbAggregator: "Batch poster settings",
  ArbRetryableTx: "Redeem, keep alive or cancel retryable tickets",
  ArbStatistics: "Chain statistics",
  ArbWasm: "Stylus (WASM) program activation and settings",
  ArbWasmCache: "Stylus program cache",
  NodeInterface: "Virtual contract, eth_call only: gas estimates with the parent chain component",
};

/**
 * Contracts the trust page reads. Rollup side from the Conduit chain config;
 * executors, outbox, challenge manager and bridge beacons resolved on chain
 * from those (rollup getters, proxy admin slots, factory getters), 2026-10-12.
 */
export const ELYSIUM_TRUST_CONTRACTS = {
  rollup: "0xEbf08e34941fd93a0Fc1cD89dbBF7447267039Df",
  sequencerInbox: "0xb5B1a0AebfFeF819Ec3F8c39a17b5C4E70A001E3",
  /** UpgradeExecutor on HyperEVM: owner and proxy admin of the rollup contracts. */
  parentExecutor: "0x340a301a4e26349d8acb09b90734749d94293bff",
  /** Granted EXECUTOR_ROLE on `parentExecutor` at HyperEVM block 63,983,868 (tx 0xed4da08a…); the deploy wallet revoked its own role at 63,984,478. */
  parentExecutorHolder: "0xa2fd521f15eb0dea4adf4a1122aeb3a82b57cb35",
  /** UpgradeExecutor on Elysium: the ArbOS chain owner. */
  childExecutor: "0xFa78c1a82455a6ce83aA82CF464D74e88b384600",
  /** `parentExecutor` + 0x1111…1111: how a HyperEVM contract appears as sender on Elysium. */
  parentExecutorAliased: "0x451b301a4e26349d8acb09b90734749d94294d10",
  /** Beacon behind every ElysiumBridgeWallet, on Elysium. */
  bridgeWalletBeacon: "0xFB7B506AA242F41c053603bfd786699428fE3ACe",
  /** Beacon behind every ElysiumMirrorToken, on HyperEVM. */
  mirrorTokenBeacon: "0x5182aFF17Fe4d87143Ebc1718F670DFa61571721",
  bridgeFactory: "0xb94A38a4aC46970559E89E566f2486a3Fc56BE5a",
  mirrorFactory: "0xcaDb9986F3727177d48FA07294E1730f9D19290b",
  /** Rollup outbox on HyperEVM: withdrawals are claimed here (Rollup.outbox()). */
  outbox: "0x87391D602aaffB3Fe8051EcCDb75d6EEe8C31060",
} as const;

/**
 * HyperEVM testnet RPC that serves eth_getLogs over 100-block windows (the
 * public one times out on logs). Used only to find the last confirmed root.
 */
export const HYPEREVM_TESTNET_LOGS_RPC_URL = "https://hyperliquid-testnet.drpc.org";

/** Official bridge UI, where withdrawals are claimed on HyperEVM. */
export const ELYSIUM_BRIDGE_UI_URL = "https://elysium.kinetiq.xyz/testnet-bridge";

export const HYPEREVM_TESTNET_RPC_URL = "https://rpc.hyperliquid-testnet.xyz/evm";

/** Targets announced in the official chain specifications (read 2026-09-30). */
export const ELYSIUM_ANNOUNCED = {
  blockTimeMs: [100, 200] as const,
  gasPerS: 300_000_000,
  specsUrl: "https://elysium.kinetiq.xyz/docs/chain-specifications",
  securityUrl: "https://elysium.kinetiq.xyz/docs/security-and-data-availability",
  bridgeArchitectureUrl: "https://elysium.kinetiq.xyz/docs/token-bridging-architecture",
} as const;
