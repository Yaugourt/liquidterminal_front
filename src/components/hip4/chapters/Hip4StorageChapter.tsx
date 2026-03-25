import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
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

const INFERRED = `// Inferred from V1 bytecode — not confirmed from source
contract HIP4Contest {
  address public owner;              // slot 0
  // slot 1 — likely gap
  uint256 public initialized;        // slot 2 = 1
  mapping(uint256 => Contest) contests;
  // ...
  uint256 public constant platformFeeBps = 90;
}`;

export function Hip4StorageChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>V1 — proxy / implementation slots (summary)</Hip4SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="text-table-header">Slot</TableHead>
                <TableHead className="text-table-header">Raw</TableHead>
                <TableHead className="text-table-header">Decoded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border-subtle">
                <TableCell className="font-mono text-brand-accent">0</TableCell>
                <TableCell className="font-mono text-[10px] break-all">
                  0x000…e21c78037329d06fe0d6fefc4221aaa67cb0d135
                </TableCell>
                <TableCell className="text-xs">
                  <Badge className="bg-brand-gold/15 text-brand-gold">Owner</Badge>
                </TableCell>
              </TableRow>
              <TableRow className="border-border-subtle">
                <TableCell className="font-mono text-brand-accent">1</TableCell>
                <TableCell className="text-xs text-text-secondary">0x0</TableCell>
                <TableCell className="text-xs text-text-secondary">Unused</TableCell>
              </TableRow>
              <TableRow className="border-border-subtle">
                <TableCell className="font-mono text-brand-accent">2</TableCell>
                <TableCell className="font-mono text-[10px]">…0001</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline">Initialized = 1</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          Mappings use keccak256(key, slotBase). See full legacy HTML for extended notes.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Inferred layout</Hip4SectionTitle>
        <Hip4CodeBlock>{INFERRED}</Hip4CodeBlock>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
