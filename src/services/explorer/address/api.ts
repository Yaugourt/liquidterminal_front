import {
    UserTransactionsResponse,
    NonFundingLedgerUpdate,
    NonFundingLedgerHistory,
    UserFill,
    FormattedUserTransaction,
    PortfolioApiResponse,
    OpenOrdersResponse,
} from './types';
import { postExternal } from '../../api/axios-config';
import { withErrorHandling } from '../../api/error-handler';
import { API_URLS } from '../../api/constants';
import {
    processFillTransactions,
    processUserTransactions,
    processOrphanLedgerUpdates
} from './processors';
import { isNullHash, withRowIds } from './utils';
import { decodeAddressActivity, type Activity } from './decode';
import { loadAssetResolver } from './assets';

/** The address page asks for the same raw history from several widgets: share it for 30s. */
const rawCache = new Map<string, { at: number; value: Promise<unknown> }>();
function shared<T>(key: string, load: () => Promise<T>): Promise<T> {
    const hit = rawCache.get(key);
    if (hit && Date.now() - hit.at < 30_000) return hit.value as Promise<T>;
    const value = load();
    rawCache.set(key, { at: Date.now(), value });
    value.catch(() => rawCache.delete(key));
    return value;
}

async function getUserTransactionsRaw(address: string): Promise<UserTransactionsResponse> {
    return shared(`details:${address.toLowerCase()}`, () => getUserTransactionsRawUncached(address));
}

