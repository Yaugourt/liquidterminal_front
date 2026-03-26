import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4GlassPanel,
  Hip4SectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4GoldHighlight } from "@/components/hip4/Hip4GoldHighlight";
import { Hip4ApiRestEndpointDoc, Hip4ApiWsEndpointDoc } from "@/components/hip4/Hip4ApiDocBlocks";
import { Hip4CompareTable } from "@/components/hip4/Hip4CompareTable";
import {
  HIP4_OUTCOME_TYPE_ROWS,
  HIP4_REST_INFO_ENDPOINTS,
  HIP4_WS_EXAMPLES,
  HYPERLIQUID_INFO_SPOT_DOC_URL,
} from "@/lib/hip4/api-info-spec";
import { HIP4_TESTNET_INFO_URL } from "@/lib/hip4/core-reference-data";

export function Hip4InfoApiChapter() {
  return (
    <Hip4ChapterShell>
      <Hip4ChapterHubHeader
        title="Info endpoint — HIP-4 (testnet)"
        subtitle="Layout mirrors Hyperliquid GitBook (method, headers, body table, response tabs). Content is our research on prediction / # coins — not an official Hyperliquid page."
      />

      <Hip4GlassPanel className="border-brand-gold/20 bg-brand-gold/[0.04]">
        <p className="text-xs leading-relaxed text-text-secondary">
          <span className="font-semibold text-brand-gold">Layout reference: </span>
          official{" "}
          <Link
            href={HYPERLIQUID_INFO_SPOT_DOC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent underline hover:text-brand-gold"
          >
            Info endpoint → Spot
          </Link>{" "}
          on GitBook. We reuse the same documentation pattern for{" "}
          <Hip4GoldHighlight>HIP-4 fields we rely on</Hip4GoldHighlight> (
          <code className="font-mono text-[11px] text-brand-accent">outcomeMeta</code>,{" "}
          <code className="font-mono text-[11px] text-brand-accent">candleSnapshot</code>, WS feeds).
        </p>
        <p className="mt-3 text-xs text-text-secondary">
          Base URL for this chapter:{" "}
          <Hip4GoldHighlight>
            <code className="font-mono text-[11px]">{HIP4_TESTNET_INFO_URL}</code>
          </Hip4GoldHighlight>
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>REST — POST /info</Hip4SectionTitle>
        <div className="space-y-12">
          {HIP4_REST_INFO_ENDPOINTS.map((spec) => (
            <Hip4ApiRestEndpointDoc key={spec.id} spec={spec} />
          ))}
        </div>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>Outcome types</Hip4SectionTitle>
        <Hip4CompareTable
          headers={["Type", "Example", "Description"]}
          rows={HIP4_OUTCOME_TYPE_ROWS.map((cells, ri) =>
            cells.map((c, ci) => <span key={`${ri}-${ci}`}>{c}</span>)
          )}
        />
        <p className="mt-4 text-xs text-text-secondary">
          Multi-outcome <Hip4GoldHighlight>questions</Hip4GoldHighlight> group several outcomes; each
          outcome still trades as its own YES/NO pair on the CLOB.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel className="border-brand-gold/15">
        <Hip4SectionTitle>Coin ID mapping</Hip4SectionTitle>
        <p className="text-xs leading-relaxed text-text-secondary">
          Outcome tokens use <Hip4GoldHighlight>#-prefixed</Hip4GoldHighlight> names on the book:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-mono text-[11px] text-text-secondary">
          <li>
            Outcome <Hip4GoldHighlight>2243</Hip4GoldHighlight> → YES{" "}
            <Hip4GoldHighlight>#22430</Hip4GoldHighlight>, NO{" "}
            <Hip4GoldHighlight>#22431</Hip4GoldHighlight>
          </li>
          <li>
            Formula: YES = <code className="text-brand-accent">&quot;#&quot; + (outcomeId × 10)</code>
            , NO = <code className="text-brand-accent">&quot;#&quot; + (outcomeId × 10 + 1)</code>
          </li>
        </ul>
        <p className="mt-3 text-xs font-medium text-brand-gold">
          Always pass the full # coin string to candleSnapshot — not the bare outcome id.
        </p>
      </Hip4GlassPanel>

      <Hip4GlassPanel>
        <Hip4SectionTitle>WebSocket</Hip4SectionTitle>
        <p className="mb-6 text-xs text-text-secondary">
          Streams below are what we used for live HIP-4 book and mark research.{" "}
          <Hip4GoldHighlight>markPx</Hip4GoldHighlight> on YES legs behaves like implied probability.
        </p>
        <div className="space-y-12">
          {HIP4_WS_EXAMPLES.map((spec) => (
            <Hip4ApiWsEndpointDoc key={spec.id} spec={spec} />
          ))}
        </div>
      </Hip4GlassPanel>
    </Hip4ChapterShell>
  );
}
