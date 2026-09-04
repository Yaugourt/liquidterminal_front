import { ImageResponse } from "next/og";
import { env } from "@/lib/env";
import { compactCount } from "@/lib/formatters/numberFormatting";
import { tileColors } from "@/lib/og/tileTheme";
import { TileFrame } from "@/lib/og/TileFrame";
import { loadTileFonts } from "@/lib/og/fonts";
import { loadHypurr } from "@/lib/og/hypurr";

/**
 * Staking decentralization as a standalone image: the Nakamoto coefficient
 * (validators needed to halt the chain), total stake, active set and how much
 * the foundation still holds.
 *
 * `GET /api/tile/validators` → PNG 1200x630.
 */
export const runtime = "nodejs";
export const revalidate = 900;

const C = tileColors;

interface Validator {
  name: string;
  stake: number;
  isActive: boolean;
}

async function load(): Promise<Validator[]> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/staking/validators`, { next: { revalidate } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Validator[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function GET() {
  const validators = (await load()).filter((v) => v.isActive && v.stake > 0);
  if (validators.length === 0) {
    return new Response("validators unavailable", { status: 503 });
  }

  const stakes = validators.map((v) => v.stake).sort((a, b) => b - a);
  const total = stakes.reduce((a, b) => a + b, 0);

  // Nakamoto: how many top validators together hold more than 1/3 of the stake
  // (the threshold to halt consensus).
  const third = total / 3;
  let acc = 0;
  let nakamoto = 0;
  for (const s of stakes) {
    acc += s;
    nakamoto += 1;
    if (acc > third) break;
  }

  const topShare = (stakes[0] / total) * 100;
  const foundationStake = validators
    .filter((v) => /foundation/i.test(v.name))
    .reduce((a, v) => a + v.stake, 0);
  const foundationShare = (foundationStake / total) * 100;

  const cells = [
    { label: "Total staked", value: `${compactCount(total)} HYPE` },
    { label: "Active validators", value: String(validators.length) },
    { label: "Foundation share", value: `${foundationShare.toFixed(0)}%` },
    { label: "Largest validator", value: `${topShare.toFixed(1)}%` },
  ];

  const [fonts, mascot] = await Promise.all([loadTileFonts(), loadHypurr("purrfessor")]);

  return new ImageResponse(
    (
      <TileFrame
        title="Validators"
        pill="staking"
        eyebrow="Staking decentralization"
        hero={String(nakamoto)}
        heroSub={`Nakamoto coefficient · ${validators.length} active validators`}
        footLeft="Validators needed to control 1/3 of stake (halt threshold)"
        footNote="Source: Hyperliquid staking"
        mascot={mascot}
      >
        <div style={{ display: "flex", width: "100%", marginTop: 34 }}>
          {cells.map((c) => (
            <div
              key={c.label}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: 28 }}
            >
              <div style={{ display: "flex", fontSize: 16, color: C.textSecondary }}>{c.label}</div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 30,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </TileFrame>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=900, s-maxage=1800, stale-while-revalidate=3600",
      },
    }
  );
}
