import { postExternal } from '../../api/http/axios-config';
import { API_URLS } from '../../api/constants';
import { FundingCarryRow, HlPredictedFundingsResponse } from './types';

const VENUE_LABEL: Record<string, string> = {
  HlPerp: 'HL',
  BinPerp: 'Binance',
  BybitPerp: 'Bybit',
};

// Fallback interval when `fundingIntervalHours` is absent: HL funds hourly,
// Binance/Bybit settle on an 8h cycle by default.
const DEFAULT_INTERVAL_H: Record<string, number> = { HlPerp: 1, BinPerp: 8, BybitPerp: 8 };
const HOURS_PER_YEAR = 8760;

// Annualize a per-interval funding rate to an APR percentage. Each venue funds
// on its own cadence (HL 1h, others 4/8h) so rates MUST be normalized to a
// common horizon before they can be compared or a spread taken.
const aprPct = (
  rate: string | undefined,
  intervalHours: number | undefined,
  venueKey: string,
): number | null => {
  if (rate == null) return null;
  const parsed = parseFloat(rate);
  if (!Number.isFinite(parsed)) return null;
  const interval = intervalHours && intervalHours > 0 ? intervalHours : DEFAULT_INTERVAL_H[venueKey] ?? 8;
  return parsed * (HOURS_PER_YEAR / interval) * 100;
};

/**
 * Cross-venue predicted funding for every perp, annualized and reduced to a
 * carry spread. Keyless (Hyperliquid public `predictedFundings`), so it needs
 * no backend proxy. HL is always quoted; Binance/Bybit may be null per coin.
 */
export const getPredictedFundings = async (): Promise<FundingCarryRow[]> => {
  const url = `${API_URLS.HYPERLIQUID_API}/info`;
  const response = await postExternal<HlPredictedFundingsResponse>(url, { type: 'predictedFundings' });
  if (!Array.isArray(response)) return [];

  const rows: FundingCarryRow[] = [];
  for (const entry of response) {
    const coin = entry?.[0];
    const venues = entry?.[1];
    if (!coin || !Array.isArray(venues)) continue;

    let hlApr: number | null = null;
    let binanceApr: number | null = null;
    let bybitApr: number | null = null;

    for (const pair of venues) {
      const venueKey = pair?.[0];
      const data = pair?.[1];
      const apr = data ? aprPct(data.fundingRate, data.fundingIntervalHours, venueKey) : null;
      if (venueKey === 'HlPerp') hlApr = apr;
      else if (venueKey === 'BinPerp') binanceApr = apr;
      else if (venueKey === 'BybitPerp') bybitApr = apr;
    }

    const present: { label: string; apr: number }[] = [];
    if (hlApr != null) present.push({ label: VENUE_LABEL.HlPerp, apr: hlApr });
    if (binanceApr != null) present.push({ label: VENUE_LABEL.BinPerp, apr: binanceApr });
    if (bybitApr != null) present.push({ label: VENUE_LABEL.BybitPerp, apr: bybitApr });

    // Carry = APR of the venue that pays the most minus the one that pays the
    // least. Short the payer (receive funding), long the cheapest (pay least).
    let spread: number | null = null;
    let longVenue: string | null = null;
    let shortVenue: string | null = null;
    if (present.length >= 2) {
      const high = present.reduce((a, b) => (b.apr > a.apr ? b : a));
      const low = present.reduce((a, b) => (b.apr < a.apr ? b : a));
      spread = high.apr - low.apr;
      shortVenue = high.label;
      longVenue = low.label;
    }

    rows.push({ coin, hlApr, binanceApr, bybitApr, spread, longVenue, shortVenue, venueCount: present.length });
  }

  return rows;
};
