"use client";

import { memo, useState } from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, ShareTile, type KpiCell } from "@/components/common";
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
          <ModuleTable
            columns={[
              // No width on Contract: it takes the room left and truncates (its title has the name).
              // Share keeps its 64 px bar, so it shows from sm; the two estimates wait for xl.
              { header: "Contract" },
              { header: "Kind", width: 84, align: "left", className: "hidden sm:table-cell" },
              { header: "Fees", width: 76 },
              { header: "Share", width: 136, className: "hidden sm:table-cell" },
              { header: "vs prev.", width: 80, className: "hidden sm:table-cell" },
              { header: "Txs", width: 76, className: "hidden md:table-cell" },
              { header: "Callers", width: 76, className: "hidden md:table-cell" },
              { header: "Avg fee", width: 76, className: "hidden xl:table-cell" },
              {
                header: <span title="If 25% of fees went to apps, split by fees paid">25% pool est.</span>,
                width: 116,
                className: "hidden xl:table-cell",
              },
              { header: "Deployed by", width: 126, align: "left", className: "hidden xl:table-cell" },
            ]}
          >
            {data.contracts.map((r) => {
              const d = delta(r.feesHype, r.feesHypePrev);
              const isApp = r.kind !== "precompile";
              const poolEst = isApp && appTotal > 0 ? (r.feesHype / appTotal) * APP_POOL_SHARE * data.totals.feesHype : null;
              return (
                <ModuleTableRow
                  key={r.address}
                  cells={[
                    <span key="c" className="mono block whitespace-nowrap" title={r.label || r.symbol || r.address}>
                      <AddrLink address={r.address} className="text-text-primary">
                        {r.label || r.symbol || short(r.address)}
                      </AddrLink>
                    </span>,
                    <span key="k" className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${KIND_TONE[r.kind]}`}>
                      {r.kind === "precompile" ? "system" : r.kind}
                    </span>,
                    <span key="f" className="mono text-gold">{fmtHypeFee(r.feesHype)}</span>,
                    <div key="s" className="mono text-text-secondary">
                      <ShareBar share={r.share} />
                    </div>,
                    <span key="d" className={`mono ${d ? (d.up ? "text-success" : "text-danger") : "text-text-tertiary"}`}>
                      {r.feesHypePrev > 0 ? d?.text ?? EMPTY : "new"}
                    </span>,
                    <span key="t" className="mono text-text-primary">{compactCount(r.txs)}</span>,
                    <span key="cl" className="mono text-text-secondary">{compactCount(r.callers)}</span>,
                    <span key="a" className="mono text-text-tertiary">{fmtHypeFee(r.avgFeeHype)}</span>,
                    <span key="p" className="mono text-text-secondary">{poolEst != null ? fmtHypeFee(poolEst) : EMPTY}</span>,
                    <span key="dep" className="mono whitespace-nowrap">
                      {r.deployer ? (
                        <AddrLink address={r.deployer} className="text-text-tertiary" />
                      ) : (
                        <span className="text-text-tertiary">{r.kind === "precompile" ? "system" : EMPTY}</span>
                      )}
                    </span>,
                  ]}
                />
              );
            })}
          </ModuleTable>
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
          <ModuleTable
            columns={[
              // Share keeps its 64 px bar, so it shows from sm.
              { header: "Deployer", width: 130 },
              { header: "Contracts", width: 92 },
              { header: "Fees", width: 76 },
              { header: "Share", width: 136, className: "hidden sm:table-cell" },
              { header: "Txs", width: 76, className: "hidden sm:table-cell" },
            ]}
          >
            {data.deployers.map((r) => (
              <ModuleTableRow
                key={r.deployer}
                cells={[
                  <span key="d" className="mono whitespace-nowrap">
                    <AddrLink address={r.deployer} className="text-text-primary" />
                  </span>,
                  <span key="c" className="mono text-text-secondary">{compactCount(r.contracts)}</span>,
                  <span key="f" className="mono text-gold">{fmtHypeFee(r.feesHype)}</span>,
                  <div key="s" className="mono text-text-secondary">
                    <ShareBar share={r.share} />
                  </div>,
                  <span key="t" className="mono text-text-primary">{compactCount(r.txs)}</span>,
                ]}
              />
            ))}
          </ModuleTable>
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
