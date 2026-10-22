"use client";

import { useState } from "react";
import { formatUnits } from "viem";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, type KpiCell } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { ELYSIUM_CHAIN, ELYSIUM_CHAIN_INFO_URL, ELYSIUM_ROLLUP_CONTRACTS, PRECOMPILE_ROLES } from "@/lib/elysium-chain";
import { ELYSIUM_ALT_RPC_URL, PRECOMPILE, useElysiumNetwork } from "@/services/elysium/rpc";
import { EMPTY, Empty, ExtLink, short } from "./shared";

const gwei = (wei: bigint) => `${Number(formatUnits(wei, 9)).toLocaleString("en-US", { maximumFractionDigits: 6 })} gwei`;
const hype = (wei: bigint) => `${Number(formatUnits(wei, 18)).toLocaleString("en-US", { maximumSignificantDigits: 3 })} HYPE`;

function Row({ k, v, copy, hint }: { k: string; v: React.ReactNode; copy?: string; hint?: string }) {
  return (
    <div className="flex gap-3 py-1.5 border-t border-border-subtle first:border-t-0">
      <dt className="w-[38%] shrink-0 text-text-tertiary">{k}</dt>
      <dd className="min-w-0 flex-1 text-text-primary">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="mono break-all">{v}</span>
          {copy ? <CopyButton text={copy} /> : null}
        </div>
        {hint ? <div className="text-[11px] text-text-tertiary mt-0.5 break-all">{hint}</div> : null}
      </dd>
    </div>
  );
}

type Eip1193 = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };

