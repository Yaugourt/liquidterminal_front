/**
 * Fonction utilitaire pour mapper les noms de tokens selon le fichier unit.json
 */

import unitMapping from '../../public/unit.json';

/**
 * Mappe un nom de token interne vers son nom d'affichage
 * @param tokenName - Le nom de token interne (ex: "UBTC")
 * @returns Le nom d'affichage (ex: "BTC") ou le nom original si pas de mapping
 */
export function mapTokenName(tokenName: string): string {
  return unitMapping[tokenName as keyof typeof unitMapping] || tokenName;
}

/**
 * Mappe les noms de tokens dans un objet de balance
 * @param balance - L'objet balance avec potentiellement un nom de token à mapper
 * @returns L'objet balance avec le nom de token mappé
 */
export function mapTokenBalance<T extends { coin?: string; token?: string | number; name?: string }>(balance: T): T {
  const mapped = { ...balance };
  
  // Mapper selon les propriétés possibles
  if (mapped.coin) {
    mapped.coin = mapTokenName(mapped.coin);
  }
  // Note: token peut être un number dans HyperliquidBalance, on ne le mappe pas
  if (mapped.name) {
    mapped.name = mapTokenName(mapped.name);
  }
  
  return mapped;
}

/**
 * Mappe les noms de tokens dans un tableau de balances
 * @param balances - Le tableau de balances
 * @returns Le tableau avec les noms de tokens mappés
 */
export function mapTokenBalances<T extends { coin?: string; token?: string | number; name?: string }>(balances: T[]): T[] {
  return balances.map(mapTokenBalance);
}