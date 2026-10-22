"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { CardHead, KpiRibbon, ModuleTable, ModuleTableRow, type KpiCell } from "@/components/common";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { ELYSIUM_ANNOUNCED, ELYSIUM_CHAIN, ELYSIUM_TRUST_CONTRACTS as T } from "@/lib/elysium-chain";
import { useElysiumTrust, type ChainChange, type ElysiumTrust as Trust } from "@/services/elysium/trust";
import { AddrLink, duration, Empty, ExtLink, short } from "./shared";

/**
 * Elysium · Trust: who orders transactions, who validates, how long a claim
 * can be challenged, who can upgrade what, and every chain parameter change
 * since genesis. Everything is read live from the rollup contracts on
 * HyperEVM testnet and the system contracts on Elysium.
 */

/** A HyperEVM testnet address: no Elysium page to link to, copy only. */
function ParentAddr({ address }: { address: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="mono text-text-secondary">{short(address)}</span>
      <CopyButton text={address} />
    </span>
  );
}

function Chain({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface-2 px-1.5 py-px text-[10px] text-text-tertiary whitespace-nowrap">{children}</span>
  );
}

type Tone = "brand" | "gold" | "muted";
const TONE: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  gold: "bg-gold/10 text-gold",
  muted: "bg-surface-2 text-text-secondary",
};

interface ControlRow {
  area: string;
  chain: "HyperEVM" | "Elysium" | "Both";
  state: string;
  tone: Tone;
  body: React.ReactNode;
  source: string;
}

const hype = (wei: bigint) => `${Number(formatUnits(wei, 18)).toLocaleString("en-US", { maximumSignificantDigits: 3 })}`;
const gasRate = (v: number) => `${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M gas/s`;

