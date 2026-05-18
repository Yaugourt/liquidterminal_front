"use client";

import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4DocList,
  Hip4GlassPanel,
  Hip4SectionTitle,
  Hip4SubsectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4GoldHighlight } from "@/components/hip4/Hip4GoldHighlight";
import {
  HIP4_COIN_ID_NOTE,
  HIP4_L1_ACTIONS,
  HIP4_S3_DATASETS,
  HIP4_SYSTEM_WALLETS,
  HIP4_TESTNET_INFO_URL,
  HIP4_TESTNET_WS_URL,
  HIP4_WS_CHANNELS,
  type Hip4WsChannelRow,
  type Hip4L1ActionRow,
  type Hip4SystemWalletRow,
  type Hip4S3DatasetRow,
} from "@/lib/hip4/core-reference-data";
import { HYPERLIQUID_INFO_SPOT_DOC_URL } from "@/lib/hip4/api-info-spec";
import { TypedDataTable, type Column } from "@/components/common";

const WS_COLUMNS: Column<Hip4WsChannelRow>[] = [
  {
    key: "channel",
    header: "Channel",
    accessor: (r) => (
      <span className="font-mono text-table-cell text-gold">{r.channel}</span>
    ),
  },
  {
    key: "purpose",
    header: "Purpose",
    accessor: (r) => (
      <span className="text-table-cell text-text-secondary">{r.purpose}</span>
    ),
  },
];

