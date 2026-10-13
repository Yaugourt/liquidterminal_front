"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePageTitle } from "@/store/use-page-title";
import { useParams, useRouter } from "next/navigation";
import { SpotToken } from "@/services/market/spot/types";
import { fetchTokensWithoutPairs, getToken } from "@/services/market/spot/api";
import { isBridged } from "@/services/market/spot/bridged";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { PillTabs } from "@/components/ui/pill-tabs";
import { TokenCard, TokenData, OrderBook, TokenDetailsBand } from "@/components/market/token";
import { TokenTwapSection } from "@/components/market/token/TokenTwapSection";
import { HoldersTable } from "@/components/market/token/HoldersTable";
import { useTokenHolders } from "@/services/market/spot/hooks/useTokenHolders";
import { useTokenDetails } from "@/services/market/token";
import { TradingLayout } from "@/layouts/TradingLayout";
import { ChartSkeleton, SourceBadge, sourceStatus, type SourceBadgeStatus } from "@/components/common";

// Lazy load TradingViewChart - it uses lightweight-charts which requires DOM
const TradingViewChart = dynamic(
    () => import("@/components/market/token/TradingViewChart").then(mod => ({ default: mod.TradingViewChart })),
    { ssr: false, loading: () => <ChartSkeleton minHeight="min-h-[450px]" /> }
);

type BottomTab = "twap" | "holders";

/** Why the page has no token to show. */
type Missing = "unknown" | "unlisted" | "error";

const MISSING_COPY: Record<Missing, { title: string; body: (name: string) => string }> = {
    unknown: {
        title: "Token not found",
        body: (name) => `No spot token is named "${name}".`,
    },
    unlisted: {
        title: "No spot market yet",
        body: (name) => `${name} is deployed on HyperCore, but no pair trades it yet.`,
    },
    error: {
        title: "Couldn't load this token",
        body: () => "The spot token list didn't load. Retrying every 15 seconds.",
    },
};

/** A lookup that failed (after the HTTP layer's own retries) runs again this often. */
const LOOKUP_RETRY_MS = 15_000;

