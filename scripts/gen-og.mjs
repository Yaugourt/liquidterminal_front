#!/usr/bin/env node
/**
 * gen-og — regenerates every Open Graph / Twitter card from one template.
 *
 * The cards carry the liquid layer (DESIGN_SYSTEM §13): the mark is the source,
 * lit, with the currents pouring out of it across the canvas. Copy sits in the
 * dark channel the `focus` falloff leaves along the emission axis.
 *
 * The streamline math below is a verbatim port of
 * src/components/common/DataFlow.tsx. When one changes, change the other, or
 * the shared links stop looking like the site they point at.
 *
 * It reuses the Chromium vendored with gstack, like visual-check — no new
 * dependency. Fonts are pulled from Google Fonts at generation time, so this
 * needs network access. Output is committed, so it runs on demand, not on build.
 *
 * Usage:
 *   node scripts/gen-og.mjs            # writes public/og/*.png + the two roots
 *   node scripts/gen-og.mjs --only wiki
 */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);

const GSTACK_PLAYWRIGHT =
  [
    path.join(homedir(), ".claude/skills/gstack/node_modules/playwright"),
    path.join(homedir(), "gstack/node_modules/playwright"),
  ].find((p) => {
    try {
      require.resolve(p);
      return true;
    } catch {
      return false;
    }
  }) ?? path.join(homedir(), ".claude/skills/gstack/node_modules/playwright");

const W = 1200;
const H = 630;
const ROOT = path.resolve(import.meta.dirname, "..");

/* ── V4 tokens (mirror of src/app/globals.css :root) ────────────────────── */
const T = {
  base: "#08101A",
  surface: "#0F1421",
  borderSubtle: "#1E2535",
  textPrimary: "#E8EAED",
  textSecondary: "#9CA3AF",
  textTertiary: "#6B7280",
  brand: "#83E9FF",
  gold: "#F9E370",
};

/* ── The cards ───────────────────────────────────────────────────────────
   Copy is carried over verbatim from the cards these replace: the images
   changed, the promises they make did not. */
const CARDS = [
  {
    slug: "og-image",
    out: ["public/og-image.png", "public/twitter-image.png"],
    tag: "Terminal",
    title: [
      { text: "The Terminal to house all" },
      { text: "Hyper", tone: "brand" },
      { text: "Liquid", tone: "gold" },
    ],
    // Where a line break belongs, since the title is a token list.
    breakAfter: 0,
    subtitle: "Market data, liquidations, vaults, auctions. Everything you need in one place.",
  },
  {
    slug: "market",
    out: ["public/og/market.png"],
    tag: "Market",
    title: [{ text: "Market", tone: "brand" }, { text: " overview" }],
    subtitle: "Spot, perps and auctions on Hyperliquid. Real-time prices, volumes and funding.",
  },
  {
    slug: "explorer",
    out: ["public/og/explorer.png"],
    tag: "Explorer",
    title: [{ text: "Explorer", tone: "brand" }, { text: " & liquidations" }],
    subtitle: "On-chain verified. Transactions, blocks, vaults, validators and liquidations.",
  },
  {
    slug: "ecosystem",
    out: ["public/og/ecosystem.png"],
    tag: "Ecosystem",
    title: [{ text: "The " }, { text: "Hyperliquid", tone: "brand" }, { text: " ecosystem map" }],
    subtitle: "Projects, public goods and builders across HyperCore and HyperEVM.",
  },
  {
    slug: "wiki",
    out: ["public/og/wiki.png"],
    tag: "Wiki",
    title: [{ text: "The " }, { text: "Hyperliquid", tone: "gold" }, { text: " knowledge base" }],
    subtitle: "Curated articles, docs and threads. Ranked by community saves.",
    accent: "gold",
  },
];

/* ── Flow field (port of DataFlow.tsx) ───────────────────────────────────
   The field is drawn into a tall box whose top-centre sits on the mark, then
   rotated so the currents run down-right across the canvas. Rotating the box
   is what lets the copy lie along the emission axis, where `focus` keeps the
   light off. */
