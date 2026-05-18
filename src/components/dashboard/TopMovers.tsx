"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TokenIcon } from "@/components/common";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import type { SpotToken } from "@/services/market/spot/types";

/**
 * TopMovers — liste curée des plus gros mouvements 24h (spot).
 *
 * Pas un tableau : 3 hausses + 2 baisses, en lignes légères. Le détail
 * complet vit sur /market/spot.
 */

function MoverRow({ token, onClick }: { token: SpotToken; onClick: () => void }) {
  const positive = token.change24h >= 0;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors text-left"
    >
      <TokenIcon src={token.logo} name={token.name} size="sm" />
      <span className="font-medium text-text-primary flex-1 truncate">{token.name}</span>
      <span className={`mono text-[13px] font-semibold ${positive ? "text-success" : "text-danger"}`}>
        {positive ? "+" : ""}
        {token.change24h.toFixed(2)}%
      </span>
    </button>
  );
}

export const TopMovers = memo(function TopMovers() {
  const router = useRouter();
  const { data, isLoading, error } = useTrendingSpotTokens(40, "change24h", "desc");

  const { gainers, losers } = useMemo(() => {
    const list = (data ?? []).filter((t) => Number.isFinite(t.change24h));
    return {
      gainers: list.slice(0, 3),
      losers: [...list].reverse().slice(0, 2),
    };
  }, [data]);

  const go = (name: string) => router.push(`/market/spot/${encodeURIComponent(name)}`);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h3 className="text-xs font-semibold text-text-primary">Top Movers</h3>
        <Link
          href="/market/spot"
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          Markets
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {error ? (
        <div className="px-4 py-6 text-center text-danger text-sm">Failed to load movers</div>
      ) : isLoading ? (
        <div className="px-4 py-6 text-center text-text-tertiary text-sm">…</div>
      ) : (
        <div className="flex flex-col py-1">
          {gainers.map((t) => (
            <MoverRow key={`g-${t.name}`} token={t} onClick={() => go(t.name)} />
          ))}
          {losers.length > 0 && <div className="my-1 border-t border-border-subtle" />}
          {losers.map((t) => (
            <MoverRow key={`l-${t.name}`} token={t} onClick={() => go(t.name)} />
          ))}
        </div>
      )}
    </Card>
  );
});
