import type { RevenueDay, RevenueLifetime } from '../revenue';
import { AF_FEE_SHARE } from './constants';

/**
 * Approximate HYPE buyback flow derived from observed protocol revenue.
 *
 * The Assistance Fund buys HYPE with ~99% of net trading fees (see
 * {@link AF_FEE_SHARE}), so trailing protocol revenue is a close proxy for the
 * buyback rate. This is an estimate, not a direct on-chain buyback feed — label
 * it as such wherever it is displayed.
 */
export interface BuybackRate {
  /** Mean daily protocol revenue over the window (USD), today excluded. */
  avgDailyRevenueUsd: number;
  dailyUsd: number;
  dailyHype: number;
  weeklyUsd: number;
  weeklyHype: number;
  monthlyUsd: number;
  monthlyHype: number;
  annualUsd: number;
  annualHype: number;
  /** Total revenue across the completed days in the window. */
  windowTotalUsd: number;
  /** Number of completed days the average is built from. */
  nDays: number;
  lifetimeRevenueUsd: number;
  lifetimeBuybackUsd: number;
}

/**
 * Build a {@link BuybackRate} from a revenue window. Excludes today's partial
 * UTC day so the daily average is not dragged down by an incomplete bar.
 */
export function computeBuybackRate(
  days: RevenueDay[] | null | undefined,
  price: number | null | undefined,
  lifetime?: RevenueLifetime | null,
  feeShare: number = AF_FEE_SHARE,
): BuybackRate | null {
  if (!days || days.length === 0 || !price || price <= 0) return null;

  const todayUtc = new Date().toISOString().slice(0, 10);
  const completed = days.filter((d) => d.date !== todayUtc);
  const series = completed.length > 0 ? completed : days;

  const windowTotalUsd = series.reduce((acc, d) => acc + d.total, 0);
  const avgDailyRevenueUsd = windowTotalUsd / series.length;

  const dailyUsd = avgDailyRevenueUsd * feeShare;
  const dailyHype = dailyUsd / price;

  return {
    avgDailyRevenueUsd,
    dailyUsd,
    dailyHype,
    weeklyUsd: dailyUsd * 7,
    weeklyHype: dailyHype * 7,
    monthlyUsd: dailyUsd * 30,
    monthlyHype: dailyHype * 30,
    annualUsd: dailyUsd * 365,
    annualHype: dailyHype * 365,
    windowTotalUsd,
    nDays: series.length,
    lifetimeRevenueUsd: lifetime?.total ?? 0,
    lifetimeBuybackUsd: (lifetime?.total ?? 0) * feeShare,
  };
}
