/**
 * HypeDexer may return `builderName` as a string or a non-string object for some rows.
 */
export function formatBuilderDisplayName(
  name: string | null | Record<string, unknown> | undefined
): string {
  if (name === null || name === undefined) return "—";
  if (typeof name === "string" && name.trim() !== "") return name;
  return "—";
}

/** Shortened `0x` address for display when no human-readable name exists. */
export function shortenBuilderAddress(address: string): string {
  const a = address.trim();
  if (!a) return "—";
  const hex = a.toLowerCase().replace(/^0x/, "");
  if (hex.length < 10) return a;
  return `0x${hex.slice(0, 4)}…${hex.slice(-4)}`;
}

/**
 * Prefer indexer name; if missing, show a truncated builder address instead of "—".
 */
export function formatBuilderDisplayNameOrAddress(
  name: string | null | Record<string, unknown> | undefined,
  builderAddress: string
): string {
  const display = formatBuilderDisplayName(name);
  if (display !== "—") return display;
  return shortenBuilderAddress(builderAddress);
}