function flowSvg({ lines = 34, spread = 96, intensity = 0.2, focus = 0.3 } = {}) {
  const SEED = 1.2;
  let out = "";
  for (let i = 0; i < lines; i++) {
    const t = lines === 1 ? 0.5 : i / (lines - 1);
    const signed = t - 0.5;
    const phase = i * 0.79;
    const pts = [];
    for (let y = 0; y <= 100; y += 2) {
      const u = y / 100;
      const open = 1 - Math.pow(1 - u, 2.2);
      const amp = 4.6 * Math.pow(u, 0.6) * (0.55 + 0.45 * Math.sin(phase));
      const x =
        50 +
        signed * (SEED + spread * open) +
        amp * Math.sin(y / 15 + phase) +
        amp * 0.45 * Math.sin(y / 7.3 + phase * 1.7);
      pts.push(`${x.toFixed(2)},${y.toFixed(1)}`);
    }
    const d = Math.abs(signed);
    const w = Math.max(0, 1 - Math.abs(d - focus) / focus);
    out +=
      `<polyline points="${pts.join(" ")}" fill="none" stroke="currentColor" ` +
      `stroke-opacity="${(0.05 + intensity * w).toFixed(3)}" ` +
      `stroke-width="${(0.8 + 0.9 * w).toFixed(2)}" stroke-linecap="round" ` +
      `vector-effect="non-scaling-stroke"/>`;
  }
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%">${out}</svg>`;
}

/** The mark, same geometry as <LiquidMark> / public/logo.svg. */
function markSvg(size, color) {
  return `<svg viewBox="-17 63 656 656" fill="none" style="width:${size}px;height:${size}px;display:block;color:${color}">
    <polygon points="462.14 405.28 437.5 405.28 386.14 311.63 310.14 173.05 234.15 311.63 182.79 405.28 158.15 405.28 234.15 266.7 310.14 128.13 386.14 266.7 462.14 405.28"
      fill="currentColor" stroke="currentColor" stroke-width="28.92" stroke-miterlimit="10"/>
    <path d="m478.82,491.36c0,89.4-75.3,161.86-168.17,161.86s-168.18-72.46-168.18-161.86h26.62c0,74.76,62.98,135.35,140.65,135.35s140.63-60.59,140.63-135.35h28.44Z"
      fill="currentColor" stroke="currentColor" stroke-width="30.43" stroke-miterlimit="10"/>
  </svg>`;
}

/* Layout: copy holds the left, the source holds the right.
 *
 * A 1200x630 canvas only shows the first third of a fan aimed across it, which
 * is the stretch where the currents are still straight — it read as rays, not
 * water, and it striped the headline. Giving the field its own half fixes both:
 * the fan opens fully inside empty space, and the copy never has a line on it.
 *
 * The mark is deliberately large. At feed thumbnail size it is the only part of
 * the card anyone actually resolves. It is also the single mark: the top-left
 * lockup is the wordmark alone, so the card keeps one source (§13). */
const SRC = { x: 950, y: 250 };
const MARK_SIZE = 128;
/* The card gives the field ~380px of height. A fan drawn straight into that is
 * all near-source, where the currents have not curved yet, so it reads as light
 * rays. Drawing the FULL fan into a tall box and squashing it with scaleY shows
 * the drape instead: same curve, compressed. The strokes survive it because the
 * SVG already scales non-uniformly (preserveAspectRatio="none"). */
const FIELD = { w: 1000, h: 840, scaleY: 0.45 };

