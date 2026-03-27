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
} from "@/lib/hip4/core-reference-data";
import { HYPERLIQUID_INFO_SPOT_DOC_URL } from "@/lib/hip4/api-info-spec";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function Hip4ReferenceChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="API & data — overview"
        subtitle={
          <>
            <p>
              This page is a <strong className="text-white">compact map</strong>: endpoints, channels,
              L1 action names, infra. It does not duplicate full request/response payloads.
            </p>
            <p>
              For GitBook-style tables and JSON tabs, use{" "}
              <Link href="/hip4/info-api" className="font-medium text-brand-gold underline-offset-2 hover:underline">
                Info endpoint
              </Link>
              .
            </p>
          </>
        }
      />

      <Hip4GlassPanel className="border-brand-gold/25 bg-brand-gold/[0.05]">
        <Hip4SectionTitle className="text-brand-gold">Start here</Hip4SectionTitle>
        <Hip4DocList className="text-sm text-text-secondary marker:text-brand-gold">
          <li>
            <Link
              href="/hip4/info-api"
              className="font-semibold text-brand-gold underline decoration-brand-gold/50 underline-offset-2 hover:decoration-brand-gold"
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
              className="font-semibold text-brand-gold underline decoration-brand-gold/50 underline-offset-2 hover:decoration-brand-gold"
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
              className="text-brand-accent underline hover:text-brand-gold"
            >
              Hyperliquid Spot — Info endpoint
            </Link>
            .
          </li>
        </Hip4DocList>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Base URLs</Hip4SectionTitle>
        <Hip4SubsectionTitle>Testnet (this doc)</Hip4SubsectionTitle>
        <ul className="space-y-3 text-xs">
          <li>
            <span className="block text-text-muted">REST</span>
            <code className="mt-0.5 block font-mono text-brand-accent">{HIP4_TESTNET_INFO_URL}</code>
          </li>
          <li>
            <span className="block text-text-muted">WebSocket</span>
            <code className="mt-0.5 block font-mono text-brand-accent">{HIP4_TESTNET_WS_URL}</code>
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
          <Link href="/hip4/info-api#hip4-ws-block" className="text-brand-accent hover:underline">
            Info endpoint
          </Link>
          .
        </Hip4DocLead>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Channel</TableHead>
                <TableHead className="text-table-header">Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HIP4_WS_CHANNELS.map((row) => (
                <TableRow key={row.channel} className="border-border-subtle">
                  <TableCell className="font-mono text-table-cell text-brand-gold">
                    {row.channel}
                  </TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>L1 action types</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          High-level <code className="font-mono text-[11px]">type</code> strings seen in explorer /
          research. Full JSON payloads:{" "}
          <code className="font-mono text-[11px] text-text-muted">HIP4-research-complete.md</code>.
        </Hip4DocLead>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">type</TableHead>
                <TableHead className="text-table-header">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HIP4_L1_ACTIONS.map((row) => (
                <TableRow key={row.type} className="border-border-subtle">
                  <TableCell className="font-mono text-sm text-table-cell text-brand-gold">
                    {row.type}
                  </TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Examples for <Hip4GoldHighlight>registerTokensAndStandaloneOutcome</Hip4GoldHighlight> and{" "}
          <Hip4GoldHighlight>VoteGlobalAction</Hip4GoldHighlight> in the markdown file above.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>System wallets (testnet)</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Addresses observed for oracle / settlement / validation on testnet — not a guarantee for
          mainnet.
        </Hip4DocLead>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Address</TableHead>
                <TableHead className="text-table-header">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HIP4_SYSTEM_WALLETS.map((row) => (
                <TableRow key={row.address} className="border-border-subtle">
                  <TableCell className="font-mono text-[11px] text-table-cell">{row.address}</TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>S3</Hip4SectionTitle>
        <Hip4DocLead className="mb-3 text-xs">
          Datasets and paths referenced in research (fills, EVM blocks). Requester pays where noted.
        </Hip4DocLead>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Path / dataset</TableHead>
                <TableHead className="text-table-header">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HIP4_S3_DATASETS.map((row) => (
                <TableRow key={row.path} className="border-border-subtle">
                  <TableCell className="font-mono text-[11px] text-table-cell">{row.path}</TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
