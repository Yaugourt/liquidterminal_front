import Link from "next/link";
import {
  Hip4ChapterShell,
  Hip4DocLead,
  Hip4DocList,
  Hip4GlassPanel,
  Hip4SectionTitle,
  Hip4SubsectionTitle,
} from "@/components/hip4/Hip4ChapterShell";
import { Hip4ChapterHubHeader } from "@/components/hip4/Hip4PageHeader";
import { Hip4GoldHighlight } from "@/components/hip4/Hip4GoldHighlight";
import { Hip4ApiRestEndpointDoc, Hip4ApiWsEndpointDoc } from "@/components/hip4/Hip4ApiDocBlocks";
import { Hip4CompareTable } from "@/components/hip4/Hip4CompareTable";
import { Hip4InfoApiToc } from "@/components/hip4/Hip4InfoApiToc";
import { Hip4BackToTop } from "@/components/hip4/Hip4BackToTop";
import {
  HIP4_OUTCOME_TYPE_ROWS,
  HIP4_REST_INFO_ENDPOINTS,
  HIP4_WS_EXAMPLES,
  HYPERLIQUID_INFO_SPOT_DOC_URL,
} from "@/lib/hip4/api-info-spec";
import { HIP4_TESTNET_INFO_URL } from "@/lib/hip4/core-reference-data";

export function Hip4InfoApiChapter() {
  return (
    <Hip4ChapterShell id="hip4-doc-top">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11.5rem] xl:items-start xl:gap-10">
        <div className="min-w-0 space-y-6">
          <Hip4ChapterHubHeader
            title="Info endpoint — HIP-4"
            subtitle={
              <>
                <p>
                  Same <strong className="text-text-primary">layout pattern</strong> as the official
                  Hyperliquid GitBook: method badge, headers table, body fields, response tabs.
                </p>
                <p>
                  <strong className="text-text-primary">Content</strong> is Liquid Terminal research on
                  prediction markets and <Hip4GoldHighlight>#</Hip4GoldHighlight> coins — not an
                  official Hyperliquid page.
                </p>
              </>
            }
          />

          <Hip4InfoApiToc variant="inline" />

          <Hip4GlassPanel id="hip4-info-intro" className="border-gold/20 bg-gold/[0.04]">
            <Hip4SubsectionTitle>Official reference</Hip4SubsectionTitle>
            <Hip4DocList className="mb-0 text-xs">
              <li>
                Layout model:{" "}
                <Link
                  href={HYPERLIQUID_INFO_SPOT_DOC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline hover:text-gold"
                >
                  Info endpoint → Spot
                </Link>{" "}
                on GitBook.
              </li>
              <li>
                Our fields documented here:{" "}
                <code className="font-mono text-[11px] text-brand">outcomeMeta</code>,{" "}
                <code className="font-mono text-[11px] text-brand">candleSnapshot</code>,
                plus WS subscribe/push examples.
              </li>
              <li>
                Base URL for this chapter:{" "}
                <Hip4GoldHighlight>
                  <code className="font-mono text-[11px]">{HIP4_TESTNET_INFO_URL}</code>
                </Hip4GoldHighlight>
              </li>
            </Hip4DocList>
          </Hip4GlassPanel>

          <div id="hip4-rest-block" className="space-y-4">
            <Hip4SectionTitle>REST — POST /info</Hip4SectionTitle>
            <Hip4DocLead className="text-xs">
              Each card below is one <code className="font-mono text-[11px]">type</code> in the JSON
              body (GitBook-style: headers, body table, collapsible example, response tabs). Use the
              right-hand <strong className="text-text-primary">On this page</strong> menu (desktop) or the
              inline chips above to jump.
            </Hip4DocLead>
            <div className="space-y-6">
              {HIP4_REST_INFO_ENDPOINTS.map((spec) => (
                <div
                  key={spec.id}
                  className="rounded-lg border border-border-subtle bg-surface/30 p-5 sm:p-6"
                >
                  <Hip4ApiRestEndpointDoc spec={spec} />
                </div>
              ))}
            </div>
          </div>

          <Hip4GlassPanel id="outcome-types">
            <Hip4SectionTitle>Outcome types</Hip4SectionTitle>
            <Hip4DocLead className="mb-3 text-xs">
              How <code className="font-mono text-[11px]">outcomeMeta</code> rows map to market
              shapes we observed on testnet.
            </Hip4DocLead>
            <Hip4CompareTable
              headers={["Type", "Example", "Description"]}
              rows={HIP4_OUTCOME_TYPE_ROWS.map((cells, ri) =>
                cells.map((c, ci) => <span key={`${ri}-${ci}`}>{c}</span>)
              )}
            />
            <p className="mt-4 text-xs text-text-secondary">
              Multi-outcome <Hip4GoldHighlight>questions</Hip4GoldHighlight> group several outcomes;
              each outcome still trades as its own YES/NO pair on the CLOB.
            </p>
          </Hip4GlassPanel>

          <Hip4GlassPanel id="coin-mapping" className="border-gold/15">
            <Hip4SectionTitle>Coin ID mapping</Hip4SectionTitle>
            <Hip4DocLead className="text-xs">
              Outcome tokens use <Hip4GoldHighlight>#-prefixed</Hip4GoldHighlight> names on the book.
            </Hip4DocLead>
            <ul className="mt-3 list-disc space-y-2 pl-5 font-mono text-[11px] text-text-secondary marker:text-gold/70">
              <li>
                Outcome <Hip4GoldHighlight>2243</Hip4GoldHighlight> → YES{" "}
                <Hip4GoldHighlight>#22430</Hip4GoldHighlight>, NO{" "}
                <Hip4GoldHighlight>#22431</Hip4GoldHighlight>
              </li>
              <li>
                Formula: YES ={" "}
                <code className="text-brand">&quot;#&quot; + (outcomeId × 10)</code>, NO ={" "}
                <code className="text-brand">&quot;#&quot; + (outcomeId × 10 + 1)</code>
              </li>
            </ul>
            <p className="mt-4 border-t border-border-subtle pt-3 text-xs font-medium text-gold">
              Always pass the full # coin string to candleSnapshot — not the bare outcome id.
            </p>
          </Hip4GlassPanel>

          <div id="hip4-ws-block" className="space-y-4">
            <Hip4SectionTitle>WebSocket</Hip4SectionTitle>
            <Hip4DocLead className="text-xs">
              Example subscribe frames and push payloads from our HIP-4 research.{" "}
              <Hip4GoldHighlight>markPx</Hip4GoldHighlight> on YES legs reads like implied
              probability.
            </Hip4DocLead>
            <div className="space-y-6">
              {HIP4_WS_EXAMPLES.map((spec) => (
                <div
                  key={spec.id}
                  className="rounded-lg border border-border-subtle bg-surface/30 p-5 sm:p-6"
                >
                  <Hip4ApiWsEndpointDoc spec={spec} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Hip4InfoApiToc variant="sidebar" />
      </div>

      <Hip4BackToTop />
    </Hip4ChapterShell>
  );
}
