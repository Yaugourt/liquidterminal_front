"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usePageTitle } from "@/store/use-page-title";
import { AddressDisplay } from "@/components/ui/address-display";
import {
  useBuilderStats,
  useBuilderUsers,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import {
  BuilderDetailStatsGrid,
  BuilderUsersTable,
  formatBuilderDisplayName,
} from "@/components/market/builders";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];
const ETH = /^0x[a-fA-F0-9]{40}$/i;

export default function BuilderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setTitle } = usePageTitle();
  const raw = typeof params.address === "string" ? decodeURIComponent(params.address) : "";
  const address = raw.trim();
  const valid = ETH.test(address);
  const [tf, setTf] = useState<BuildersTimeframe>("24h");

  const stats = useBuilderStats(valid ? address : undefined, tf);
  const users = useBuilderUsers(valid ? address : undefined, { timeframe: tf, limit: 25 });

  const displayName = useMemo(
    () => (stats.stats ? formatBuilderDisplayName(stats.stats.builderName) : null),
    [stats.stats]
  );

  useEffect(() => {
    if (displayName && displayName !== "—") {
      setTitle(`${displayName} · Builder`);
    } else if (valid) {
      setTitle(`${address.slice(0, 8)}… · Builder`);
    } else {
      setTitle("Builder");
    }
  }, [setTitle, displayName, address, valid]);

  if (!valid) {
    return (
      <div className="glass-panel border border-border-subtle rounded-2xl p-8 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-medium text-white mb-2">Invalid address</h2>
        <p className="text-text-secondary text-sm mb-4">Use a checksummed 0x address (40 hex chars).</p>
        <Button
          variant="ghost"
          className="text-brand-accent"
          onClick={() => router.push("/market/builders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builders
        </Button>
      </div>
    );
  }

  const loadingShell = stats.isLoading && !stats.stats && users.isLoading && !users.data;

  if (loadingShell) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/market/builders")}
          className="text-brand-accent hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={tf === t ? "default" : "outline"}
              className={
                tf === t
                  ? "bg-brand-accent/20 text-brand-accent border-brand-accent/40"
                  : "border-border-subtle text-text-secondary hover:bg-white/5"
              }
              onClick={() => setTf(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-lg font-bold text-brand-accent shrink-0">
            {(displayName && displayName !== "—" ? displayName.charAt(0) : address.slice(2, 3)).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {displayName && displayName !== "—" ? displayName : "Builder"}
            </h1>
            <div className="mt-2 max-w-full">
              <AddressDisplay address={address} truncate showExternalLink={false} className="text-sm" />
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">Stats</h2>
        <BuilderDetailStatsGrid stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />
      </section>

      <section className="space-y-3">
        <h2 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider px-1">Top users</h2>
        <BuilderUsersTable
          users={users.data?.users ?? []}
          isLoading={users.isLoading}
          error={users.error}
        />
      </section>
    </div>
  );
}
