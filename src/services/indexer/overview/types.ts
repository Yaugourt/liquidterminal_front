/**
 * Shape returned by all `/indexer/overview/*-24h` snapshot endpoints
 * (`active-traders-24h`, `total-fills-24h`, `total-fees-24h`,
 * `trading-volume-24h`). `value` is the metric at t=now, `variationPct` is
 * the relative change vs the previous 24h window.
 */
export interface OverviewStat24h {
  value: number;
  variationPct: number;
}

/** Shape of `/indexer/overview/total-fees-24h` (split by venue, no variation). */
export interface OverviewFees24h {
  feesSpot: number;
  feesPerpUsdc: number;
  totalFees: number;
}
