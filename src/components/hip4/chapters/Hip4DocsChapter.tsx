import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4CodeBlock } from "@/components/hip4/Hip4CodeBlock";
import { Hip4PageHeader } from "@/components/hip4/Hip4PageHeader";

const FETCH_RPC = `const res = await fetch("https://rpc.hyperliquid.xyz/evm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to: CONTRACT, data: SELECTOR + encodedArgs }, "latest"],
  }),
});
const json = await res.json();`;

export function Hip4DocsChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4PageHeader />

      <Hip4GlassPanel>
        <Hip4SectionTitle>Static files (public)</Hip4SectionTitle>
        <ul className="list-inside list-disc space-y-2 text-sm text-text-secondary">
          <li>
            <Link className="text-brand-accent underline" href="/hip4/HIP4Contest.sol" target="_blank">
              HIP4Contest.sol
            </Link>
          </li>
          <li>
            <Link className="text-brand-accent underline" href="/hip4/HIP4Contest.v2.abi" target="_blank">
              HIP4Contest.v2.abi
            </Link>
          </li>
          <li>
            <Link className="text-brand-accent underline" href="/hip4/HIP4Contest.v1.abi" target="_blank">
              HIP4Contest.v1.abi
            </Link>
          </li>
          <li>
            <Link className="text-brand-accent underline" href="/hip4/HIP4Contest.bin" target="_blank">
              HIP4Contest.bin
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-xs text-text-secondary">
          This React migration keeps downloadable assets in <code className="text-[11px]">public/hip4/</code>
          . Chapter content now lives in <code className="text-[11px]">src/components/hip4/chapters/</code>
          .
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Minimal eth_call (JS)</Hip4SectionTitle>
        <Hip4CodeBlock title="fetch pattern">{FETCH_RPC}</Hip4CodeBlock>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
