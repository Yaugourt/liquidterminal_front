import type {
  FundamentalsPeriod,
  IncomeStatement,
  MoneyBlock,
  ProtocolFundamentals,
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
