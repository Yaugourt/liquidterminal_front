"use client";

import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";
import { TypedDataTable, type Column } from "@/components/common";

const INFERRED = `// Inferred from V1 bytecode — not confirmed from source
contract HIP4Contest {
  address public owner;              // slot 0
  // slot 1 — likely gap
  uint256 public initialized;        // slot 2 = 1
  mapping(uint256 => Contest) contests;
  // ...
  uint256 public constant platformFeeBps = 90;
}`;

interface StorageSlot {
  slot: string;
  raw: string;
  decoded: ReactNode;
}

const STORAGE_SLOTS: StorageSlot[] = [
  {
    slot: "0",
    raw: "0x000…e21c78037329d06fe0d6fefc4221aaa67cb0d135",
    decoded: <Badge className="bg-gold/15 text-gold">Owner</Badge>,
  },
  {
    slot: "1",
    raw: "0x0",
    decoded: <span className="text-xs text-text-secondary">Unused</span>,
  },
  {
    slot: "2",
    raw: "…0001",
    decoded: <Badge variant="outline">Initialized = 1</Badge>,
  },
];

const SLOT_COLUMNS: Column<StorageSlot>[] = [
  {
    key: "slot",
    header: "Slot",
    type: "address",
    accessor: (r) => <span className="font-mono text-brand">{r.slot}</span>,
  },
  {
    key: "raw",
    header: "Raw",
    accessor: (r) => (
      <span className="font-mono text-[10px] break-all text-text-secondary">{r.raw}</span>
    ),
  },
  {
    key: "decoded",
    header: "Decoded",
    accessor: (r) => <span className="text-xs">{r.decoded}</span>,
  },
];

export function Hip4StorageChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>V1 — proxy / implementation slots (summary)</Hip4SectionTitle>
        <TypedDataTable<StorageSlot>
          data={STORAGE_SLOTS}
          columns={SLOT_COLUMNS}
          getRowKey={(r) => r.slot}
          density="compact"
        />
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
