"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Radar, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardHeading } from "@/components/common";
import { useDataFetching } from "@/hooks/useDataFetching";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { ELYSIUM_BRIDGE_UI_URL } from "@/lib/elysium-chain";
import { useNumberFormat } from "@/store/number-format.store";
import { useElysiumBridgeTransfers } from "@/services/elysium";
import { trackBridge, type TrackResult, type TrackStatus, type TrackedTransfer } from "@/services/elysium/bridge-track";
import { AddrLink, ago, duration, Empty, ExtLink, short, useNow } from "./shared";

/**
 * Elysium · Bridge tracker: paste an address or a transaction hash and see
 * where each transfer is. Deposits come from the indexer; withdrawals are
 * checked live against the HyperEVM outbox (confirmed root, spent index), so
 * "ready to claim" and "claimed" are what the chain says right now.
 */

const VISIBLE = 10;

type Finality = { medianS: number | null; p90S: number | null } | undefined;

const STATUS: Record<TrackStatus, { label: string; cls: string }> = {
  arrived: { label: "Arrived", cls: "bg-success/10 text-success" },
  "waiting-elysium": { label: "On its way", cls: "bg-gold/10 text-gold" },
  "redeem-failed": { label: "Retryable failed", cls: "bg-danger/10 text-danger" },
  expired: { label: "Expired", cls: "bg-danger/10 text-danger" },
  claimed: { label: "Claimed on HyperEVM", cls: "bg-success/10 text-success" },
  "ready-to-claim": { label: "Ready to claim", cls: "bg-brand/10 text-brand" },
  "waiting-confirmation": { label: "Waiting for confirmation", cls: "bg-gold/10 text-gold" },
  unknown: { label: "Status unknown", cls: "bg-surface-2 text-text-secondary" },
};

const startedMs = (t: TrackedTransfer) => (t.initiated_time ? Date.parse(`${t.initiated_time}Z`) : NaN);

function Detail({ t, now, dep, wd, root }: { t: TrackedTransfer; now: number; dep: Finality; wd: Finality; root: TrackResult["root"] }) {
  const age = (now - startedMs(t)) / 1000;
  const ref = t.direction === "deposit" ? dep : wd;
  const vsRef =
    ref?.medianS != null && Number.isFinite(age)
      ? ` Usual time: ${duration(ref.medianS)} median, ${duration(ref.p90S)} p90.${ref.p90S != null && age > ref.p90S ? " This one is slower than 9 in 10." : ""}`
      : "";
  switch (t.track) {
    case "arrived":
      return <>Credited on Elysium{t.duration_s != null ? ` after ${duration(t.duration_s)}` : ""}.</>;
    case "waiting-elysium":
      return <>Seen on HyperEVM, not credited on Elysium yet. Deposits are written through retryable tickets.{vsRef}</>;
    case "redeem-failed":
      return <>The retryable ticket failed to execute on Elysium. It can be redeemed manually until it expires.</>;
    case "expired":
      return <>The retryable ticket expired before it was redeemed.</>;
    case "claimed":
      return <>Withdrawn: the HyperEVM outbox marks it as spent.</>;
    case "ready-to-claim":
      return (
        <>
          Covered by a confirmed root and not claimed yet. Claim on HyperEVM from the{" "}
          <ExtLink href={ELYSIUM_BRIDGE_UI_URL} className="text-brand">
            Kinetiq bridge
          </ExtLink>
          .
        </>
      );
    case "waiting-confirmation":
      return (
        <>
          Not covered yet: the last confirmed root reaches Elysium block {root?.l2Block.toLocaleString("en-US")} (
          {ago(root ? root.parentTime * 1000 : NaN, now)} ago). The next root will include it, then it can be claimed.
        </>
      );
    default:
      return <>The outbox or the last confirmed root could not be read right now.</>;
  }
}

