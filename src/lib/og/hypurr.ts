import { SITE_CONFIG } from "@/lib/site-config";

/**
 * Load a Hypurr mascot mood as a base64 data URI for a share-tile.
 *
 * Satori embeds images from a URL or a data URI. The mascots live in
 * `public/hypurr/*.png`, which on the deployed CDN is reachable at the site
 * origin but not from the serverless filesystem, so we fetch by URL and inline
 * the bytes, cached per mood.
 */
const cache = new Map<string, string | null>();

export async function loadHypurr(mood = "hypurr"): Promise<string | null> {
  if (cache.has(mood)) return cache.get(mood) ?? null;
  try {
    const res = await fetch(`${SITE_CONFIG.url}/hypurr/${encodeURIComponent(mood)}.png`);
    if (!res.ok) {
      cache.set(mood, null);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const uri = `data:image/png;base64,${buf.toString("base64")}`;
    cache.set(mood, uri);
    return uri;
  } catch {
    return null;
  }
}
