"use client";

import { memo, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHead, KpiRibbon, ShareTile, type KpiCell } from "@/components/common";
import { compactCount, compactUsd } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype";
import { useElysiumFees, type ElysiumContractKind, type ElysiumFeesAnalytics, type ElysiumFeesWindow } from "@/services/elysium";
import { IngestNotice } from "./ElysiumCharts";
import { AddrLink, EMPTY, Empty, delta, short } from "./shared";
import { fmtHypeFee } from "./fee-format";

const KIND_TONE: Record<ElysiumContractKind, string> = {
  precompile: "bg-surface-2 text-text-tertiary",
  token: "bg-gold/10 text-gold",
  contract: "bg-brand/10 text-brand",
};

/** Announced share of sequencer revenue for apps using Elysium blockspace. */
const APP_POOL_SHARE = 0.25;

const WINDOWS: { value: ElysiumFeesWindow; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const pct = (v: number) => `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%`;

const ShareBar = ({ share }: { share: number }) => (
  <div className="flex items-center gap-2 justify-end">
    <span className="h-1.5 w-16 rounded-full bg-surface-2 overflow-hidden hidden sm:block">
      <span className="block h-full bg-brand" style={{ width: `${Math.min(100, share * 100)}%` }} />
    </span>
    <span className="w-10 text-right">{pct(share)}</span>
  </div>
);

const ByContract = memo(function ByContract({ data }: { data: ElysiumFeesAnalytics }) {
  const appTotal = data.totals.appFeesHype;
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Fees by contract"
        tag={`top ${data.contracts.length}, HYPE`}
      />
      <div className="overflow-x-auto">
        {data.contracts.length === 0 ? (
          <Empty>No fees indexed in this window.</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                <th className="text-left font-semibold px-3.5 py-2">Contract</th>
                <th className="text-left font-semibold px-2 py-2 hidden sm:table-cell">Kind</th>
                <th className="text-right font-semibold px-2 py-2">Fees</th>
                <th className="text-right font-semibold px-2 py-2">Share</th>
                <th className="text-right font-semibold px-2 py-2 whitespace-nowrap hidden sm:table-cell">vs prev.</th>
                <th className="text-right font-semibold px-2 py-2 hidden md:table-cell">Txs</th>
                <th className="text-right font-semibold px-2 py-2 hidden md:table-cell">Callers</th>
                <th className="text-right font-semibold px-2 py-2 whitespace-nowrap hidden lg:table-cell">Avg fee</th>
                <th className="text-right font-semibold px-2 py-2 whitespace-nowrap hidden lg:table-cell" title="If 25% of fees went to apps, split by fees paid">
                  25% pool est.
                </th>
                <th className="text-left font-semibold px-3.5 py-2 hidden xl:table-cell">Deployed by</th>
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((r) => {
                const d = delta(r.feesHype, r.feesHypePrev);
                const isApp = r.kind !== "precompile";
                const poolEst = isApp && appTotal > 0 ? (r.feesHype / appTotal) * APP_POOL_SHARE * data.totals.feesHype : null;
                return (
                  <tr key={r.address} className="border-t border-border-subtle">
                    <td className="px-3.5 py-1.5 whitespace-nowrap">
                      <AddrLink address={r.address} className="text-text-primary">
                        {r.label || r.symbol || short(r.address)}
                      </AddrLink>
                    </td>
                    <td className="px-2 py-1.5 hidden sm:table-cell">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_TONE[r.kind]}`}>
                        {r.kind === "precompile" ? "system" : r.kind}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-gold">{fmtHypeFee(r.feesHype)}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary">
                      <ShareBar share={r.share} />
                    </td>
                    <td className={`px-2 py-1.5 text-right hidden sm:table-cell ${d ? (d.up ? "text-success" : "text-danger") : "text-text-tertiary"}`}>
                      {r.feesHypePrev > 0 ? d?.text ?? EMPTY : "new"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-text-primary hidden md:table-cell">{compactCount(r.txs)}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary hidden md:table-cell">{compactCount(r.callers)}</td>
                    <td className="px-2 py-1.5 text-right text-text-tertiary hidden lg:table-cell">{fmtHypeFee(r.avgFeeHype)}</td>
                    <td className="px-2 py-1.5 text-right text-text-secondary hidden lg:table-cell">{poolEst != null ? fmtHypeFee(poolEst) : EMPTY}</td>
                    <td className="px-3.5 py-1.5 whitespace-nowrap hidden xl:table-cell">
                      {r.deployer ? (
                        <AddrLink address={r.deployer} className="text-text-tertiary" />
                      ) : (
                        <span className="text-text-tertiary">{r.kind === "precompile" ? "system" : EMPTY}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

const ByDeployer = memo(function ByDeployer({ data }: { data: ElysiumFeesAnalytics }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Fees by deployer"
        tag="all their contracts, HYPE"
      />
      <div className="overflow-x-auto">
        {data.deployers.length === 0 ? (
          <Empty>No deployer has fees in this window.</Empty>
        ) : (
          <table className="w-full mono text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
                <th className="text-left font-semibold px-3.5 py-2">Deployer</th>
                <th className="text-right font-semibold px-2 py-2">Contracts</th>
                <th className="text-right font-semibold px-2 py-2">Fees</th>
                <th className="text-right font-semibold px-2 py-2">Share</th>
                <th className="text-right font-semibold px-3.5 py-2 hidden sm:table-cell">Txs</th>
              </tr>
            </thead>
            <tbody>
              {data.deployers.map((r) => (
                <tr key={r.deployer} className="border-t border-border-subtle">
                  <td className="px-3.5 py-1.5 whitespace-nowrap">
                    <AddrLink address={r.deployer} className="text-text-primary" />
                  </td>
                  <td className="px-2 py-1.5 text-right text-text-secondary">{compactCount(r.contracts)}</td>
                  <td className="px-2 py-1.5 text-right text-gold">{fmtHypeFee(r.feesHype)}</td>
                  <td className="px-2 py-1.5 text-right text-text-secondary">
                    <ShareBar share={r.share} />
                  </td>
                  <td className="px-3.5 py-1.5 text-right text-text-primary hidden sm:table-cell">{compactCount(r.txs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
});

/**
 * Elysium · Fees by app: who pays for the blockspace. Every non-spam
 * transaction's full fee, grouped by the contract it called and by the
 * address that deployed that contract.
 */
export function ElysiumFees() {
  const [window, setWindow] = useState<ElysiumFeesWindow>("7d");
  const { data, error } = useElysiumFees(window);
  const { price } = useHypePrice();
  const t = data?.totals;
  const usd = (h: number | undefined) => (price && h != null ? compactUsd(h * price) : undefined);

  const cells: KpiCell[] = [
    { key: "fees", label: "Fees paid", value: t ? `${fmtHypeFee(t.feesHype)} HYPE` : "…", sub: usd(t?.feesHype) ?? `last ${window}`, tone: "gold" },
    { key: "apps", label: "Paid to apps", value: t ? pct(t.appShare) : "…", sub: t ? `${fmtHypeFee(t.appFeesHype)} HYPE, ${compactCount(t.apps)} contracts` : undefined },
    { key: "system", label: "System calls", value: t ? pct(t.systemShare) : "…", sub: "bridge retryables, precompiles" },
    {
      key: "transfers",
      label: "Plain transfers",
      value: t ? pct(Math.max(0, 1 - t.appShare - t.systemShare)) : "…",
      sub: "to wallets, not contracts",
    },
    {
      key: "pool",
      label: "25% app pool",
      value: t ? `${fmtHypeFee(t.feesHype * APP_POOL_SHARE)} HYPE` : "…",
      sub: "if taken on these fees",
    },
  ];

  return (
    <div className="space-y-4">
      <IngestNotice />
      <div className="flex flex-wrap items-center gap-2">
        <PillTabs tabs={WINDOWS} activeTab={window} onTabChange={(v) => setWindow(v as ElysiumFeesWindow)} />
        <span className="text-[11px] text-text-tertiary">non-spam transactions, full fee including posting to HyperEVM</span>
        {data && data.contracts.length > 0 && (
          <span className="ml-auto">
            <ShareTile src={`/api/tile/elysium-app-fees?window=${window}`} filename={`elysium-app-fees-${window}`} />
          </span>
        )}
      </div>
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />
      {!data ? (
        <Card>
          <Empty>{error ? "Analytics are unavailable right now." : "Adding up fees…"}</Empty>
        </Card>
      ) : (
        <>
          <ByContract data={data} />
          <ByDeployer data={data} />
        </>
      )}
      <p className="text-[11px] text-text-tertiary flex items-start gap-1.5 leading-relaxed">
        <Info size={12} className="mt-0.5 shrink-0" />
        Kinetiq has announced that 25% of sequencer revenue goes to the applications that consume Elysium blockspace,
        without publishing how it is split. The pool columns are our estimate: 25% of the fees in the window, split
        between apps in proportion to the fees their calls paid. Precompiles are Arbitrum system contracts and are not
        counted as apps. µ = millionths of HYPE.
      </p>
    </div>
  );
}
