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
