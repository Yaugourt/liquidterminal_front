import { createPublicClient, http, namehash, parseAbi, type Address } from "viem";
import { API_URLS } from "@/services/api/constants";

/**
 * HyperEVM name resolution — `.hl` (Hyperliquid Names) and `.hype` (dotHYPE)
 * to a wallet address, straight from the public RPC. Keyless and read-only,
 * so it lives in the frontend like the other HL RPC reads.
 *
 * Both registries key names by the ENS namehash of the full domain:
 *  - dotHYPE exposes an ENS-compatible resolver (`addr(bytes32)`).
 *  - Hyperliquid Names is an ERC-721 whose tokenId is the namehash and whose
 *    resolved address is `tokenIdToAddress(uint256)` (0x0 when unknown or
 *    expired). Verified on-chain on 2026-09-16.
 */

export const HL_NAME_REGEX = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?\.(hl|hype)$/i;

const HYPERLIQUID_NAMES = "0x1d9d87eBc14e71490bB87f1C39F65BDB979f3cb7" as const;
const DOTHYPE_RESOLVER = "0x4d5e4ed4D5e4A160Fa136853597cDc2eBBe66494" as const;
const ZERO = "0x0000000000000000000000000000000000000000";

const hlNamesAbi = parseAbi([
  "function tokenIdToAddress(uint256 tokenId) view returns (address)",
  "function primaryName(address account) view returns (string)",
]);
const ensResolverAbi = parseAbi(["function addr(bytes32 node) view returns (address)"]);

let client: ReturnType<typeof createPublicClient> | null = null;
const getClient = () => {
  if (!client) client = createPublicClient({ transport: http(API_URLS.HYPEREVM_RPC) });
  return client;
};

export interface ResolvedName {
  name: string;
  address: Address;
}

const cache = new Map<string, Promise<ResolvedName | null>>();

export const isHlName = (value: string): boolean => HL_NAME_REGEX.test(value.trim());

/** Resolve a `.hl` / `.hype` name; `null` when unregistered, expired or unset. Memoised per session. */
export const resolveHlName = (raw: string): Promise<ResolvedName | null> => {
  const name = raw.trim().toLowerCase();
  if (!HL_NAME_REGEX.test(name)) return Promise.resolve(null);
  const cached = cache.get(name);
  if (cached) return cached;

  const node = namehash(name);
  const lookup = (async (): Promise<ResolvedName | null> => {
    const address = name.endsWith(".hype")
      ? await getClient().readContract({ address: DOTHYPE_RESOLVER, abi: ensResolverAbi, functionName: "addr", args: [node] })
      : await getClient().readContract({
          address: HYPERLIQUID_NAMES,
          abi: hlNamesAbi,
          functionName: "tokenIdToAddress",
          args: [BigInt(node)],
        });
    return address && address !== ZERO ? { name, address } : null;
  })();

  cache.set(name, lookup);
  lookup.catch(() => cache.delete(name));
  return lookup;
};

/** Primary `.hl` name of an address (reverse lookup), empty string when none. */
export const lookupPrimaryHlName = async (address: Address): Promise<string> => {
  try {
    return await getClient().readContract({ address: HYPERLIQUID_NAMES, abi: hlNamesAbi, functionName: "primaryName", args: [address] });
  } catch {
    return "";
  }
};
