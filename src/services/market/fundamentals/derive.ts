import type {
  FeeRevenueDay,
  FundamentalsPeriod,
  IncomeStatement,
  MoneyBlock,
  MultiplePoint,
  ProtocolFundamentals,
  RevenueQuarter,
  ValuationMultiples,
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

/** Days in a trailing twelve months. The basis every multiple here uses. */
export const TTM_DAYS = 365;

/**
 * Trailing sums over a fixed window, aligned to the input.
 *
 * Positions before the window is full stay null. Annualising a shorter span
 * would be the alternative, and it is how a quarter of unusually strong crypto
 * revenue turns into a multiple that flatters the token by a third.
 */
function trailingSums(values: number[], window: number): (number | null)[] {
  const output: (number | null)[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    output.push(i >= window - 1 ? sum : null);
  }

  return output;
}

const safeRatio = (numerator: number | null, denominator: number | null): number | null =>
  numerator != null && denominator != null && denominator > 0 && numerator > 0
    ? numerator / denominator
    : null;

/**
 * Current multiples from the last twelve months of the daily series.
 *
 * Falls back to the whole series when less than a year is available, and
 * reports how many days it actually used so the card can say so rather than
 * quoting a "TTM" figure built from four months.
 */
export function toValuationMultiples(
  days: FeeRevenueDay[],
  marketCap: number | null,
  fdv: number | null
): ValuationMultiples {
  const window = days.slice(-TTM_DAYS);
  const ttmFees = window.length > 0 ? window.reduce((sum, d) => sum + d.fees, 0) : null;
  const ttmRevenue = window.length > 0 ? window.reduce((sum, d) => sum + d.revenue, 0) : null;

  const priceToEarnings = safeRatio(marketCap, ttmRevenue);
  const priceToEarningsFd = safeRatio(fdv, ttmRevenue);

  return {
    ttmFees,
    ttmRevenue,
    ttmDays: window.length,
    marketCap,
    fdv,
    priceToFees: safeRatio(marketCap, ttmFees),
    priceToEarnings,
    priceToFeesFd: safeRatio(fdv, ttmFees),
    priceToEarningsFd,
    earningsYield: priceToEarnings == null ? null : 1 / priceToEarnings,
    earningsYieldFd: priceToEarningsFd == null ? null : 1 / priceToEarningsFd,
  };
}

/**
 * The multiple as a series, on a fully diluted basis only.
 *
 * Fully diluted because it is the only basis that can be reconstructed. A
 * historical market cap needs the circulating supply as it stood on the day,
 * and we hold today's float and no history of it — pricing last year's close
 * against this year's float would inflate every past multiple by the amount
 * that has vested since, which is most of the move the chart would show.
 *
 * Max supply is fixed at genesis and the burn has moved total supply by under
 * a tenth of a percent, so treating it as constant costs nothing.
 *
 * The series starts a year into the fee history, since that is when the first
 * trailing-twelve-month figure exists, and ends where the price series does.
 */
export function toMultipleSeries(
  days: FeeRevenueDay[],
  closesByDay: Map<number, number>,
  maxSupply: number
): MultiplePoint[] {
  if (days.length === 0 || closesByDay.size === 0 || maxSupply <= 0) return [];

  const feeSums = trailingSums(
    days.map((d) => d.fees),
    TTM_DAYS
  );
  const revenueSums = trailingSums(
    days.map((d) => d.revenue),
    TTM_DAYS
  );

  const points: MultiplePoint[] = [];
  for (let i = 0; i < days.length; i += 1) {
    const fees = feeSums[i];
    const revenue = revenueSums[i];
    if (fees == null || revenue == null || fees <= 0 || revenue <= 0) continue;

    const close = closesByDay.get(days[i].time);
    if (close == null || !Number.isFinite(close) || close <= 0) continue;

    const fdv = close * maxSupply;
    points.push({
      time: days[i].time,
      fdv,
      priceToFees: fdv / fees,
      priceToEarnings: fdv / revenue,
    });
  }

  return points;
}
