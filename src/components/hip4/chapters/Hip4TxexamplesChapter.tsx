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

const EXAMPLES = [
  {
    name: "createContest",
    selector: "0x6dab6b23",
    calldata:
      "0x6dab6b23" +
      "000000000000000000000000000000000000000000000000000000000000025b" +
      "00000000000000000000000000000000000000000000000000470de4df820000",
    note: "contestId=603, entryFee=50e18 wei",
  },
  {
    name: "deposit",
    selector: "0x00aeef8a",
    calldata: "(varies) contestId, sideId — value = entry fee",
    note: "Payable deposit to open side",
  },
];

export function Hip4TxexamplesChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Decoded examples (illustrative)</Hip4SectionTitle>
        <p className="mb-4 text-xs text-text-secondary">
          Shapes observed on testnet; verify against your own traces.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Function</TableHead>
                <TableHead className="text-table-header">Selector</TableHead>
                <TableHead className="text-table-header">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXAMPLES.map((ex) => (
                <TableRow key={ex.name} className="border-border-subtle">
                  <TableCell className="font-mono text-brand-accent">{ex.name}</TableCell>
                  <TableCell className="font-mono text-[11px] break-all">{ex.selector}</TableCell>
                  <TableCell className="text-xs text-text-secondary">{ex.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
