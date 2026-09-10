import { env } from "@/lib/env";

/**
 * Absolute URL for a Liquid Terminal backend path, for the tile routes.
 *
 * `NEXT_PUBLIC_API` is authored with or without a trailing slash depending on
 * the environment (locally it carries one). Axios normalises that when it joins
 * a baseURL to a path, but the tile routes call `fetch` directly, where a naive
 * template literal yields `//market/spot` — a 404 that surfaces as a blank 503
 * tile. Joining through here keeps exactly one slash either way.
 */
export function backendUrl(path: string): string {
  return `${env.NEXT_PUBLIC_API.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
