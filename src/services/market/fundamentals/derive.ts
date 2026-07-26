import type {
  FeeRevenueDay,
  FundamentalsPeriod,
  IncomeStatement,
  MoneyBlock,
  ProtocolFundamentals,
  RevenueQuarter,
} from "./types";

const at = (block: MoneyBlock | null | undefined, period: FundamentalsPeriod): number | null => {
  const value = block?.[period];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const ratio = (numerator: number | null, denominator: number | null): number | null =>
  numerator != null && denominator != null && denominator > 0 ? numerator / denominator : null;

/**
 * Reconcile one period into an income statement.
 *
 * Only the two ends are reported: what users paid (fees) and what the protocol
 * kept (revenue). The middle line is their difference, so it lumps together
 * every payout — HLP, builder codes, spot deployer share — and no source here
 * can break it down further. Anything that cannot be computed stays null so the
 * UI can omit the line rather than print a zero that looks like a measurement.
 */
/** Days each window spans, for the per-day figure. All-time has no fixed span. */
const DAYS_IN: Record<FundamentalsPeriod, number | null> = {
  total24h: 1,
  total7d: 7,
  total30d: 30,
  totalAllTime: null,
};

export function toIncomeStatement(
  fundamentals: ProtocolFundamentals | null,
  period: FundamentalsPeriod
): IncomeStatement {
  const grossFees = at(fundamentals?.fees, period);
  const protocolRevenue = at(fundamentals?.revenue, period);

  const costOfRevenue =
    grossFees != null && protocolRevenue != null ? grossFees - protocolRevenue : null;

  return {
    period,
    grossFees,
    costOfRevenue,
    protocolRevenue,
    grossMargin: ratio(protocolRevenue, grossFees),
    revenuePerDay: ratio(protocolRevenue, DAYS_IN[period]),
  };
}

const DAY_MS = 86_400_000;

/** UTC midnight of the running day. Everything at or after it is incomplete. */
const todayUtcMs = (): number => Math.floor(Date.now() / DAY_MS) * DAY_MS;

/**
 * Join the two daily series into one reconciled history.
 *
 * The aggregate stamps each point at UTC midnight in seconds, so the join key
 * is exact and no bucketing is needed. A day missing from either series is
 * dropped rather than defaulted: a zero would read as "no fees were charged"
 * when it means "not reported", and it is the margin that would carry the lie.
 *
 * The running day is dropped too. It holds a few hours of activity against a
 * full day everywhere else on the chart, which draws as a collapse.
 */
export function mergeFeeRevenue(
  feesChart: [number, number][],
  revenueChart: [number, number][]
): FeeRevenueDay[] {
  const cutoff = todayUtcMs();
  const revenueByDay = new Map<number, number>();
  for (const [seconds, value] of revenueChart) {
    if (Number.isFinite(value)) revenueByDay.set(seconds * 1000, value);
  }

  const days: FeeRevenueDay[] = [];
  for (const [seconds, fees] of feesChart) {
    const time = seconds * 1000;
    if (time >= cutoff || !Number.isFinite(fees)) continue;

    const revenue = revenueByDay.get(time);
    if (revenue == null) continue;

    days.push({
      time,
      fees,
      revenue,
      // Clamped: the two series are computed independently and revenue can
      // edge past fees on a thin day. A negative band would break the stack.
      paidOut: Math.max(0, fees - revenue),
      margin: fees > 0 ? revenue / fees : null,
    });
  }

  return days.sort((a, b) => a.time - b.time);
}

const QUARTER_OF = (month: number): number => Math.floor(month / 3);

/**
 * Aggregate the daily series into calendar quarters.
 *
 * Quarter-over-quarter growth is the number an equity reader reaches for, and
 * it is also the easiest to misstate: the running quarter is short by
 * construction. It is kept on the chart, flagged partial, and excluded from
 * both sides of any growth calculation.
 */
export function toQuarters(days: FeeRevenueDay[]): RevenueQuarter[] {
  if (days.length === 0) return [];

  const now = new Date(todayUtcMs());
  const currentKey = `${now.getUTCFullYear()}-${QUARTER_OF(now.getUTCMonth())}`;

  const buckets = new Map<string, RevenueQuarter>();
  for (const day of days) {
    const date = new Date(day.time);
    const year = date.getUTCFullYear();
    const quarter = QUARTER_OF(date.getUTCMonth());
    const key = `${year}-${quarter}`;

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        label: `Q${quarter + 1} ${String(year).slice(2)}`,
        time: Date.UTC(year, quarter * 3, 1),
        fees: 0,
        revenue: 0,
        days: 0,
        partial: key === currentKey,
        qoq: null,
      };
      buckets.set(key, bucket);
    }

    bucket.fees += day.fees;
    bucket.revenue += day.revenue;
    bucket.days += 1;
  }

  const quarters = [...buckets.values()].sort((a, b) => a.time - b.time);
  for (let i = 1; i < quarters.length; i += 1) {
    const previous = quarters[i - 1];
    const current = quarters[i];
    if (current.partial || previous.partial || previous.revenue <= 0) continue;
    current.qoq = (current.revenue - previous.revenue) / previous.revenue;
  }

  return quarters;
}

/**
 * Trailing simple moving average over a numeric series.
 *
 * Daily margin swings several points on venue mix alone, so the raw line reads
 * as noise. Positions before the window is full stay null rather than averaging
 * a shorter span, which would make the left edge of every chart look calmer
 * than the rest of it.
 */
export function movingAverage(values: (number | null)[], window: number): (number | null)[] {
  const output: (number | null)[] = [];
  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i += 1) {
    const entering = values[i];
    if (entering != null) {
      sum += entering;
      count += 1;
    }
    const leaving = i >= window ? values[i - window] : null;
    if (leaving != null) {
      sum -= leaving;
      count -= 1;
    }
    output.push(i >= window - 1 && count > 0 ? sum / count : null);
  }

  return output;
}
