import { get } from '@/services/api/axios-config';
import { withErrorHandling } from '@/services/api/error-handler';
import { API_URLS } from '@/services/api/constants';
import type {
  DefiPortfolioStats,
  DefiPosition,
  DefiPositionToken,
  DefiProtocol,
  EvmComposition,
  EvmTransaction,
  EvmTransactionsPage,
  EvmTransactionsParams,
  HyperfolioEnvelope,
  PortfolioHistory,
  ProtocolPoints,
  RawCompositionResponse,
  RawNft,
  RawNftsResponse,
  RawPointsResponse,
  RawPortfolioHistoryResponse,
  RawPortfolioStats,
  RawPosition,
  RawPositionToken,
  RawPositionsResponse,
  RawProtocol,
  RawTransaction,
  RawTransactionsResponse,
  WalletNft,
  WalletNftsPage,
} from './types';

const BASE = '/hyperfolio/wallet';

const walletPath = (address: string, leaf: string): string =>
  `${BASE}/${encodeURIComponent(address)}/${leaf}`;

/** `"123.45"` → 123.45; anything unparsable → 0. */
export const num = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const numOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = num(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Hyperfolio returns protocol logos relative to its own site (`/hyperlend.jpg`). */
export const resolveHyperfolioLogo = (logo: string | null | undefined): string | null => {
  if (!logo) return null;
  if (/^https?:\/\//.test(logo)) return logo;
  if (logo.startsWith('/')) return `${API_URLS.HYPERFOLIO_ASSETS}${logo}`;
  return null;
};

/** External explorer page for a HyperEVM transaction hash. */
export const hyperEvmTxUrl = (hash: string): string => `${API_URLS.HYPEREVMSCAN}/tx/${hash}`;

/** Absolute URL of the backend SSE proxy for `/positions/stream`. */
export const buildPositionsStreamUrl = (address: string): string => {
  const base = API_URLS.LOCAL_BACKEND.replace(/\/+$/, '');
  return `${base}${walletPath(address, 'positions/stream')}`;
};

// ==================== NORMALIZERS ====================

export const normalizeComposition = (raw: RawCompositionResponse): EvmComposition => ({
  tokens: (raw.data?.tokens ?? [])
    .map((t) => ({
      address: t.address.toLowerCase(),
      symbol: t.symbol,
      name: t.name,
      balance: num(t.balance),
      price: num(t.usdPrice),
      value: num(t.usdValue),
      logo: t.image_url || null,
    }))
    .sort((a, b) => b.value - a.value),
  totalValue: num(raw.data?.totalWalletValue),
  hypePrice: num(raw.data?.hypePrice),
  updatedAt: raw.cache?.lastUpdate ?? new Date().toISOString(),
});

const normalizePositionToken = (t: RawPositionToken): DefiPositionToken => ({
  address: t.address.toLowerCase(),
  symbol: t.symbol,
  name: t.name,
  logo: t.image_url || null,
  amount: num(t.formattedBalance || t.balance),
  value: num(t.usdValue),
});

const normalizePosition = (p: RawPosition): DefiPosition => {
  const tokens: DefiPositionToken[] = [];
  if (p.details?.token) tokens.push(normalizePositionToken(p.details.token));
  if (Array.isArray(p.details?.tokens)) tokens.push(...p.details.tokens.map(normalizePositionToken));
  const reward = p.details?.reward;
  return {
    id: p.id,
    type: p.type,
    positionType: p.details?.positionType || p.positionType,
    value: num(p.totalValueUSD),
    healthRatio: numOrNull(p.healthRatio),
    apy: numOrNull(p.details?.apy),
    tokens,
    reward: reward
      ? { symbol: reward.symbol, claimable: num(reward.claimable), claimableUsd: num(reward.claimableUsd) }
      : null,
  };
};

export const normalizeProtocol = (p: RawProtocol): DefiProtocol => ({
  id: p.id,
  name: p.name,
  logo: resolveHyperfolioLogo(p.logo),
  url: p.url,
  totalValue: num(p.totalValueUSD),
  weightedApy: p.protocolStats?.weightedApyPercent ?? null,
  positions: (p.positions ?? []).map(normalizePosition).sort((a, b) => b.value - a.value),
  warning: p.warning || null,
  partial: Boolean(p.metadata?.partialData),
});

export const normalizePortfolioStats = (s: RawPortfolioStats): DefiPortfolioStats => ({
  totalValue: num(s.totalValueUSD),
  weightedApy: s.weightedApyPercent ?? null,
  positionsWithApy: s.positionsWithApy ?? 0,
  totalPositions: s.totalPositions ?? 0,
  estimatedYieldDaily: num(s.estimatedYield?.daily),
  estimatedYieldMonthly: num(s.estimatedYield?.monthly),
});

export const normalizeHistory = (raw: RawPortfolioHistoryResponse): PortfolioHistory => ({
  snapshots: (raw.snapshots ?? [])
    .map((s) => ({
      time: s.snapshot_timestamp * 1000,
      total: num(s.total_value_usd),
      tokens: num(s.token_value_usd),
      defi: num(s.defi_value_usd),
      hypercore: num(s.hypercore_value_usd),
      nft: num(s.nft_value_usd),
      protocols: s.protocols_breakdown ?? {},
    }))
    .sort((a, b) => a.time - b.time),
  currentValue: num(raw.summary?.current_value),
  change24h: raw.summary?.change_24h ?? null,
  change7d: raw.summary?.change_7d ?? null,
  change30d: raw.summary?.change_30d ?? null,
  percent24h: raw.summary?.percent_change_24h ?? null,
  percent7d: raw.summary?.percent_change_7d ?? null,
  percent30d: raw.summary?.percent_change_30d ?? null,
  totalSnapshots: raw.summary?.total_snapshots ?? 0,
});

const NATIVE_DECIMALS = 18;

const normalizeTransaction = (tx: RawTransaction): EvmTransaction => {
  const decoded = tx.decoded;
  const tokens = (decoded?.tokens ?? [])
    .map((t) => ({ symbol: t.symbol, amount: num(t.amount), valueUsd: t.valueUSD ?? null }))
    .filter((t) => t.amount > 0);

  // No decoded token legs: derive the transfer from the etherscan-style fields.
  if (tokens.length === 0) {
    if (tx.type === 'token' && tx.tokenSymbol) {
      const decimals = num(tx.tokenDecimal) || NATIVE_DECIMALS;
      tokens.push({ symbol: tx.tokenSymbol, amount: num(tx.value) / 10 ** decimals, valueUsd: null });
    } else if (num(tx.value) > 0) {
      tokens.push({ symbol: 'HYPE', amount: num(tx.value) / 10 ** NATIVE_DECIMALS, valueUsd: null });
    }
  }

  const direction = decoded?.direction;
  const failed = tx.isError === '1' || tx.txreceipt_status === '0';
  const fnName = tx.functionName?.split('(')[0];
  const action = decoded?.action && decoded.action !== 'unknown' ? decoded.action : fnName || 'transfer';

  return {
    hash: tx.hash,
    timestamp: num(tx.timeStamp) * 1000,
    blockNumber: num(tx.blockNumber),
    from: tx.from,
    to: tx.to,
    type: tx.type,
    action,
    protocol: {
      id: decoded?.protocol?.id ?? 'unknown',
      name: decoded?.protocol?.id && decoded.protocol.id !== 'unknown' ? decoded.protocol.name : 'Unknown',
      logo:
        decoded?.protocol?.id && decoded.protocol.id !== 'unknown'
          ? resolveHyperfolioLogo(decoded.protocol.logo)
          : null,
    },
    direction: direction === 'in' || direction === 'out' ? direction : 'neutral',
    tokens,
    failed,
  };
};

const normalizeNft = (n: RawNft, index: number): WalletNft => ({
  id: `${n.address}:${n.tokenId ?? index}`,
  collectionAddress: n.address,
  collectionName: n.collection_name || n.symbol,
  name: n.name,
  tokenId: n.tokenId ?? null,
  image: n.image_url || n.image || null,
  price: numOrNull(n.price),
  floorPrice: numOrNull(n.floorPrice ?? n.floor_price),
});

// ==================== FETCHERS ====================

/** HyperEVM token balances of a wallet (Hyperfolio `/wallet/composition`). */
export const fetchEvmComposition = async (address: string): Promise<EvmComposition> => {
  return withErrorHandling(async () => {
    const res = await get<HyperfolioEnvelope<RawCompositionResponse>>(walletPath(address, 'composition'));
    return normalizeComposition(res.data);
  }, 'fetching HyperEVM wallet composition');
};

/** DeFi positions grouped by protocol — blocking fallback of the SSE stream. */
export const fetchDefiPositions = async (
  address: string
): Promise<{ protocols: DefiProtocol[]; stats: DefiPortfolioStats }> => {
  return withErrorHandling(async () => {
    const res = await get<HyperfolioEnvelope<RawPositionsResponse>>(walletPath(address, 'positions'), undefined, {
      timeoutMs: 65_000,
    });
    return {
      protocols: (res.data.data?.protocols ?? []).map(normalizeProtocol),
      stats: normalizePortfolioStats(res.data.data?.portfolioStats),
    };
  }, 'fetching DeFi positions');
};

/** Daily net-worth snapshots (only populated for wallets tracked by Hyperfolio). */
export const fetchPortfolioHistory = async (address: string, days: number): Promise<PortfolioHistory> => {
  return withErrorHandling(async () => {
    const res = await get<HyperfolioEnvelope<RawPortfolioHistoryResponse>>(walletPath(address, 'history'), { days });
    return normalizeHistory(res.data);
  }, 'fetching portfolio history');
};

/** Decoded HyperEVM transactions, paginated server-side. */
export const fetchEvmTransactions = async (
  address: string,
  params: EvmTransactionsParams
): Promise<EvmTransactionsPage> => {
  return withErrorHandling(async () => {
    const query: Record<string, string | number> = { page: params.page, offset: params.offset };
    if (params.search) query.search = params.search;
    if (params.type && params.type !== 'all') query.type = params.type;
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;
    const res = await get<HyperfolioEnvelope<RawTransactionsResponse>>(walletPath(address, 'transactions'), query, {
      timeoutMs: 50_000,
    });
    return {
      transactions: (res.data.transactions ?? []).map(normalizeTransaction),
      page: res.data.page,
      pageSize: res.data.offset,
      total: res.data.total,
      hasMore: res.data.hasMore,
    };
  }, 'fetching HyperEVM transactions');
};

/** Wallet NFTs sorted by price, paginated server-side. */
export const fetchWalletNfts = async (address: string, page: number, limit: number): Promise<WalletNftsPage> => {
  return withErrorHandling(async () => {
    const res = await get<HyperfolioEnvelope<RawNftsResponse>>(walletPath(address, 'nfts'), { page, limit });
    const d = res.data.data;
    return {
      nfts: (d?.nfts ?? []).map(normalizeNft),
      page: d?.pagination?.page ?? page,
      totalItems: d?.pagination?.totalItems ?? 0,
      totalPages: d?.pagination?.totalPages ?? 0,
      hasNextPage: Boolean(d?.pagination?.hasNextPage),
      totalValue: num(d?.totalNftValue),
    };
  }, 'fetching wallet NFTs');
};

/** Farming points per protocol. */
export const fetchWalletPoints = async (address: string): Promise<ProtocolPoints[]> => {
  return withErrorHandling(async () => {
    const res = await get<HyperfolioEnvelope<RawPointsResponse>>(walletPath(address, 'points'));
    return (res.data.data ?? []).map((p) => ({ protocol: p.protocolName, points: num(p.points) }));
  }, 'fetching wallet points');
};

// ==================== ERROR CLASSIFICATION ====================

export type HyperfolioErrorKind = 'rate-limited' | 'not-configured' | 'bad-input' | 'error';

/** Read the backend error code / HTTP status off an error thrown by the fetchers. */
export const classifyHyperfolioError = (error: unknown): HyperfolioErrorKind => {
  const err = error as { response?: { status?: number; data?: { code?: string } } } | null;
  const status = err?.response?.status;
  const code = err?.response?.data?.code;
  if (status === 429 || code === 'HYPERFOLIO_RATE_LIMITED' || code === 'SSE_CONNECTION_LIMIT') return 'rate-limited';
  if (status === 503 || code === 'HYPERFOLIO_NOT_CONFIGURED') return 'not-configured';
  if (status === 400 || code === 'HYPERFOLIO_BAD_INPUT') return 'bad-input';
  return 'error';
};
