import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HIP4_CONFIG } from "@/lib/hip4/config";

function ParamTable({
  rows,
}: {
  rows: { param: string; type: string; indexed: string; pos: string }[];
}) {
  return (
    <div className="overflow-x-auto scrollbar-brand rounded-lg border border-border-subtle">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="text-table-header">Parameter</TableHead>
            <TableHead className="text-table-header">Type</TableHead>
            <TableHead className="text-table-header">Indexed</TableHead>
            <TableHead className="text-table-header">Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.param} className="border-border-subtle">
              <TableCell className="font-mono text-brand-accent">{r.param}</TableCell>
              <TableCell className="font-mono text-xs text-purple-300">{r.type}</TableCell>
              <TableCell className="text-xs">{r.indexed}</TableCell>
              <TableCell className="text-xs text-text-secondary">{r.pos}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function Hip4EventsChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <p className="mb-4 text-xs text-text-secondary leading-relaxed">
          <strong className="text-brand-accent">V1</strong> on{" "}
          <code className="text-[11px]">{HIP4_CONFIG.contracts.v1.address}</code>.{" "}
          <strong className="text-emerald-400">V2</strong> renames{" "}
          <code>DepositReceived</code> → <code>Deposit</code> (new topic0) and adds{" "}
          <code>FeesWithdrawn</code>. <code>Claimed</code> signature types align; layout may differ.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Hip4SectionTitle className="!mb-0">V1 — DepositReceived</Hip4SectionTitle>
          <Badge className="bg-emerald-500/15 text-emerald-300">topic0 on-chain</Badge>
        </div>
        <p className="mb-2 font-mono text-[11px] text-brand-accent">
          DepositReceived(uint256 indexed contestId, uint256 indexed sideId, address depositor, uint256
          amount)
        </p>
        <p className="mb-3 font-mono text-[11px] text-text-secondary break-all">
          topic0: 0xb3e6929bbc654f9c87cd601fc5a62d03406b85acbbb509c57e54ecf298eb8c41
        </p>
        <ParamTable
          rows={[
            { param: "contestId", type: "uint256", indexed: "yes — topic[1]", pos: "topic[1]" },
            { param: "sideId", type: "uint256", indexed: "yes — topic[2]", pos: "topic[2]" },
            { param: "depositor", type: "address", indexed: "no", pos: "data[0:32]" },
            { param: "amount", type: "uint256", indexed: "no", pos: "data[32:64]" },
          ]}
        />
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Hip4SectionTitle className="!mb-0">V2 — Deposit</Hip4SectionTitle>
          <Badge variant="outline">new topic0</Badge>
        </div>
        <p className="mb-3 text-xs text-text-secondary">
          Includes <code>deadline</code> in signature; see shipped ABI JSON for exact topic0.
        </p>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
