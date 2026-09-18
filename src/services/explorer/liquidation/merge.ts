import type { Liquidation } from './types';

/**
 * Hypedexer now emits two rows per liquidation, sharing the same `hash`:
 *  - the priced row: `liq_dir`, `notional_total`, `size_total`, no liquidators;
 *  - a "liquidators" row: `liquidators[]` filled, every amount at 0, `liq_dir: null`.
 *
 * The table wants one line per event, so fold the liquidators row into its
 * priced sibling. A lone liquidators row (its sibling not in the window yet)
 * is kept so the event is not lost; it's dropped once the priced row shows up.
 */
export const isLiquidatorsRow = (liq: Liquidation): boolean =>
  liq.liq_dir == null && liq.notional_total === 0 && liq.size_total === 0;

export function mergeLiquidationRows(rows: Liquidation[]): Liquidation[] {
  const byHash = new Map<string, Liquidation>();
  const order: string[] = [];

  for (const row of rows) {
    const existing = byHash.get(row.hash);
    if (!existing) {
      byHash.set(row.hash, row);
      order.push(row.hash);
      continue;
    }
    const rowIsLiquidators = isLiquidatorsRow(row);
    const existingIsLiquidators = isLiquidatorsRow(existing);
    if (rowIsLiquidators === existingIsLiquidators) continue; // true duplicate
    const priced = rowIsLiquidators ? existing : row;
    const liquidators = rowIsLiquidators ? row : existing;
    byHash.set(row.hash, {
      ...priced,
      liquidators: priced.liquidators?.length ? priced.liquidators : liquidators.liquidators,
      liquidator_count: Math.max(priced.liquidator_count ?? 0, liquidators.liquidator_count ?? 0),
    });
  }

  return order.map((h) => byHash.get(h)!);
}
