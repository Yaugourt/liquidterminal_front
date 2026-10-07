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