export default function TokenPage() {
    const { setTitle } = usePageTitle();
    const router = useRouter();
    const params = useParams();
    const token_param = params.token as string;
    const tokenName = decodeURIComponent(token_param);
    const [token, setToken] = useState<SpotToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState<Missing | null>(null);
    /** Bumped by "Retry" to run the lookup again. */
    const [lookupRun, setLookupRun] = useState(0);
    const [activeTab, setActiveTab] = useState<BottomTab>('twap');
    // Both bottom tabs are Hypurrscan-fed (`/twap/*`, `/holders`); one badge
    // follows the active tab's route health.
    const [twapSourceStatus, setTwapSourceStatus] = useState<SourceBadgeStatus>('loading');
    // Remember which tabs have been opened so we mount them once and toggle
    // visibility from then on (no refetch on every tab switch).
    const [visitedTabs, setVisitedTabs] = useState<Set<BottomTab>>(
        () => new Set<BottomTab>(["twap"])
    );

    // Shared data — one fetch each, once the token is found in the spot list
    // (an unlisted name, e.g. an auction winner with no pair yet, has no
    // holders view: the backend answers 404). The holders' first page feeds
    // the band's count and the tab's badge; HoldersTable reads the same page
    // (shared request) and then its own.
    const { data: tokenDetails, isLoading: detailsLoading } = useTokenDetails(token?.tokenId || null);
    const holdersData = useTokenHolders(token ? tokenName : null);

    const selectTab = (tab: BottomTab) => {
        setActiveTab(tab);
        setVisitedTabs((prev) => {
            if (prev.has(tab)) return prev;
            const next = new Set(prev);
            next.add(tab);
            return next;
        });
    };

    useEffect(() => {
        setTitle(`${tokenName} - Market`);
    }, [setTitle, tokenName]);

    useEffect(() => {
        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        const lookUp = async () => {
            try {
                const found = await getToken(tokenName);
                if (cancelled) return;
                if (found) {
                    setToken(found);
                    setMissing(null);
                } else {
                    // Deploy auction winners are linked from the auction cards
                    // before any pair trades them.
                    const unlisted = await fetchTokensWithoutPairs()
                        .then((names) => names.some((n) => n.toLowerCase() === tokenName.toLowerCase()))
                        .catch(() => false);
                    if (cancelled) return;
                    setToken(null);
                    setMissing(unlisted ? "unlisted" : "unknown");
                }
            } catch {
                // The spot list didn't load (the HTTP layer already retried). A
                // backend blip used to end on "not found": say what happened and
                // look again until it answers.
                if (cancelled) return;
                setToken(null);
                setMissing("error");
                retryTimer = setTimeout(() => setLookupRun((run) => run + 1), LOOKUP_RETRY_MS);
            }
            setLoading(false);
        };

        lookUp();
        return () => {
            cancelled = true;
            clearTimeout(retryTimer);
        };
    }, [tokenName, lookupRun]);

    const handleBackToList = () => {
        router.push('/market/spot');
    };

    const retryLookup = () => {
        setLoading(true);
        setMissing(null);
        setLookupRun((run) => run + 1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingState size="md" withCard={false} />
            </div>
        );
    }

    if (!token) {
        const reason = missing ?? "unknown";
        const copy = MISSING_COPY[reason];
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="p-6 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-text-primary mb-4">{copy.title}</div>
                    <div className="text-text-secondary mb-6 text-center">{copy.body(tokenName)}</div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {reason === "error" && (
                            <Button variant="outline" onClick={retryLookup}>
                                Retry
                            </Button>
                        )}
                        {reason === "unlisted" && (
                            <Button variant="outline" asChild>
                                <Link href="/market/spot/auction">Spot deploys</Link>
                            </Button>
                        )}
                        <Button
                            onClick={handleBackToList}
                            className="bg-brand hover:bg-brand/90 text-brand-text-on font-bold"
                        >
                            Back to tokens list
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // `getToken` keeps the name's busiest pair, which is not always quoted in USDC.
    const symbol = `${token.name}/${token.quote ?? "USDC"}`;

    return (
        <TradingLayout
            marketType="spot"
            tokenName={tokenName}
            tokenInfoSlot={
                <TokenCard
                    token={{
                        symbol,
                        name: token.name,
                        type: 'spot',
                        logo: token.logo,
                        price: token.price,
                        change24h: token.change24h,
                        volume24h: token.volume,
                        // Bridged tokens report the full underlying supply, so the
                        // backend "market cap" is the underlying FDV — hide it.
                        marketCap: isBridged(token.name) ? undefined : token.marketCap,
                        marketIndex: token.marketIndex,
                        contract: token.tokenId,
                    } as TokenData}
                    className="mb-6"
                />
            }
            chartSlot={
                <TradingViewChart
                    symbol={symbol}
                    marketIndex={token.marketIndex}
                    tokenName={token.name}
                    className="flex-1 min-h-[450px]"
                />
            }
            orderBookSlot={
                <OrderBook
                    symbol={symbol}
                    marketIndex={token.marketIndex}
                    tokenNameProp={token.name}
                />
            }
            bottomSectionSlot={
                <div className="mt-4 space-y-4">
                    <TokenDetailsBand
                        token={token}
                        details={tokenDetails}
                        detailsLoading={detailsLoading}
                        holdersCount={holdersData.holdersCount}
                        holdersLoading={holdersData.isLoading}
                    />

                    <div className="space-y-2.5">
                        <div className="flex items-center">
                            <PillTabs
                                variant="text"
                                tabs={[
                                    { value: "twap", label: "TWAP" },
                                    { value: "holders", label: "Holders" },
                                ]}
                                activeTab={activeTab}
                                onTabChange={(v) => selectTab(v as BottomTab)}
                            />
                            <SourceBadge
                                source={activeTab === 'holders' ? "hypurrscan" : "hypedexer"}
                                status={
                                    activeTab === 'holders'
                                        ? sourceStatus(holdersData.error, holdersData.isLoading, holdersData.isStale)
                                        : twapSourceStatus
                                }
                                className="ml-auto"
                            />
                        </div>
                        {/* Both tabs stay mounted once visited, then just toggled
                            with `hidden` so switching no longer refetches. */}
                        {visitedTabs.has('twap') && (
                            <div className={activeTab === 'twap' ? '' : 'hidden'}>
                                <TokenTwapSection tokenName={token.name} onSourceStatus={setTwapSourceStatus} />
                            </div>
                        )}
                        {visitedTabs.has('holders') && (
                            <div className={activeTab === 'holders' ? '' : 'hidden'}>
                                <HoldersTable
                                    tokenName={tokenName}
                                    tokenPrice={token.price}
                                    totalSupply={tokenDetails?.totalSupply ? parseFloat(tokenDetails.totalSupply) : undefined}
                                />
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
}
