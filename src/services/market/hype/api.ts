import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import { ASSISTANCE_FUND_ADDRESS, HYPE_SPOT_COIN } from './constants';
import type { AfFill } from './types';

interface RawFill {
  coin: string;
  px: string;
  sz: string;
  side: string;
  time: number;
}

/**
 * Fetch the Assistance Fund's HYPE buy fills in a time window — the real,
 * on-chain buyback feed. `userFillsByTime` returns fills ascending from
 * `startTime`, capped at 2000 (a single UTC day stays well under that).
 */
export const fetchAfFills = async (
  startTime: number,
  endTime: number,
): Promise<AfFill[]> => {
  return withErrorHandling(async () => {
    const res = await postExternal<RawFill[]>(`${API_URLS.HYPERLIQUID_API}/info`, {
      type: 'userFillsByTime',
      user: ASSISTANCE_FUND_ADDRESS,
      startTime,
      endTime,
    });
    return (res ?? [])
      .filter((f) => f.coin === HYPE_SPOT_COIN && f.side === 'B')
      .map((f) => ({ time: f.time, px: parseFloat(f.px), sz: parseFloat(f.sz) }));
  }, 'fetching assistance fund fills');
};

interface SpotAssetCtx {
  dayNtlVlm?: string;
}

/** HYPE 24h spot notional volume from `spotMetaAndAssetCtxs` (ctx index 107). */
export const fetchHypeDayVolume = async (): Promise<number> => {
  return withErrorHandling(async () => {
    const res = await postExternal<[unknown, SpotAssetCtx[]]>(
      `${API_URLS.HYPERLIQUID_API}/info`,
      { type: 'spotMetaAndAssetCtxs' },
    );
    const ctxs = res?.[1] ?? [];
    const idx = parseInt(HYPE_SPOT_COIN.replace('@', ''), 10);
    const vol = ctxs[idx]?.dayNtlVlm;
    return vol ? parseFloat(vol) : 0;
  }, 'fetching hype day volume');
};
