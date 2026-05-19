#!/usr/bin/env node
/**
 * Garde-fou mémoire avant `next dev`.
 *
 * Turbopack (Next 16) écrit un cache persistant dans .next/dev/cache/turbopack.
 * Ce cache peut gonfler à plusieurs Go ; le process `next-server` en mappe une
 * grosse partie en RAM et finit par déclencher l'OOM-killer (qui tue tout WSL).
 *
 * Ce script purge le cache turbopack dès qu'il dépasse MAX_CACHE_GB.
 */
import { rmSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MAX_CACHE_GB = 2;
const CACHE_DIR = join(process.cwd(), '.next', 'dev', 'cache', 'turbopack');

/** Taille récursive d'un dossier, en octets. */
function dirSize(path) {
  let total = 0;
  let entries;
  try {
    entries = readdirSync(path, { withFileTypes: true });
  } catch {
    return 0; // dossier absent
  }
  for (const entry of entries) {
    const full = join(path, entry.name);
    try {
      if (entry.isDirectory()) total += dirSize(full);
      else total += statSync(full).size;
    } catch {
      /* fichier disparu en cours de route, on ignore */
    }
  }
  return total;
}

const bytes = dirSize(CACHE_DIR);
const gb = bytes / 1024 ** 3;

if (gb > MAX_CACHE_GB) {
  console.log(
    `[predev] cache Turbopack à ${gb.toFixed(1)} Go (> ${MAX_CACHE_GB} Go) — purge…`
  );
  rmSync(CACHE_DIR, { recursive: true, force: true });
  console.log('[predev] cache purgé, premier build un peu plus long.');
} else if (bytes > 0) {
  console.log(`[predev] cache Turbopack à ${gb.toFixed(1)} Go — OK.`);
}
