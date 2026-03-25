import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4AssetTable } from "@/components/hip4/Hip4AssetTable";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";
import { HIP4_CONFIG } from "@/lib/hip4/config";

const ARCH = `╔══════════════════════════════════════════════════════════════════╗
║         HYPERCORE L1  (native order book)                          ║
╠══════════════════════════════════════════════════════════════════╣
║  asset_idx = 100_000_000 + int(str(outcomeId) + str(sideId))     ║
║  Trade outcome tokens — no EVM required                          ║
╚══════════════════════════════════════════════════════════════════╝
                          ↕  bridge  ↕
╔══════════════════════════════════════════════════════════════════╗
║         HYPEREVM  (chain ${HIP4_CONFIG.chainId})                  ║
╠══════════════════════════════════════════════════════════════════╣
║  HIP-4 V1 ${HIP4_CONFIG.contracts.v1.address.slice(0, 10)}…       ║
║  Bridge 0x2222…2222 — native HYPE in/out                         ║
╚══════════════════════════════════════════════════════════════════╝`;

export function Hip4BridgeChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>HyperCore ↔ HyperEVM</Hip4SectionTitle>
        <Hip4CodeBlock>{ARCH}</Hip4CodeBlock>
      </Hip4GlassPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Hip4GlassPanel>
          <Hip4SectionTitle>Bridge 0x2222…2222</Hip4SectionTitle>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li>
              <span className="text-text-secondary">Address:</span>{" "}
              <code className="text-brand-accent">0x2222222222222222222222222222222222222222</code>
            </li>
            <li>Receives HYPE, emits bridge event; calldata reverts.</li>
          </ul>
          <Hip4CodeBlock title="Decompiled sketch" className="mt-4">
            {`receive() external payable {
  emit BridgeDeposit(msg.sender, msg.value);
}
fallback() external { revert(); }`}
          </Hip4CodeBlock>
        </Hip4GlassPanel>

        <Hip4GlassPanel>
          <Hip4SectionTitle>Asset index mapping</Hip4SectionTitle>
          <p className="mb-3 text-xs text-text-secondary">
            Formula:{" "}
            <code className="text-brand-accent">
              asset_idx = 100_000_000 + int(str(outcomeId) + str(sideId))
            </code>
          </p>
          <Hip4AssetTable />
        </Hip4GlassPanel>
      </div>
    </Hip4ChapterShell>
  );
}