function controlRows(t: Trust): ControlRow[] {
  const p = t.parent;
  const b = t.bridge;
  const forceS = p.forceInclusionBlocks * p.blockTimeS;
  const confirmS = p.confirmPeriodBlocks * p.blockTimeS;
  const sameBeaconOwner = b.walletBeaconOwner.toLowerCase() === b.mirrorBeaconOwner.toLowerCase();
  const beaconOwnerKind = (isContract: boolean) => (isContract ? "a contract" : "a plain wallet, no contract code");

  return [
    {
      area: "Transaction ordering",
      chain: "Elysium",
      state: "One sequencer",
      tone: "muted",
      body: (
        <>
          A single sequencer orders every transaction and posts them in batches to the sequencer inbox on HyperEVM.{" "}
          <span className="mono">{compactCount(p.batches)}</span> batches posted since genesis.
        </>
      ),
      source: "SequencerInbox.batchCount()",
    },
    {
      area: "Escape hatch",
      chain: "HyperEVM",
      state: `After ~${duration(forceS)}`,
      tone: "muted",
      body: (
        <>
          A transaction sent through the HyperEVM inbox can be forced into Elysium by anyone if the sequencer has not
          included it after <span className="mono">{p.forceInclusionBlocks.toLocaleString("en-US")}</span> HyperEVM
          blocks (about {duration(forceS)} at the measured {p.blockTimeS.toFixed(2)} s per block).
          {p.delayBuffer ? " The delay buffer is on: the window shrinks when the sequencer keeps delaying messages." : ""}
        </>
      ),
      source: "SequencerInbox.maxTimeVariation(), isDelayBufferable()",
    },
    {
      area: "State validation",
      chain: "HyperEVM",
      state: p.whitelistOn ? `${p.validators.length} allowlisted` : "Open to anyone",
      tone: p.whitelistOn ? "gold" : "brand",
      body: (
        <>
          State claims are posted and challenged under BoLD.{" "}
          {p.whitelistOn ? "Only allowlisted validators can take part" : "Anyone can take part"}
          {p.validators.length > 0 ? (
            <>
              {": "}
              {p.validators.map((v, i) => (
                <span key={v}>
                  {i > 0 ? ", " : ""}
                  <ParentAddr address={v} />
                </span>
              ))}
            </>
          ) : null}
          . Bond per claim: <span className="mono">{hype(p.baseStakeWei)}</span> WHYPE.
          {p.paused ? " The rollup is paused." : ""}
        </>
      ),
      source: "Rollup.validatorWhitelistDisabled(), getValidators(), baseStake()",
    },
    {
      area: "Challenge period",
      chain: "HyperEVM",
      state: `${p.confirmPeriodBlocks} blocks`,
      tone: "gold",
      body: (
        <>
          A state claim becomes final <span className="mono">{p.confirmPeriodBlocks}</span> HyperEVM blocks (about{" "}
          {duration(confirmS)}) after it is posted, unless someone challenges it. This is the wait before a withdrawal can
          be claimed on HyperEVM. {p.fastConfirmer ? <>Fast confirmer set: <ParentAddr address={p.fastConfirmer} />.</> : "No fast confirmer is set."}{" "}
          <Link href="/elysium/bridge" className="text-brand hover:underline">
            Measured withdrawal times
          </Link>
          .
        </>
      ),
      source: "Rollup.confirmPeriodBlocks(), anyTrustFastConfirmer()",
    },
    {
      area: "Data availability",
      chain: "Elysium",
      state: "AnyTrust committee",
      tone: "muted",
      body: (
        <>
          Transaction data is held by a data availability committee instead of being posted in full to HyperEVM.
          Kinetiq documents an automatic fallback to HyperEVM. Committee size and signing threshold are not published.{" "}
          <ExtLink href={ELYSIUM_ANNOUNCED.securityUrl} className="text-brand">
            Kinetiq docs
          </ExtLink>
        </>
      ),
      source: "Chain config (DataAvailabilityCommittee: true)",
    },
    {
      area: "Rollup upgrades",
      chain: "HyperEVM",
      state: p.holderIsExecutor ? (p.holderIsContract ? "One contract" : "One wallet") : "Holder moved",
      tone: "gold",
      body: (
        <>
          The rollup, bridge, inboxes and outbox can be upgraded by the UpgradeExecutor <ParentAddr address={p.rollupOwner} />,
          which adds no delay of its own.{" "}
          {p.holderIsExecutor ? (
            <>
              Its executor role is held by <ParentAddr address={T.parentExecutorHolder} />,{" "}
              {p.holderIsContract ? "a contract" : "a plain wallet with no contract code"}.
            </>
          ) : (
            <>The holder granted at deployment no longer has the role.</>
          )}{" "}
          {p.deployerStillExecutor ? "The deploy wallet still holds it too." : "The deploy wallet gave its role up after setup."}
        </>
      ),
      source: "Rollup.owner(), UpgradeExecutor.hasRole(EXECUTOR_ROLE)",
    },
    {
      area: "Chain parameters",
      chain: "Elysium",
      state: t.child.parentControlsChild ? "Same keys" : "Separate keys",
      tone: "muted",
      body: (
        <>
          The ArbOS chain owner on Elysium is{" "}
          {t.child.chainOwners.map((o, i) => (
            <span key={o}>
              {i > 0 ? ", " : ""}
              <AddrLink address={o} className="mono" />
            </span>
          ))}
          , an UpgradeExecutor.{" "}
          {t.child.parentControlsChild
            ? "It takes orders from the HyperEVM UpgradeExecutor through the bridge, so the same keys govern both sides. "
            : ""}
          Gas pricing, speed limit, Stylus limits and ArbOS upgrades are all set this way. Every change is listed below.
        </>
      ),
      source: "ArbOwnerPublic.getAllChainOwners(), UpgradeExecutor.hasRole()",
    },
    {
      area: "Bridge contracts",
      chain: "Both",
      state: sameBeaconOwner ? "One owner, both beacons" : "Two owners",
      tone: "gold",
      body: (
        <>
          Every bridge wallet on Elysium and every mirror token on HyperEVM runs the code its beacon points to. Whoever
          owns a beacon can replace that code for all of them at once.{" "}
          {sameBeaconOwner ? (
            <>
              Both beacons are owned by <ParentAddr address={b.walletBeaconOwner} />,{" "}
              {beaconOwnerKind(b.walletBeaconOwnerIsContract && b.mirrorBeaconOwnerIsContract)} on either chain.
            </>
          ) : (
            <>
              Bridge wallet beacon owner <AddrLink address={b.walletBeaconOwner} className="mono" />, mirror token beacon owner{" "}
              <ParentAddr address={b.mirrorBeaconOwner} />.
            </>
          )}{" "}
          Kinetiq lists the beacon as an upgrade vector integrators should monitor.{" "}
          <ExtLink href={ELYSIUM_ANNOUNCED.bridgeArchitectureUrl} className="text-brand">
            Bridge architecture
          </ExtLink>
        </>
      ),
      source: "UpgradeableBeacon.owner(), implementation(), eth_getCode",
    },
  ];
}

