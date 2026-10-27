import { SITE_CONFIG } from "@/lib/site-config";

/**
 * Load a Hypurr mascot mood as a base64 data URI for a share-tile.
 *
 * Satori embeds images from a URL or a data URI. The mascots live in
 * `public/hypurr/*.png`, which on the deployed CDN is reachable at the site
 * origin but not from the serverless filesystem, so we fetch by URL and inline
 * the bytes, cached per mood.
 */
const cache = new Map<string, string>();
/** When a mood last failed to load. A failure is retried after `RETRY_AFTER_MS`, never kept for the life of the instance. */
const failedAt = new Map<string, number>();
const RETRY_AFTER_MS = 60_000;

export async function loadHypurr(mood = "hypurr"): Promise<string | null> {
  const cached = cache.get(mood);
  if (cached) return cached;
  const failed = failedAt.get(mood);
  if (failed !== undefined && Date.now() - failed < RETRY_AFTER_MS) return null;
  try {
    const res = await fetch(`${SITE_CONFIG.url}/hypurr/${encodeURIComponent(mood)}.png`);
    if (!res.ok) {
      failedAt.set(mood, Date.now());
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const uri = `data:image/png;base64,${buf.toString("base64")}`;
    cache.set(mood, uri);
    failedAt.delete(mood);
    return uri;
  } catch {
    failedAt.set(mood, Date.now());
    return null;
  }
}
