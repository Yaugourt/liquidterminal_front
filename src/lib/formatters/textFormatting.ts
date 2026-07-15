/**
 * Text display helpers shared across domains.
 */

/** Named HTML entities commonly left encoded in scraped API text. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const ENTITY_PATTERN = /&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g;

const decodeOnce = (input: string): string =>
  input.replace(ENTITY_PATTERN, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const code = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isNaN(code) || code > 0x10ffff ? match : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });

/**
 * Decodes HTML entities in text coming from the API (e.g. link-preview
 * titles arrive with "&amp;" already encoded and would render literally).
 * Runs a second pass so double-encoded input ("&amp;amp;") also collapses.
 * SSR-safe: pure string work, no DOM involved.
 */
export function decodeHtmlEntities(value: string): string {
  const once = decodeOnce(value);
  return once === value ? value : decodeOnce(once);
}