/** One-click network add for injected wallets (MetaMask, Rabby...). */
function AddToWallet() {
  const [state, setState] = useState<"idle" | "added" | "error" | "none">("idle");
  const add = async () => {
    const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
    if (!eth) return setState("none");
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${ELYSIUM_CHAIN.chainId.toString(16)}`,
          chainName: "Elysium Testnet",
          nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
          rpcUrls: [ELYSIUM_CHAIN.rpc],
          blockExplorerUrls: [ELYSIUM_CHAIN.explorer],
        }],
      });
      setState("added");
    } catch {
      setState("error");
    }
  };
  const label = { idle: "Add Elysium to wallet", added: "Added", error: "Wallet refused, try again", none: "No browser wallet found" }[state];
  return (
    <Button size="sm" variant="outline" onClick={add}>
      {label}
    </Button>
  );
}

/**
 * Elysium · Network: everything a builder needs before the first deploy,
 * read live from the RPC and the Arbitrum precompiles, plus the fixed
 * deployment facts from the published chain config.
 */
export function ElysiumNetwork() {
  const { data: n, error } = useElysiumNetwork();

  const cells: KpiCell[] = [
    { key: "chain", label: "Chain ID", value: n ? String(n.chainId) : "…", sub: `parent chain ${ELYSIUM_CHAIN.parentChainId} (HyperEVM testnet)` },
    { key: "arbos", label: "ArbOS", value: n ? String(n.arbOS) : "…", sub: n?.stylusVersion != null ? `Stylus v${n.stylusVersion} enabled` : undefined },
    { key: "bt", label: "Block time", value: n ? `${n.blockTimeS.toFixed(2)} s` : "…", sub: n ? `mean, last ${n.sampleBlocks} blocks` : undefined },
    { key: "gas", label: "Gas price", value: n ? gwei(n.gasPriceWei) : "…", tone: "gold", sub: n ? `floor ${gwei(n.minGasPriceWei)}` : undefined },
    { key: "speed", label: "Speed limit", value: n ? `${compactCount(Number(n.speedLimitGasPerS))} gas/s` : "…", sub: n ? `max ${compactCount(Number(n.txGasLimit))} gas per tx` : undefined },
    { key: "transfer", label: "HYPE transfer", value: n ? hype(n.plainTransferGas * n.gasPriceWei) : "…", sub: n ? `${compactCount(Number(n.plainTransferGas))} gas incl. posting` : undefined },
  ];

  const p = n?.prices;

  return (
    <div className="space-y-4">
      {error && !n ? (
        <Card><Empty>The Elysium RPC is unreachable right now.</Empty></Card>
      ) : null}
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />
      {/* Two independent columns so no card leaves a hole next to a taller neighbour. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Connect" actions={<AddToWallet />} />
            <div className="px-3.5 py-1.5 text-[12px] overflow-x-auto">
              <dl className="text-[12px]">
                  <Row k="RPC" v={ELYSIUM_CHAIN.rpc} copy={ELYSIUM_CHAIN.rpc} hint="Public, CORS open, rate limited. debug_* methods need an API key." />
                  <Row k="Alternate RPC" v={ELYSIUM_ALT_RPC_URL} copy={ELYSIUM_ALT_RPC_URL} hint="Public, CORS open. This page reads through it first." />
                  <Row k="Chain ID" v={`${ELYSIUM_CHAIN.chainId} (0x${ELYSIUM_CHAIN.chainId.toString(16)})`} copy={String(ELYSIUM_CHAIN.chainId)} />
                  <Row k="Currency" v="HYPE, 18 decimals" />
                  <Row k="Explorer" v={<ExtLink href={ELYSIUM_CHAIN.explorer}>{ELYSIUM_CHAIN.explorer}</ExtLink>} />
                  <Row k="Sequencer feed" v={ELYSIUM_CHAIN.sequencerFeed} copy={ELYSIUM_CHAIN.sequencerFeed} hint="Nitro relay feed, for nodes (--node.feed.input.url)" />
                  <Row k="Client" v={n?.clientVersion ?? "…"} hint="Version reported by the RPC that answered" />
                  <Row k="Data availability" v="AnyTrust committee" hint={`DAS REST aggregator ${ELYSIUM_CHAIN.dasRestAggregator}`} />
                  <Row k="Retryables" v={n ? `expire after ${Math.round(n.retryableLifetimeS / 86400)} days` : "…"} hint="ArbRetryableTx.getLifetime()" />
              </dl>
            </div>
          </Card>
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="System contracts on Elysium" tag="Arbitrum precompiles" />
            <ModuleTable
              density="compact"
              columns={[
                { header: "Name", width: 132 },
                { header: "Address", width: 132, align: "left" },
                { header: "Role", align: "left", className: "hidden xl:table-cell" },
              ]}
            >
              {Object.entries(PRECOMPILE).map(([name, address]) => (
                <ModuleTableRow
                  key={name}
                  cells={[
                    <span key="name" className="whitespace-nowrap text-text-primary" title={PRECOMPILE_ROLES[name]}>{name}</span>,
                    <span key="addr" className="whitespace-nowrap">
                      <span className="mono text-text-secondary">{short(address)}</span>
                      <CopyButton text={address} />
                    </span>,
                    <span key="role" className="text-text-tertiary">{PRECOMPILE_ROLES[name]}</span>,
                  ]}
                />
              ))}
            </ModuleTable>
          </Card>
        </div>
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="What a transaction pays" tag="ArbGasInfo.getPricesInWei(), live" />
            <div className="px-3.5 py-1.5 text-[12px] overflow-x-auto">
              {!p ? (
                <Empty>Loading…</Empty>
              ) : (
                <dl className="text-[12px]">
                    <Row k="Per unit of gas" v={gwei(p.perArbGasTotal)} hint={`base ${gwei(p.perArbGasBase)} + congestion ${gwei(p.perArbGasCongestion)}`} />
                    <Row k="Per byte posted to HyperEVM" v={gwei(p.perL1CalldataByte)} hint="Calldata cost of the batch your tx lands in. Smaller calldata, cheaper tx." />
                    <Row k="Per transaction (posting)" v={gwei(p.perL2Tx)} hint="Fixed parent chain cost share of any tx" />
                    <Row k="Per new storage slot" v={gwei(p.perStorageAlloc)} />
                    <Row k="Parent chain base fee" v={gwei(n.l1BaseFeeEstimateWei)} hint="ArbGasInfo.getL1BaseFeeEstimate(), the sequencer's HyperEVM fee estimate" />
                </dl>
              )}
              <p className="text-[11px] text-text-tertiary py-2">
                Priority fees are ignored on Arbitrum chains: eth_feeHistory rewards are all zero here. Set maxFeePerGas at or above the gas price and use eth_estimateGas, which includes the posting cost.
              </p>
            </div>
          </Card>
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Rollup contracts on HyperEVM" tag={`deployed at HyperEVM block ${ELYSIUM_CHAIN.rollupDeployedAtParentBlock.toLocaleString("en-US")}`} />
            <ModuleTable
              density="compact"
              columns={[
                { header: "Name", width: 168 },
                { header: "Address", width: 132, align: "left" },
                { header: "Role", align: "left", className: "hidden sm:table-cell lg:hidden xl:table-cell" },
              ]}
            >
              {ELYSIUM_ROLLUP_CONTRACTS.map((c) => (
                <ModuleTableRow
                  key={c.name}
                  cells={[
                    <span key="name" className="text-text-primary" title={c.role}>{c.name}</span>,
                    <span key="addr" className="whitespace-nowrap">
                      <span className="mono text-text-secondary">{short(c.address)}</span>
                      <CopyButton text={c.address} />
                    </span>,
                    <span key="role" className="text-text-tertiary">{c.role}</span>,
                  ]}
                />
              ))}
            </ModuleTable>
            <p className="px-3.5 py-2 text-[11px] text-text-tertiary">
              Source: <ExtLink href={ELYSIUM_CHAIN_INFO_URL} className="text-text-secondary">chain config published by Conduit</ExtLink>.
            </p>
          </Card>
          <Card className="overflow-hidden flex flex-col">
            <CardHead title="Chain governance" tag="ArbOwnerPublic, live" />
            <div className="px-3.5 py-1.5 text-[12px] overflow-x-auto">
              <dl className="text-[12px]">
                  <Row k="Chain owners" v={n ? n.chainOwners.join(", ") || EMPTY : "…"} copy={n?.chainOwners.join(",")} hint={`Initial owner at genesis: ${ELYSIUM_CHAIN.initialChainOwner}`} />
                  <Row k="Network fee account" v={n?.networkFeeAccount ?? "…"} copy={n?.networkFeeAccount} hint="Receives the execution fees" />
              </dl>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