async function getUserTransactionsRawUncached(address: string): Promise<UserTransactionsResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_RPC}/explorer`;
        return await postExternal<UserTransactionsResponse>(url, {
            type: "userDetails",
            user: address
        });
    }, 'fetching raw transactions');
}

/**
 * Raw HL non-funding ledger (deposits, withdrawals, transfers, vault moves,
 * liquidations) since 2022 — the capital-flow source for the address digest.
 */
export async function getUserNonFundingLedgerUpdates(address: string): Promise<NonFundingLedgerUpdate[]> {
    return shared(`ledger:${address.toLowerCase()}`, () => withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<NonFundingLedgerUpdate[]>(url, {
            type: "userNonFundingLedgerUpdates",
            user: address,
            startTime: 1640995200000
        });
    }, 'fetching ledger updates'));
}

/** HL answers at most this many ledger rows per call, oldest first. */
const LEDGER_PAGE_SIZE = 2000;
/** Full ledger pages never change (the ledger only appends): kept for the session. */
const fullLedgerPages = new Map<string, NonFundingLedgerUpdate[]>();
const MAX_CACHED_LEDGER_PAGES = 24;

async function getLedgerPageFrom(address: string, startTime: number): Promise<NonFundingLedgerUpdate[]> {
    const cacheKey = `${address.toLowerCase()}:${startTime}`;
    const hit = fullLedgerPages.get(cacheKey);
    if (hit) return hit;
    const page = await withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<NonFundingLedgerUpdate[]>(url, {
            type: "userNonFundingLedgerUpdates",
            user: address,
            startTime
        });
    }, 'fetching ledger updates page');
    if (page.length >= LEDGER_PAGE_SIZE) {
        if (fullLedgerPages.size >= MAX_CACHED_LEDGER_PAGES) {
            const oldest = fullLedgerPages.keys().next().value;
            if (oldest !== undefined) fullLedgerPages.delete(oldest);
        }
        fullLedgerPages.set(cacheKey, page);
    }
    return page;
}

const ledgerRowKey = (u: NonFundingLedgerUpdate): string => `${u.hash}:${JSON.stringify(u.delta)}`;

/**
 * The non-funding ledger beyond HL's 2,000-row answer: pages forward from the
 * last row's time while a page comes back full, up to `maxPages` calls. The
 * first page is the shared `getUserNonFundingLedgerUpdates` read. Several
 * rows can share the boundary millisecond (a send and its spotTransfer), so
 * each next page starts AT that time and drops the rows already seen.
 */
export async function getUserNonFundingLedgerHistory(
    address: string,
    maxPages: number
): Promise<NonFundingLedgerHistory> {
    let page = await getUserNonFundingLedgerUpdates(address);
    const updates = [...page];
    for (let pages = 1; page.length >= LEDGER_PAGE_SIZE; pages++) {
        if (pages >= maxPages) return { updates, truncated: true };
        const boundary = page[page.length - 1].time;
        const seen = new Set(page.filter((u) => u.time === boundary).map(ledgerRowKey));
        try {
            page = await getLedgerPageFrom(address, boundary);
        } catch {
            // A tail page failing (HL 429, timeout) keeps what was read, flagged
            // partial; the next poll resumes from the cached full pages.
            return { updates, truncated: true };
        }
        const fresh = page.filter((u) => u.time !== boundary || !seen.has(ledgerRowKey(u)));
        // A full page inside a single millisecond: no way to move past it.
        if (fresh.length === 0) return { updates, truncated: page.length >= LEDGER_PAGE_SIZE };
        updates.push(...fresh);
    }
    return { updates, truncated: false };
}

export async function getUserFills(address: string): Promise<UserFill[]> {
    return shared(`fills:${address.toLowerCase()}`, () => withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<UserFill[]>(url, {
            type: "userFills",
            user: address
        });
    }, 'fetching user fills'));
}

/**
 * The address activity feed: explorer transactions, fills and non-funding
 * ledger decoded into readable rows (see decode.ts).
 */
export async function getAddressActivity(address: string): Promise<Activity[]> {
    return withErrorHandling(async () => {
        const [raw, ledger, fills, assets] = await Promise.all([
            getUserTransactionsRaw(address),
            getUserNonFundingLedgerUpdates(address),
            getUserFills(address),
            loadAssetResolver(),
        ]);
        return decodeAddressActivity(address, raw.txs ?? [], fills, ledger, assets);
    }, 'fetching address activity');
}

export async function getUserTransactions(address: string): Promise<FormattedUserTransaction[]> {
    return withErrorHandling(async () => {
        const [rawTransactions, ledgerUpdates, fills] = await Promise.all([
            getUserTransactionsRaw(address),
            getUserNonFundingLedgerUpdates(address),
            getUserFills(address)
        ]);

        const fillTransactions = processFillTransactions(fills, address);

        // Les hashs nuls ne relient rien entre eux : exclus de tous les index par hash
        const realHashes = (rows: { hash: string }[]) => rows.map(row => row.hash).filter(hash => !isNullHash(hash));

        // Créer un Set des hashs déjà traités
        const processedHashes = new Set(realHashes(fillTransactions));
        const ledgerMap = new Map(ledgerUpdates.filter(update => !isNullHash(update.hash)).map(update => [update.hash, update]));
        const fillsMap = new Map(fills.filter(fill => !isNullHash(fill.hash)).map(fill => [fill.hash, fill]));

        const userTransactions = processUserTransactions(rawTransactions.txs, address, processedHashes, ledgerMap, fillsMap);

        // Ajout des ledgerUpdates orphelins (withdraw/deposit sans tx brute associée)
        const allHashes = new Set([
            ...realHashes(fillTransactions),
            ...realHashes(userTransactions)
        ]);
        const orphanLedgerUpdates = processOrphanLedgerUpdates(ledgerUpdates, allHashes, address);

        return withRowIds(
            [...fillTransactions, ...userTransactions, ...orphanLedgerUpdates]
                .sort((a, b) => b.time - a.time)
        );
    }, 'fetching user transactions');
}

export async function fetchPortfolio(address: string): Promise<PortfolioApiResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_UI_API}/info`;
        return await postExternal<PortfolioApiResponse>(url, {
            type: 'portfolio',
            user: address,
        });
    }, 'fetching portfolio');
}

export async function getUserOpenOrders(address: string): Promise<OpenOrdersResponse> {
    return withErrorHandling(async () => {
        const url = `${API_URLS.HYPERLIQUID_API}/info`;
        return await postExternal<OpenOrdersResponse>(url, {
            type: "frontendOpenOrders",
            user: address
        });
    }, 'fetching open orders');
}

