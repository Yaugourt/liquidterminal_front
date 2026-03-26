import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import {
  HIP4_COIN_ID_NOTE,
  HIP4_INFO_ENDPOINTS,
  HIP4_L1_ACTIONS,
  HIP4_S3_DATASETS,
  HIP4_SYSTEM_WALLETS,
  HIP4_TESTNET_INFO_URL,
  HIP4_TESTNET_WS_URL,
  HIP4_WS_CHANNELS,
} from "@/lib/hip4/core-reference-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OUTCOME_META_BODY = `{"type": "outcomeMeta"}`;

const CANDLE_EXAMPLE = `{
  "type": "candleSnapshot",
  "req": {
    "coin": "#22430",
    "endTime": 1774569600000,
    "interval": "1d",
    "startTime": 1746057600000
  }
}`;

export function Hip4ReferenceChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="API & data"
        subtitle="Testnet REST, WebSocket channels, L1 action shapes, system wallets, and S3 datasets — condensed from the research doc."
      />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Base URLs</Hip4SectionTitle>
        <ul className="space-y-2 font-mono text-xs text-brand-accent">
          <li>
            <span className="text-text-secondary">REST: </span>
            {HIP4_TESTNET_INFO_URL}
          </li>
          <li>
            <span className="text-text-secondary">WS: </span>
            {HIP4_TESTNET_WS_URL}
          </li>
        </ul>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Coin IDs</Hip4SectionTitle>
        <p className="mb-3 text-xs text-text-secondary">{HIP4_COIN_ID_NOTE}</p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>POST /info — common types</Hip4SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Name</TableHead>
                <TableHead className="text-table-header">Shape</TableHead>
                <TableHead className="text-table-header">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HIP4_INFO_ENDPOINTS.map((row) => (
                <TableRow key={row.name} className="border-border-subtle">
                  <TableCell className="font-mono text-table-cell">{row.name}</TableCell>
                  <TableCell className="text-table-cell">{row.type}</TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-[10px] text-text-muted uppercase tracking-wider">
          Example bodies
        </p>
        <Hip4CodeBlock title="outcomeMeta">{OUTCOME_META_BODY}</Hip4CodeBlock>
        <Hip4CodeBlock title="candleSnapshot" className="mt-2">
          {CANDLE_EXAMPLE}
        </Hip4CodeBlock>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>WebSocket channels</Hip4SectionTitle>
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
                  <TableCell className="font-mono text-table-cell">{row.channel}</TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.purpose}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>L1 action types (summary)</Hip4SectionTitle>
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
                  <TableCell className="font-mono text-sm text-table-cell">{row.type}</TableCell>
                  <TableCell className="text-table-cell text-text-secondary">{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Full JSON examples for registerTokensAndStandaloneOutcome and VoteGlobalAction are in{" "}
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
