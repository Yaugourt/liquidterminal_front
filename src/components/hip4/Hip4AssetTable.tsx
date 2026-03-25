import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HIP4_ASSETS, sideBadgeClass } from "@/lib/hip4/markets-static-data";
import { cn } from "@/lib/utils";

export function Hip4AssetTable() {
  return (
    <div className="rounded-xl border border-border-subtle bg-brand-secondary/30 overflow-x-auto scrollbar-thin">
      <Table>
        <TableHeader>
          <TableRow className="border-border-subtle hover:bg-transparent">
            <TableHead className="text-table-header">Coin</TableHead>
            <TableHead className="text-table-header">Outcome</TableHead>
            <TableHead className="text-table-header">Side</TableHead>
            <TableHead className="text-table-header">Asset index</TableHead>
            <TableHead className="text-table-header">Mid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {HIP4_ASSETS.map((a) => {
            const idx = 100_000_000 + parseInt(a.coin.slice(1), 10);
            const color = a.mid >= 0.5 ? "text-emerald-400" : "text-red-400";
            return (
              <TableRow key={`${a.coin}-${a.side}`} className="border-border-subtle">
                <TableCell className="font-mono font-bold text-brand-accent">
                  {a.coin}
                </TableCell>
                <TableCell className="text-xs">
                  #{a.outcome} {a.outcomeName}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                      sideBadgeClass(a.sideName)
                    )}
                  >
                    {a.sideName}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-[11px] text-brand-gold">
                  {idx}
                </TableCell>
                <TableCell className={cn("font-bold", color)}>
                  {(a.mid * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
