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
