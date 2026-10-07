/**
 * Public bucket of daily Elysium testnet archive snapshots (CORS open,
 * keyless). Hook-free so server routes can import it.
 */
export const SNAPSHOT_BASE = "https://elysium-testnet-snapshots.hypedexer.com";
export const SNAPSHOT_POINTER = `${SNAPSHOT_BASE}/conduit-orbit-deployer/latest-archive.txt`;
