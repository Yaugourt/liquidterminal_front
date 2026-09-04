/**
 * Font buffers for share-tile rendering.
 *
 * Satori (`next/og`) draws text from raw font data, not from CSS: `next/font`
 * and Tailwind do nothing server-side, which is why an un-fonted tile falls
 * back to a generic sans-serif. We load the brand faces (Inter + JetBrains
 * Mono) once and hand their buffers to every `ImageResponse`.
 *
 * The buffers come from Google Fonts at request time, cached at module scope so
 * only the first render of a cold instance pays for the fetch. Satori reads
 * ttf/otf/woff but NOT woff2, so we ask Google with an old User-Agent that
 * predates woff2, which makes it serve ttf/woff.
 */

/** A Firefox 4-era UA: supports woff, not woff2, so Google serves a readable face. */
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1; rv:2.0) Gecko/20100101 Firefox/4.0";

export interface TileFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
}

interface FontSpec {
  /** Family name referenced from tile `fontFamily`. */
  name: string;
  /** Google Fonts family query. */
  family: string;
  weight: 400 | 500 | 600 | 700;
}

const SPECS: FontSpec[] = [
  { name: "Inter", family: "Inter", weight: 400 },
  { name: "Inter", family: "Inter", weight: 600 },
  { name: "Inter", family: "Inter", weight: 700 },
  { name: "JetBrains Mono", family: "JetBrains Mono", weight: 500 },
  { name: "JetBrains Mono", family: "JetBrains Mono", weight: 600 },
];

let cache: TileFont[] | null = null;

/** Resolve one weight of one family to a raw ttf/woff buffer, or null on failure. */
async function fetchFace(spec: FontSpec): Promise<TileFont | null> {
  try {
    const api = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      spec.family
    )}:wght@${spec.weight}`;
    const css = await fetch(api, { headers: { "User-Agent": LEGACY_UA } }).then((r) =>
      r.ok ? r.text() : ""
    );
    const url = css.match(/src:\s*url\((https:\/\/[^)]+\.(?:ttf|woff))\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return { name: spec.name, data: await res.arrayBuffer(), weight: spec.weight, style: "normal" };
  } catch {
    return null;
  }
}

/**
 * Brand font buffers for `ImageResponse({ fonts })`. Returns whatever loaded;
 * a caller should still render (a missing face degrades to Satori's fallback
 * rather than failing the tile). Only a fully successful load is cached, so a
 * transient Google hiccup can be retried on the next request.
 */
export async function loadTileFonts(): Promise<TileFont[]> {
  if (cache) return cache;
  const loaded = (await Promise.all(SPECS.map(fetchFace))).filter(
    (f): f is TileFont => f !== null
  );
  if (loaded.length === SPECS.length) cache = loaded;
  return loaded;
}