const fmtGwei = (wei: string) => `${Number(formatUnits(BigInt(wei), 9)).toLocaleString("en-US", { maximumFractionDigits: 6 })} gwei`;
const UINT64_MAX = "18446744073709551615";

/** One line of plain English per ArbOwner call; the raw call stays visible next to it. */
function describeChange(c: ChainChange): string {
  const [a, b] = c.args;
  switch (c.fn) {
    case "removeChainOwner":
      return `Removed a chain owner (${short(a)})`;
    case "addChainOwner":
      return `Added a chain owner (${short(a)})`;
    case "setMinimumL2BaseFee":
      return `Gas price floor set to ${fmtGwei(a)}`;
    case "setSpeedLimit":
      return `Speed limit set to ${gasRate(Number(a))}`;
    case "setMaxTxGasLimit":
      return `Max gas per transaction set to ${compactCount(Number(a))}`;
    case "scheduleArbOSUpgrade":
      return `ArbOS upgrade to version ${a} scheduled${b === "0" ? ", effective at once" : ` for ${new Date(Number(b) * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`}`;
    case "setWasmMaxSize":
      return `Stylus: max program size set to ${Number(a).toLocaleString("en-US")} byte${a === "1" ? "" : "s"}`;
    case "setWasmMaxStackDepth":
      return `Stylus: max stack depth set to ${Number(a).toLocaleString("en-US")}`;
    case "setWasmActivationGas":
      return a === UINT64_MAX ? "Stylus: activation gas set to the uint64 maximum" : `Stylus: activation gas set to ${compactCount(Number(a))}`;
    case "setNetworkFeeAccount":
      return `Network fee account set to ${short(a)}`;
    case "setInfraFeeAccount":
      return `Infra fee account set to ${short(a)}`;
    default:
      return c.args.length ? `${c.fn}(${c.args.map((x) => (x.length > 20 ? short(x) : x)).join(", ")})` : c.fn;
  }
}

const day = (s: number) =>
  new Date(s * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

export function ElysiumTrust() {
  const { data: t, error } = useElysiumTrust();
  const p = t?.parent;
  const lastConfirmS = p ? (p.head - p.latestConfirmedAtBlock) * p.blockTimeS : null;

  const cells: KpiCell[] = [
    {
      key: "challenge",
      label: "Challenge period",
      value: p ? `${p.confirmPeriodBlocks} blocks` : "…",
      tone: "gold",
      sub: p ? `about ${duration(p.confirmPeriodBlocks * p.blockTimeS)} on HyperEVM` : undefined,
    },
    {
      key: "validators",
      label: "Validators",
      value: p ? (p.whitelistOn ? `${p.validators.length} allowlisted` : "Open") : "…",
      sub: "BoLD",
    },
    {
      key: "confirmed",
      label: "Last confirmation",
      value: lastConfirmS != null ? `${duration(lastConfirmS)} ago` : "…",
      sub: p ? `HyperEVM block ${p.latestConfirmedAtBlock.toLocaleString("en-US")}` : undefined,
    },
    {
      key: "force",
      label: "Force inclusion",
      value: p ? `~${duration(p.forceInclusionBlocks * p.blockTimeS)}` : "…",
      sub: p ? `${compactCount(p.forceInclusionBlocks)} HyperEVM blocks` : undefined,
    },
    { key: "da", label: "Data availability", value: "AnyTrust", sub: "committee, HyperEVM fallback" },
    {
      key: "changes",
      label: "Parameter changes",
      value: t ? String(t.changes.length) : "…",
      sub: "since genesis, by the chain owner",
    },
  ];

  const rows = t ? controlRows(t) : [];
  const announcedMs = ELYSIUM_ANNOUNCED.blockTimeMs;

  return (
    <div className="space-y-4">
      {error && !t ? (
        <Card>
          <Empty>The HyperEVM or Elysium RPC is unreachable right now. These values are read live, try again in a minute.</Empty>
        </Card>
      ) : null}
      <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />

      <Card className="overflow-hidden flex flex-col">
        <CardHead
          title="Who controls what"
          tag="read live from the rollup contracts and system contracts"
        />
        {!t ? (
          <Empty>Reading HyperEVM and Elysium…</Empty>
        ) : (
          <div className="divide-y divide-border-subtle">
            {rows.map((r) => (
              <div key={r.area} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4 gap-y-1.5 px-3.5 py-3">
                <div className="flex md:flex-col items-center md:items-start gap-1.5 flex-wrap">
                  <span className="text-[12.5px] text-text-primary">{r.area}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full px-1.5 py-px text-[10.5px] whitespace-nowrap ${TONE[r.tone]}`}>{r.state}</span>
                    <Chain>{r.chain}</Chain>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] leading-relaxed text-text-secondary">{r.body}</p>
                  <p className="mt-1 text-[10.5px] mono text-text-tertiary break-words">{r.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-4 items-start">
        <Card className="overflow-hidden flex flex-col">
          <CardHead
            title="Chain parameter changes"
            tag="every call the chain owner made, newest first"
          />
          {!t ? (
            <Empty>Loading…</Empty>
          ) : t.changes.length === 0 ? (
            <Empty>No change since genesis.</Empty>
          ) : (
            <ModuleTable
              columns={[
                { header: "Date", width: 132 },
                { header: "Change", align: "left" },
                { header: "Transaction", align: "right", width: 116, className: "hidden sm:table-cell" },
              ]}
            >
              {t.changes.map((c) => (
                <ModuleTableRow
                  key={`${c.txHash}-${c.fn}`}
                  className="align-top"
                  cells={[
                    <span key="day" className="mono whitespace-nowrap text-text-tertiary">{day(c.time)}</span>,
                    <div key="chg">
                      <div className="text-text-primary">{describeChange(c)}</div>
                      <div className="text-[10.5px] text-text-tertiary mono break-all">
                        {c.fn}({c.args.map((x) => (x.length > 20 ? short(x) : x)).join(", ")})
                      </div>
                    </div>,
                    <Link key="tx" href={`/elysium/tx/${c.txHash}`} className="text-text-secondary hover:text-brand mono whitespace-nowrap">
                      {short(c.txHash)}
                    </Link>,
                  ]}
                />
              ))}
            </ModuleTable>
          )}
          <p className="px-3.5 py-2 text-[11px] text-text-tertiary border-t border-border-subtle">
            TargetCallExecuted events of the Elysium UpgradeExecutor, decoded against the ArbOwner interface. Times in UTC.
          </p>
        </Card>

        <Card className="overflow-hidden flex flex-col">
          <CardHead title="Announced vs on chain" />
          <ModuleTable
            density="compact"
            columns={[
              { header: "Metric", width: 91 },
              { header: "Announced", width: 128 },
              { header: "On chain", width: 106 },
            ]}
          >
            <ModuleTableRow
              cells={[
                <span key="m" className="text-text-secondary">Block time</span>,
                <span key="a" className="mono text-text-tertiary">{`${announcedMs[0]} to ${announcedMs[1]} ms`}</span>,
                <span key="c" className="mono text-text-primary">{t ? `${Math.round(t.child.blockTimeS * 1000)} ms` : "…"}</span>,
              ]}
            />
            <ModuleTableRow
              cells={[
                <span key="m" className="text-text-secondary">Gas throughput</span>,
                <span key="a" className="mono text-text-tertiary">{gasRate(ELYSIUM_ANNOUNCED.gasPerS)}</span>,
                <span key="c" className="mono text-text-primary">{t ? gasRate(t.child.speedLimitGasPerS) : "…"}</span>,
              ]}
            />
          </ModuleTable>
          <div className="px-3.5 py-1.5 text-[12px]">
            <p className="text-[11px] text-text-tertiary py-2">
              Block time is the mean over the last 500 Elysium blocks. Gas throughput on chain is the speed limit the chain
              owner sets (ArbGasInfo), the rate above which gas prices start rising. Targets from the{" "}
              <ExtLink href={ELYSIUM_ANNOUNCED.specsUrl} className="text-text-secondary">
                chain specifications
              </ExtLink>
              .
            </p>
          </div>
        </Card>
      </div>

      <p className="text-[11px] text-text-tertiary px-1">
        Elysium testnet (chain {ELYSIUM_CHAIN.chainId}) settling on HyperEVM testnet. Testnets are tuned for fast
        iteration, so these values say how the testnet runs today, not what mainnet will use. Mainnet contracts will be
        read the same way once they are published.
      </p>
    </div>
  );
}