const L1_COLUMNS: Column<Hip4L1ActionRow>[] = [
  {
    key: "type",
    header: "type",
    accessor: (r) => (
      <span className="font-mono text-sm text-table-cell text-gold">{r.type}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    accessor: (r) => (
      <span className="text-table-cell text-text-secondary">{r.role}</span>
    ),
  },
];

const WALLET_COLUMNS: Column<Hip4SystemWalletRow>[] = [
  {
    key: "address",
    header: "Address",
    type: "address",
    accessor: (r) => (
      <span className="font-mono text-[11px] text-table-cell">{r.address}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    className: "min-w-[200px]",
    accessor: (r) => (
      <span className="text-table-cell text-text-secondary">{r.role}</span>
    ),
  },
  {
    key: "proof",
    header: "Proof",
    className: "whitespace-nowrap",
    accessor: (r) =>
      r.evidenceUrl ? (
        <Link
          href={r.evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline-offset-2 hover:underline"
        >
          Tx
        </Link>
      ) : (
        <span className="text-text-tertiary">—</span>
      ),
  },
];

const S3_COLUMNS: Column<Hip4S3DatasetRow>[] = [
  {
    key: "path",
    header: "Path / dataset",
    type: "address",
    accessor: (r) => (
      <span className="font-mono text-[11px] text-table-cell">{r.path}</span>
    ),
  },
  {
    key: "notes",
    header: "Notes",
    accessor: (r) => (
      <span className="text-table-cell text-text-secondary">{r.notes}</span>
    ),
  },
];

export function Hip4ReferenceChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="API & data — overview"
        subtitle={
          <>
            <p>
              This page is a <strong className="text-text-primary">compact map</strong>: endpoints, channels,
              L1 action names, infra. It does not duplicate full request/response payloads.
            </p>
            <p>
              For GitBook-style tables and JSON tabs, use{" "}
              <Link href="/hip4/info-api" className="font-medium text-gold underline-offset-2 hover:underline">
                Info endpoint
              </Link>
              .
            </p>
          </>
        }
      />

      <Hip4GlassPanel className="border-gold/25 bg-gold/[0.05]">
        <Hip4SectionTitle className="text-gold">Start here</Hip4SectionTitle>
        <Hip4DocList className="text-sm text-text-secondary marker:text-gold">
          <li>
            <Link
              href="/hip4/info-api"
              className="font-semibold text-gold underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
            >
              Info endpoint (GitBook-style)
            </Link>{" "}
            — <Hip4GoldHighlight>outcomeMeta</Hip4GoldHighlight>,{" "}
            <Hip4GoldHighlight>candleSnapshot</Hip4GoldHighlight>,{" "}
            <Hip4GoldHighlight>userFees</Hip4GoldHighlight>,{" "}
            <Hip4GoldHighlight>userFillsByTime</Hip4GoldHighlight>, WS examples, outcome types, coin
            mapping.
          </li>
          <li>
            <Link
              href="/hip4/fees"
              className="font-semibold text-gold underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
            >
              Trading fees (L1)
            </Link>{" "}
            — proof chain: <Hip4GoldHighlight>SetOutcomeFeeScale</Hip4GoldHighlight>, spot rails,
            normalized fills vs <code className="font-mono text-[11px]">userSpotCrossRate</code>.
          </li>
          <li>
            Official layout reference:{" "}
            <Link
              href={HYPERLIQUID_INFO_SPOT_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:text-gold"
            >
              Hyperliquid Spot — Info endpoint
            </Link>
            .
          </li>
        </Hip4DocList>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Base URLs</Hip4SectionTitle>
        <Hip4SubsectionTitle>Mainnet</Hip4SubsectionTitle>
        <ul className="space-y-3 text-xs">
          <li>
            <span className="block text-text-tertiary">REST</span>
            <code className="mt-0.5 block font-mono text-brand">{HIP4_TESTNET_INFO_URL}</code>
          </li>
          <li>
            <span className="block text-text-tertiary">WebSocket</span>
            <code className="mt-0.5 block font-mono text-brand">{HIP4_TESTNET_WS_URL}</code>
          </li>
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Coin IDs</Hip4SectionTitle>
        <Hip4DocLead className="text-xs">
          <Hip4GoldHighlight>Critical</Hip4GoldHighlight> for <code className="font-mono text-[11px]">candleSnapshot</code>{" "}
          and book subscriptions:
        </Hip4DocLead>
        <p className="text-xs leading-relaxed text-text-secondary">{HIP4_COIN_ID_NOTE}</p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>WebSocket channels (summary)</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Channels we used for live HIP-4 book and mark research. Detail and subscribe examples on{" "}
          <Link href="/hip4/info-api#hip4-ws-block" className="text-brand hover:underline">
            Info endpoint
          </Link>
          .
        </Hip4DocLead>
        <TypedDataTable<Hip4WsChannelRow>
          data={HIP4_WS_CHANNELS}
          columns={WS_COLUMNS}
          getRowKey={(r) => r.channel}
          density="compact"
        />
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>L1 action types</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          High-level <code className="font-mono text-[11px]">type</code> strings seen in explorer /
          research. Full JSON payloads:{" "}
          <code className="font-mono text-[11px] text-text-tertiary">HIP4-research-complete.md</code>.
        </Hip4DocLead>
        <TypedDataTable<Hip4L1ActionRow>
          data={HIP4_L1_ACTIONS}
          columns={L1_COLUMNS}
          getRowKey={(r) => r.type}
          density="compact"
        />
        <p className="mt-3 text-xs text-text-tertiary">
          Examples for <Hip4GoldHighlight>registerTokensAndStandaloneOutcome</Hip4GoldHighlight> and{" "}
          <Hip4GoldHighlight>VoteGlobalAction</Hip4GoldHighlight> in the markdown file above.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel id="system-wallets">
        <Hip4SectionTitle>System wallets</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Eight linked Core addresses traced as one cluster; two roles mapped (HIP-4 operator + oracle),
          six unmapped. Testnet only — mainnet distribution unknown. None overlap the HyperEVM
          parimutuel deployer — see{" "}
          <Link href="/hip4/core" className="text-brand hover:underline">
            HyperCore (L1)
          </Link>
          .
        </Hip4DocLead>
        <TypedDataTable<Hip4SystemWalletRow>
          data={HIP4_SYSTEM_WALLETS}
          columns={WALLET_COLUMNS}
          getRowKey={(r) => r.address}
          density="compact"
        />
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>S3</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Datasets and paths referenced in research (fills, EVM blocks). Requester pays where noted.
        </Hip4DocLead>
        <TypedDataTable<Hip4S3DatasetRow>
          data={HIP4_S3_DATASETS}
          columns={S3_COLUMNS}
          getRowKey={(r) => r.path}
          density="compact"
        />
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
