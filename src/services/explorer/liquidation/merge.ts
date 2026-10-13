import type { Liquidation } from './types';

/**
 * Hypedexer emits two rows per liquidation:
 *  - the priced row: `liq_dir`, `notional_total`, `size_total`, no liquidators;
 *  - a "liquidators" row: `liquidators[]` filled, every amount at 0, `liq_dir: null`.
 *
 * The backend folds them before answering REST (`/liquidations`,
 * `/liquidations/recent`), so REST rows are already one per event and are used
 * as is. Only the live push can still deliver a liquidators row on its own.
 *
 * One event is one (hash, liquidated user, coin): a single tx hash carries
 * every wallet liquidated on the same oracle tick and every coin of a
 * cross-margin wallet, so the hash alone never identifies a row.
 */
export const isLiquidatorsRow = (liq: Liquidation): boolean =>
  liq.liq_dir == null && liq.notional_total === 0 && liq.size_total === 0;

const eventKey = (liq: Liquidation): string => `${liq.hash}:${liq.liquidated_user}:${liq.coin}`;

/**
 * Adds a pushed liquidation to the newest-first list, capped at `max` rows.
 * A liquidators row folds into its priced sibling (and the other way round);
 * a second row of the same kind for the same event is a duplicate (the push
 * and REST give different `tid`s for one liquidation) and is skipped. A lone
 * liquidators row is kept so the event is not lost until its sibling arrives.
 */
export function insertLiveLiquidation(prev: Liquidation[], row: Liquidation, max: number): Liquidation[] {
  if (prev.some((l) => l.tid === row.tid)) return prev;

  const key = eventKey(row);
  const index = prev.findIndex((l) => eventKey(l) === key);
  if (index === -1) return [row, ...prev].slice(0, max);

  const existing = prev[index];
  const rowIsLiquidators = isLiquidatorsRow(row);
  if (rowIsLiquidators === isLiquidatorsRow(existing)) return prev; // true duplicate

  const priced = rowIsLiquidators ? existing : row;
  const sibling = rowIsLiquidators ? row : existing;
  const liquidators = [...new Set([...(priced.liquidators ?? []), ...(sibling.liquidators ?? [])])];
  const next = [...prev];
  // In place: the event keeps its position in the list.
  next[index] = {
    ...priced,
    liquidators,
    liquidator_count: Math.max(liquidators.length, priced.liquidator_count ?? 0, sibling.liquidator_count ?? 0),
  };
  return next;
}
