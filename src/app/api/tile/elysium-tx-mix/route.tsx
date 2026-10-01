import { compactCount } from "@/lib/formatters/numberFormatting";
import { TileFrame } from "@/lib/og/TileFrame";
import { tileColors, tileSeries } from "@/lib/og/tileTheme";
import { ELYSIUM_FOOTNOTE, ElysiumBadge, elysiumTileResponse, loadElysium, pctText } from "@/lib/og/elysium";

/**
 * What Elysium transactions do: contract calls, plain HYPE transfers and
 * contract creations (spam excluded), last 24h against the 7-day mix.
 *
 * `GET /api/tile/elysium-tx-mix` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 600;

interface Methods {
  totals: { calls: number; plainTransfers: number; contractCreations: number };
}

const C = tileColors;
const KINDS = [
  { key: "calls", label: "Contract calls", color: tileSeries.cyan },
  { key: "plainTransfers", label: "Plain HYPE transfers", color: tileSeries.gold },
  { key: "contractCreations", label: "Contract creations", color: tileSeries.violet },
] as const;

function MixBar({ label, totals }: { label: string; totals: Methods["totals"] }) {
  const sum = totals.calls + totals.plainTransfers + totals.contractCreations;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: 22 }}>
      <div style={{ display: "flex", fontSize: 15, color: C.textSecondary }}>
        {label}
        <div style={{ display: "flex", marginLeft: "auto", fontFamily: "JetBrains Mono", color: C.textTertiary }}>{compactCount(sum, { fallback: "-" })} txs</div>
      </div>
      <div style={{ display: "flex", width: "100%", height: 34, marginTop: 8, borderRadius: 6, overflow: "hidden" }}>
        {KINDS.map((k) => {
          const share = sum ? totals[k.key] / sum : 0;
          return (
            <div key={k.key} style={{ display: "flex", width: `${share * 100}%`, height: "100%", background: k.color, alignItems: "center", paddingLeft: share > 0.08 ? 10 : 0 }}>
              {share > 0.08 ? <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 600, color: C.base }}>{pctText(share)}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function GET() {
  const [day, week] = await Promise.all([
    loadElysium<Methods>("/elysium/analytics/methods?window=24h", revalidate),
    loadElysium<Methods>("/elysium/analytics/methods?window=7d", revalidate),
  ]);
  if (!day || !week) return new Response("elysium methods unavailable", { status: 503 });
  const t = day.totals;
  const sum = t.calls + t.plainTransfers + t.contractCreations;
  if (!sum) return new Response("elysium methods empty", { status: 503 });

  return elysiumTileResponse(
    <TileFrame
      title="Transaction mix"
      pill="24h vs 7d"
      badge={<ElysiumBadge />}
      eyebrow="Elysium testnet · what transactions do, spam excluded"
      hero={pctText(t.contractCreations / sum)}
      heroSub={`of transactions in 24h deploy a contract · ${compactCount(t.contractCreations, { fallback: "-" })} creations`}
      footLeft="Contract call = tx to an address with calldata; plain transfer = no calldata; creation = no recipient"
      footNote={ELYSIUM_FOOTNOTE()}
    >
      <MixBar label="Last 24h" totals={day.totals} />
      <MixBar label="Last 7 days" totals={week.totals} />
      <div style={{ display: "flex", marginTop: 18, fontSize: 15, color: C.textSecondary }}>
        {KINDS.map((k) => (
          <div key={k.key} style={{ display: "flex", alignItems: "center", marginRight: 28 }}>
            <div style={{ display: "flex", width: 12, height: 12, borderRadius: 3, background: k.color, marginRight: 8 }} />
            {k.label}
          </div>
        ))}
      </div>
    </TileFrame>,
    revalidate
  );
}
