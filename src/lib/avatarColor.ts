import { chartPalette } from '@/components/common/charts/chartTheme';

/** Palette used for generated address avatars — V4 chart multi-series palette. */
const AVATAR_PALETTE = chartPalette.multiSeries;

/**
 * Stable, deterministic color for an address (hash → palette index).
 *
 * Source unique de vérité : remplace les copies locales de `BuildersTopTable`
 * et `BuildersAllTable`. Le même address rend toujours la même couleur.
 */
export function avatarColor(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
