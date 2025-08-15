/**
 * Convert market index to coin ID for WebSocket subscription
 * @param marketIndex - The market index from SpotToken
 * @returns The coin ID string (e.g., "@107")
 */
export function marketIndexToCoinId(marketIndex: number): string {
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
