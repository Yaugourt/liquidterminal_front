"use client";

import type { ReactNode } from "react";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4CompareTable } from "@/components/hip4/Hip4CompareTable";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import v1Abi from "@/lib/hip4/abi/v1.json";
import v2Abi from "@/lib/hip4/abi/v2.json";
import { Badge } from "@/components/ui/badge";

const v1Json = JSON.stringify(v1Abi, null, 2);
const v2Json = JSON.stringify(v2Abi, null, 2);

const COMPARE_ROWS: ReactNode[][] = [
  [
    "Source",
    "Bytecode only",
    <>Shipped <code className="text-xs">HIP4Contest.sol</code></>,
  ],
  [
    "deposit",
    "deposit(uint256,uint256)",
    "deposit(uint256,uint256,uint256) + deadline",
  ],
  ["claim shape", "Historical / reconstructed", "claim(contestId,index,recipient,amount,proof[])"],
  ["Platform fee", "platformFeeBps() view", "Spread + withdrawPlatformFee"],
  ["Events", "DepositReceived", "Deposit, FeesWithdrawn"],
  ["Guards", "Custom", "Pausable, ReentrancyGuard, Ownable2Step"],
];

export function Hip4AbiChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle id="hip4-v1-v2-compare">V1 vs V2 — summary</Hip4SectionTitle>
        <Hip4CompareTable
          headers={["Aspect", "V1", "V2"]}
          rows={COMPARE_ROWS}
        />
        <p className="mt-4 text-[11px] text-text-secondary">
          V2 mystery selector <code className="text-brand-gold">0xb2447e34</code> is{" "}
          <code>withdrawPlatformFee(uint256,uint256)</code> on the shipped source.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Full ABI JSON</Hip4SectionTitle>
        <Tabs defaultValue="v1" className="w-full">
          <TabsList className="mb-3 bg-brand-dark p-1">
            <TabsTrigger
              value="v1"
              className="data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary"
            >
              V1 <Badge variant="outline" className="ml-1 text-[9px]">{(v1Abi as unknown[]).length} items</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="v2"
              className="data-[state=active]:bg-brand-accent data-[state=active]:text-brand-tertiary"
            >
              V2 <Badge variant="outline" className="ml-1 text-[9px]">{(v2Abi as unknown[]).length} items</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="v1" className="mt-0">
            <Hip4CodeBlock title="HIP4Contest.v1.abi (bundled)">{v1Json}</Hip4CodeBlock>
          </TabsContent>
          <TabsContent value="v2" className="mt-0">
            <Hip4CodeBlock title="HIP4Contest.v2.abi (bundled)">{v2Json}</Hip4CodeBlock>
          </TabsContent>
        </Tabs>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
