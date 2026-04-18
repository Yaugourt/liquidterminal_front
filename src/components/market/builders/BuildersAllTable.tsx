"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { BuilderListRow } from "@/services/indexer/builders/types";
import { Loader2 } from "lucide-react";

interface BuildersAllTableProps {
  builders: BuilderListRow[];
  isLoading: boolean;
  error: Error | null;
}

export function BuildersAllTable({ builders, isLoading, error }: BuildersAllTableProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return builders;
    return builders.filter(
      (b) =>
        b.name.toLowerCase().includes(s) ||
        b.address.toLowerCase().includes(s) ||
        (b.referredBy && b.referredBy.toLowerCase().includes(s))
    );
  }, [builders, q]);

  if (error) {
    return (
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm">{error.message}</div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        className="glass-input max-w-md"
        placeholder="Search by name or address…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter builders"
      />
      <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
        {isLoading && builders.length === 0 ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border-subtle hover:bg-transparent">
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Name
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Address
                  </span>
                </TableHead>
                <TableHead className="py-3 px-3">
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                    Referrer stage
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow
                  key={b.address}
                  className="border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => router.push(`/market/builders/${encodeURIComponent(b.address)}`)}
                >
                  <TableCell className="py-3 px-3 text-sm text-white font-medium">{b.name}</TableCell>
                  <TableCell className="py-3 px-3 text-xs text-text-secondary font-mono">{b.address}</TableCell>
                  <TableCell className="py-3 px-3 text-sm text-text-secondary">{b.referrerStage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <p className="text-text-muted text-xs px-1">
        Showing {filtered.length} of {builders.length} builders
      </p>
    </div>
  );
}