export function ElysiumBridgeTracker({ dep, wd }: { dep: Finality; wd: Finality }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = sp.get("track") ?? "";
  const [input, setInput] = useState(q);
  const [showAll, setShowAll] = useState(false);
  const { format } = useNumberFormat();
  const now = useNow(10_000);
  const { data: recent } = useElysiumBridgeTransfers(15);

  const { data, isLoading, error } = useDataFetching<TrackResult | null>({
    fetchFn: () => (q ? trackBridge(q) : Promise.resolve(null)),
    refreshInterval: 60_000,
    dependencies: [q],
    maxRetries: 0,
  });

  const go = (v: string) => {
    const s = v.trim();
    setInput(s);
    router.replace(s ? `${pathname}?track=${s.toLowerCase()}` : pathname, { scroll: false });
  };

  const examples = [
    recent?.find((r) => r.direction === "withdrawal"),
    recent?.find((r) => r.direction === "deposit"),
  ].filter((r): r is NonNullable<typeof r> => !!r);

  const counts = data?.transfers.reduce<Partial<Record<TrackStatus, number>>>((acc, t) => {
    acc[t.track] = (acc[t.track] ?? 0) + 1;
    return acc;
  }, {});
  const amount = (v: number) => formatNumber(v, format, { maximumFractionDigits: v < 1 ? 6 : 2 });
  const focus = data?.focusHash;

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeading
        icon={<Radar size={13} className="text-brand" />}
        title="Track a transfer"
        meta="withdrawals checked live on the HyperEVM outbox"
        metaVariant="plain"
      />
      <div className="px-3.5 pt-3 pb-2 space-y-2">
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); go(input); }}>
          <label htmlFor="bridge-track" className="sr-only">Address or transaction hash</label>
          <input
            id="bridge-track"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your address or a transaction hash, 0x…"
            spellCheck={false}
            className="flex-1 rounded-md border border-border-default bg-surface-2 px-2.5 py-1.5 mono text-[12px] text-text-primary placeholder:text-text-tertiary focus-ring"
          />
          <Button type="submit" size="sm"><Search size={13} className="mr-1.5" />Track</Button>
        </form>
        {examples.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-text-tertiary">Latest bridgers</span>
            {examples.map((r) => (
              <button
                key={r.transfer_id}
                type="button"
                onClick={() => go(r.from_addr)}
                className="rounded bg-surface-2 px-2 py-0.5 hover:text-brand focus-ring"
              >
                {r.direction === "withdrawal" ? "Withdrawal" : "Deposit"} · <span className="mono">{short(r.from_addr)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!q ? null : isLoading && !data ? (
        <Empty>Reading the indexer and the HyperEVM outbox…</Empty>
      ) : error && !data ? (
        <Empty>{error.message || "This lookup failed. Check the address or hash and try again."}</Empty>
      ) : data && data.transfers.length === 0 ? (
        <Empty>No bridge transfer found for {short(data.address)}.</Empty>
      ) : data ? (
        <>
          <div className="px-3.5 pb-2 text-[11.5px] text-text-tertiary">
            Latest {data.transfers.length} transfers of <AddrLink address={data.address} className="mono text-text-secondary" />
          </div>
          {/* One explanation per status present, not one per row. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-3.5 pb-3">
            {(Object.keys(counts ?? {}) as TrackStatus[]).map((k) => {
              const sample = data.transfers.find((t) => t.track === k) as TrackedTransfer;
              return (
                <div key={k} className="rounded-md bg-surface-2 px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-1.5 py-px text-[10.5px] ${STATUS[k].cls}`}>{STATUS[k].label}</span>
                    <span className="text-[11px] mono text-text-secondary">{counts?.[k]}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-text-tertiary">
                    <Detail t={sample} now={now} dep={dep} wd={wd} root={data.root} />
                  </p>
                </div>
              );
            })}
          </div>
          <div className="divide-y divide-border-subtle border-t border-border-subtle">
            {(showAll ? data.transfers : data.transfers.slice(0, VISIBLE)).map((t) => {
              const hit = !!focus && (t.l1_tx_hash?.toLowerCase() === focus || t.l2_tx_hash?.toLowerCase() === focus);
              return (
                <div
                  key={t.transfer_id}
                  className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-3.5 py-2 ${hit ? "bg-brand/5" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className={`rounded-full px-1.5 py-px text-[10.5px] whitespace-nowrap ${STATUS[t.track].cls}`}>
                      {STATUS[t.track].label}
                    </span>
                    <span className="text-[12px] text-text-primary">
                      {t.direction === "withdrawal" ? "Out to HyperEVM" : "In to Elysium"}
                    </span>
                    <span className="text-[12px] mono text-text-secondary">
                      {amount(t.amount)} {t.symbol || "?"}
                    </span>
                    <span className="text-[10.5px] text-text-tertiary">{t.route}</span>
                    {hit ? <span className="text-[10.5px] text-brand">searched tx</span> : null}
                  </div>
                  <div className="text-right text-[11px] text-text-tertiary whitespace-nowrap">
                    {ago(startedMs(t), now)} ago
                    {t.l2_tx_hash ? (
                      <>
                        {" · "}
                        <Link href={`/elysium/tx/${t.l2_tx_hash}`} className="mono hover:text-brand">
                          {short(t.l2_tx_hash)}
                        </Link>
                      </>
                    ) : null}
                  </div>
                  {hit ? (
                    <p className="col-span-2 text-[11.5px] leading-relaxed text-text-tertiary">
                      <Detail t={t} now={now} dep={dep} wd={wd} root={data.root} />
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          {data.transfers.length > VISIBLE ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="border-t border-border-subtle px-3.5 py-2 text-left text-[11.5px] text-text-secondary hover:text-brand focus-ring"
            >
              {showAll ? "Show fewer" : `Show all ${data.transfers.length}`}
            </button>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
