/**
 * Convert market index to coin ID for WebSocket subscription
 * @param marketIndex - The market index from SpotToken
 * @param tokenName - The token name (used for special cases like PURR)
 * @returns The coin ID string (e.g., "@107" or "PURR/USDC")
 */
export function marketIndexToCoinId(marketIndex: number, tokenName?: string): string {
  // Special case for PURR token with marketIndex 0
  if (marketIndex === 0 && tokenName === 'PURR') {
    return 'PURR/USDC';
  }
  return `@${marketIndex}`;
}

/**
 * Convert coin ID back to market index
 * @param coinId - The coin ID string (e.g., "@107") 
 * @returns The market index number
 */
export function coinIdToMarketIndex(coinId: string): number {
  return parseInt(coinId.replace('@', ''));
}

/**
 * Get coin ID for perpetual contracts
 * Perpetuals use the coin name directly (e.g., "BTC", "ETH")
 * @param tokenName - The perpetual token name (e.g., "BTC-PERP", "BTC", "ETH/USD")
 * @returns The coin ID string for WebSocket subscription
 */
export function getPerpCoinId(tokenName: string): string {
  // Remove common suffixes and prefixes
  return tokenName
    .replace('-PERP', '')
    .replace('/USD', '')
    .replace('/USDC', '')
    .split('/')[0]
    .trim();
}