function html(card) {
  /* The mark, its bloom, the field and the URL are ALWAYS brand cyan: they are
     the identity, and a gold droplet on a shared wiki link reads as a different
     product. Only the tag pill and the accented word in the title follow the
     section accent. */
  const accent = T.brand;
  const sectionAccent = card.accent === "gold" ? T.gold : T.brand;
  const title = card.title
    .map((part, i) => {
      const color = part.tone === "gold" ? T.gold : part.tone === "brand" ? T.brand : T.textPrimary;
      const br = card.breakAfter === i ? "<br/>" : "";
      return `<span style="color:${color}">${part.text}</span>${br}`;
    })
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;overflow:hidden;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
  .card{position:relative;width:${W}px;height:${H}px;overflow:hidden;
    background:
      radial-gradient(720px 560px at 79% 42%, rgba(131,233,255,.09), transparent 68%),
      linear-gradient(140deg, #060C14 0%, ${T.base} 52%, #0A1622 100%);
    color:${T.textPrimary}}

  /* Flow field, poured from the mark. Two masks intersect: one dissolves the
     birth and the tail, the other keeps the currents off the copy column. */
  .field{position:absolute;left:${SRC.x}px;top:${SRC.y}px;width:${FIELD.w}px;height:${FIELD.h}px;
    margin-left:${-FIELD.w / 2}px;color:${accent};pointer-events:none;
    transform-origin:50% 0;transform:scaleY(${FIELD.scaleY});
    -webkit-mask-image:
      linear-gradient(to bottom, transparent 0%, #000 9%, #000 68%, transparent 97%),
      linear-gradient(to right, transparent 0%, #000 34%);
    mask-image:
      linear-gradient(to bottom, transparent 0%, #000 9%, #000 68%, transparent 97%),
      linear-gradient(to right, transparent 0%, #000 34%);
    -webkit-mask-composite:source-in;mask-composite:intersect}

  /* Bloom on the source. Sits behind the mark so the mark stays crisp. */
  .bloom{position:absolute;left:${SRC.x}px;top:${SRC.y}px;width:520px;height:520px;margin:-260px 0 0 -260px;
    border-radius:50%;pointer-events:none;
    background:radial-gradient(circle, ${accent}2e 0%, ${accent}0f 36%, transparent 72%)}

  /* The source. One mark on the card, and it is this one. */
  .source{position:absolute;left:${SRC.x}px;top:${SRC.y}px;
    margin:${-MARK_SIZE / 2}px 0 0 ${-MARK_SIZE / 2}px;
    filter:drop-shadow(0 0 26px ${accent}b3) drop-shadow(0 0 66px ${accent}59)}

  .top{position:absolute;left:56px;top:52px;display:flex;align-items:center;gap:16px}
  .wordmark{font-size:26px;font-weight:700;letter-spacing:-.022em;line-height:1}
  .tag{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;letter-spacing:.16em;
    text-transform:uppercase;color:${sectionAccent};border:1px solid ${sectionAccent}4d;border-radius:999px;
    padding:7px 15px;line-height:1}

  .copy{position:absolute;left:56px;top:190px;width:700px}
  h1{font-size:${card.titleSize ?? 58}px;font-weight:600;letter-spacing:-.034em;line-height:1.08}
  .sub{margin-top:24px;font-size:23px;line-height:1.45;color:${T.textSecondary}}

  .rule{position:absolute;left:56px;right:56px;bottom:96px;height:1px;background:${T.borderSubtle}}
  .foot{position:absolute;left:56px;right:56px;bottom:44px;display:flex;align-items:baseline}
  .foot .l{font-size:19px;color:${T.textTertiary}}
  .foot .r{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:500;color:${accent}}
</style></head>
<body>
  <div class="card">
    <div class="field">${flowSvg()}</div>
    <div class="bloom"></div>
    <div class="source">${markSvg(MARK_SIZE, accent)}</div>

    <div class="top">
      <span class="wordmark">Liquid Terminal</span>
      <span class="tag">${card.tag}</span>
    </div>

    <div class="copy">
      <h1>${title}</h1>
      <div class="sub">${card.subtitle}</div>
    </div>

    <div class="rule"></div>
    <div class="foot">
      <span class="l">One terminal. Zero noise.</span>
      <span class="r">liquidterminal.xyz</span>
    </div>
  </div>
</body></html>`;
}

const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;

const { chromium } = require(GSTACK_PLAYWRIGHT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

for (const card of CARDS) {
  if (only && card.slug !== only) continue;
  await page.setContent(html(card), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: "png" });
  for (const rel of card.out) {
    const dest = path.join(ROOT, rel);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(`  ✓ ${rel}  (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}

await browser.close();
console.log("\nOG cards regenerated.");
