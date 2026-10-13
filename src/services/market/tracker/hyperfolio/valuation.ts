import type { DefiPosition, DefiProtocol, EvmComposition } from './types';

/**
 * Lending (supplied / borrowed) and liquidity positions list the underlying
 * asset (USD₮0, WHYPE…), which sits in the pool, not in the wallet: the
 * wallet composition only holds the free balance, so nothing overlaps.
 */
const holdsUnderlying = (position: DefiPosition): boolean =>
  /lending|liquidity|\blp\b/i.test(position.type) || /supplied|borrow/i.test(position.positionType);

/** Staking / vault positions list a receipt token (kHYPE, vault shares…) the wallet itself holds. */
const isReceipt = (position: DefiPosition): boolean =>
  /^(reward-bearing-token|vault)$/i.test(position.positionType) || /^(staking|vault)$/i.test(position.type);

/**
 * HyperEVM wallet-token value net of what the DeFi positions already count.
 *
 * Receipt tokens (kHYPE, vault shares…) sit both in the wallet composition
 * and inside a DeFi position, so they are counted once, on the DeFi side. Per
 * token address only the overlap is removed — min(wallet value, value the
 * receipt positions hold of that token). Lending and LP positions never
 * dedupe: their underlying is in the pool, not in the wallet.
 */
export const evmTokensValueOutsideDefi = (
  composition: EvmComposition | null | undefined,
  protocols: DefiProtocol[]
): number => {
  if (!composition) return 0;
  const inDefi = new Map<string, number>();
  for (const protocol of protocols) {
    for (const position of protocol.positions) {
      if (holdsUnderlying(position) || !isReceipt(position)) continue;
      for (const token of position.tokens) {
        inDefi.set(token.address, (inDefi.get(token.address) ?? 0) + Math.max(0, token.value));
      }
    }
  }
  const counted = composition.tokens.reduce(
    (sum, token) => sum + Math.min(Math.max(0, token.value), inDefi.get(token.address) ?? 0),
    0
  );
  return Math.max(0, composition.totalValue - counted);
};
