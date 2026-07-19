#!/usr/bin/env node
/**
 * visual-check — the render-and-inspect gate (Chantier 2).
 *
 * Renders a route at three breakpoints in a real headless browser and FAILS
 * (non-zero exit) when content silently clips or the page scrolls sideways —
 * the exact class of defect that tsc + eslint cannot see (e.g. a 3-column
 * table crammed into a 1/3-width card, content disappearing off the right).
 *
 * It reuses the Chromium already vendored with gstack — no new dependency.
 *
 * Usage:
 *   pnpm run visual-check /explorer/vaults
 *   pnpm run visual-check /explorer/vaults --base http://127.0.0.1:3000 --wait 3000
 *
 * Requires the dev server to be running (pnpm run dev). Screenshots are written
 * to .design-audit/ for the before/after glance.
 */
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);

// Playwright + its Chromium ship with the vendored gstack install.
const GSTACK_NODE_MODULES = process.env.GSTACK_NODE_MODULES
  ? path.join(process.env.GSTACK_NODE_MODULES, "playwright")
  : [
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

const BREAKPOINTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "lg", width: 1024, height: 800 }, // where lg:grid-cols-3 makes cards narrowest
  { name: "desktop", width: 1440, height: 900 },
];

function parseArgs(argv) {
  const args = { route: null, base: "http://127.0.0.1:3000", wait: 2500 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--base") args.base = argv[++i];
    else if (a === "--wait") args.wait = Number(argv[++i]);
    else if (!a.startsWith("--")) args.route = a;
  }
  return args;
}

/** Runs in the page. Finds elements that silently clip their content. */
function collectClips() {
  const findings = [];

  /**
   * Ambient glows, gradient washes and blur blobs are *meant* to bleed past
   * their card and be cut by overflow-hidden (the Aurora look: an empty
   * absolutely-positioned, non-interactive div offset outside the box).
   * They are not clipped content, so they must not fail the gate. Anything
   * carrying text or accepting a pointer stays in scope.
   */
  const isDecorativeBleed = (node) => {
    const s = getComputedStyle(node);
    return (
      s.pointerEvents === "none" &&
      (s.position === "absolute" || s.position === "fixed") &&
      node.textContent.trim() === ""
    );
  };

  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    const ox = style.overflowX;
    const clipsX = ox === "hidden" || ox === "clip";
    if (!clipsX) continue; // overflow auto/scroll/visible is not a silent clip
    if (style.textOverflow === "ellipsis") continue; // intentional truncation
    const over = el.scrollWidth - el.clientWidth;
    if (over <= 2) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 8) continue; // ignore slivers / off-screen

    // Re-measure the overflow using real content only, so a decorative bleed
    // cannot mask (or invent) a clip. The reported number is what a user
    // actually loses.
    let contentOver = 0;
    for (const node of el.querySelectorAll("*")) {
      if (isDecorativeBleed(node)) continue;
      const r = node.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      contentOver = Math.max(contentOver, r.right - rect.right, rect.left - r.left);
    }
    if (contentOver <= 2) continue;

    const cls = typeof el.className === "string" ? el.className.slice(0, 70) : "";
    findings.push({
      tag: el.tagName.toLowerCase(),
      cls,
      over: Math.round(contentOver),
      w: Math.round(rect.width),
    });
  }
  // De-dupe identical signatures, keep worst overflow.
  const byKey = new Map();
  for (const f of findings) {
    const k = `${f.tag}.${f.cls}`;
    if (!byKey.has(k) || byKey.get(k).over < f.over) byKey.set(k, f);
  }
  return [...byKey.values()].sort((a, b) => b.over - a.over).slice(0, 12);
}

async function main() {
  const { route, base, wait } = parseArgs(process.argv.slice(2));
  if (!route) {
    console.error("Usage: pnpm run visual-check <route> [--base URL] [--wait ms]");
    process.exit(2);
  }

  let chromium;
  try {
    ({ chromium } = require(GSTACK_NODE_MODULES));
  } catch {
    console.error(`✗ Could not load Playwright from ${GSTACK_NODE_MODULES}`);
    console.error("  Run gstack setup, or adjust GSTACK_NODE_MODULES in this script.");
    process.exit(2);
  }

  // Fail fast with a clear message if the dev server isn't up.
  try {
    await fetch(base, { method: "HEAD" });
  } catch {
    console.error(`✗ Dev server unreachable at ${base} — start it with: pnpm run dev`);
    process.exit(2);
  }

  const outDir = path.join(process.cwd(), ".design-audit");
  await mkdir(outDir, { recursive: true });
  const slug = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const url = base.replace(/\/$/, "") + route;
  let failed = false;

  console.log(`\nvisual-check ${route}  (${url})`);
  for (const bp of BREAKPOINTS) {
    const page = await browser.newPage({ viewport: { width: bp.width, height: bp.height } });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(wait);

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      const clips = await page.evaluate(collectClips);

      const shot = path.join(outDir, `${slug}-${bp.width}.png`);
      await page.screenshot({ path: shot, fullPage: true });

      const pageBad = pageOverflow > 2;
      const ok = !pageBad && clips.length === 0;
      if (!ok) failed = true;

      console.log(`\n  ${ok ? "✓" : "✗"} ${bp.name} (${bp.width}px)  →  ${path.relative(process.cwd(), shot)}`);
      if (pageBad) console.log(`      page scrolls sideways by ${pageOverflow}px`);
      for (const c of clips) {
        console.log(`      clip +${c.over}px  <${c.tag}> w=${c.w}  ${c.cls ? `class="${c.cls}"` : ""}`);
      }
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(failed ? `\n✗ visual-check FAILED — see clips above + screenshots in .design-audit/\n` : `\n✓ visual-check passed (no overflow / clipping)\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
