import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
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
        subtitle="Quick map of every surface we touch: REST, WebSocket, L1 actions, infra. For GitBook-style request/response docs, use the dedicated Info endpoint page."
      />

      <Hip4GlassPanel className="border-brand-gold/25 bg-brand-gold/[0.05]">
        <Hip4SectionTitle className="text-brand-gold">Start here</Hip4SectionTitle>
        <p className="text-sm leading-relaxed text-text-secondary">
          <Link
            href="/hip4/info-api"
            className="font-semibold text-brand-gold underline decoration-brand-gold/50 underline-offset-2 hover:decoration-brand-gold"
          >
            Info endpoint (GitBook-style)
          </Link>{" "}
          — <Hip4GoldHighlight>outcomeMeta</Hip4GoldHighlight>,{" "}
          <Hip4GoldHighlight>candleSnapshot</Hip4GoldHighlight>, WS examples, outcome types, and coin
          mapping with the same layout as{" "}
          <Link
            href={HYPERLIQUID_INFO_SPOT_DOC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent underline hover:text-brand-gold"
          >
            Hyperliquid Spot API docs
          </Link>
          .
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Base URLs</Hip4SectionTitle>
        <ul className="space-y-2 text-xs">
          <li>
            <span className="text-text-secondary">REST </span>
            <code className="font-mono text-brand-accent">{HIP4_TESTNET_INFO_URL}</code>
          </li>
          <li>
            <span className="text-text-secondary">WebSocket </span>
            <code className="font-mono text-brand-accent">{HIP4_TESTNET_WS_URL}</code>
          </li>
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Coin IDs</Hip4SectionTitle>
        <p className="text-xs leading-relaxed text-text-secondary">
          <Hip4GoldHighlight>Critical</Hip4GoldHighlight> for candles and book subs:{" "}
          {HIP4_COIN_ID_NOTE}
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>WebSocket channels (summary)</Hip4SectionTitle>
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
          Full JSON for <Hip4GoldHighlight>registerTokensAndStandaloneOutcome</Hip4GoldHighlight> and{" "}
          <Hip4GoldHighlight>VoteGlobalAction</Hip4GoldHighlight> lives in{" "}
          <code className="font-mono text-text-secondary">HIP4-research-complete.md</code>.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>System wallets (testnet)</Hip4SectionTitle>
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
