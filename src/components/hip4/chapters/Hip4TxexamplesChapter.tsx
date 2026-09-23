"use client";

import {
  Hip4ChapterShell,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { TypedDataTable, type Column } from "@/components/common";

interface TxExample {
  name: string;
  selector: string;
  calldata: string;
  note: string;
}

const EXAMPLES: TxExample[] = [
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

const COLUMNS: Column<TxExample>[] = [
  { key: "name", header: "Function", type: "code", accessor: "name" },
  { key: "selector", header: "Selector", type: "code", className: "break-all", accessor: "selector" },
  { key: "note", header: "Note", accessor: "note" },
];

export function Hip4TxexamplesChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <section className="space-y-3">
        <div>
          <Hip4SectionTitle className="!mb-1">Decoded examples (illustrative)</Hip4SectionTitle>
          <p className="text-xs text-text-secondary">
            Shapes observed on testnet; verify against your own traces.
          </p>
        </div>
        <TypedDataTable<TxExample>
          data={EXAMPLES}
          columns={COLUMNS}
          getRowKey={(ex) => ex.name}
          density="compact"
        />
      </section>
    </Hip4ChapterShell>
  );
}
