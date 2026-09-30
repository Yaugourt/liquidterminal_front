/* UX audit for one or more routes: full-page screenshots at three widths plus
   measured layout problems (dead space inside grid items, uneven rows,
   clipped text, content wider than its box, horizontal page overflow,
   placeholders still shown after load).

   Usage: node scripts/ux-audit.mjs <route> [route...] [--base=http://localhost:3000] [--out=.design-audit/ux] [--wait=12000]
   Needs `pnpm run dev` (and an API on NEXT_PUBLIC_API) running. */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const flag = (n, d) => argv.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=") ?? d;
const routes = argv.filter((a) => !a.startsWith("--"));
if (!routes.length) throw new Error("usage: node scripts/ux-audit.mjs <route> [route...]");
const base = flag("base", "http://localhost:3000");
const out = resolve(flag("out", ".design-audit/ux"));
const wait = Number(flag("wait", "12000"));
const WIDTHS = [[1440, 900], [1024, 800], [375, 812]];

let playwright;
try {
  playwright = await import("playwright");
} catch {
  playwright = await import(pathToFileURL(process.env.PLAYWRIGHT || "/home/yaugourt/hypedexer-ds/node_modules/playwright/index.mjs").href);
}

/** Runs in the page. Keep it self-contained. */
function audit() {
  const main = document.querySelector("main") || document.body;
  const r = (el) => el.getBoundingClientRect();
  const sy = window.scrollY;
  const label = (el) => {
    const h = el.querySelector("h1,h2,h3,h4");
    return ((h ? h.textContent : el.textContent) || "").trim().replace(/\s+/g, " ").slice(0, 50);
  };
  const contentBottom = (el) => {
    let b = -Infinity;
    const walk = (n) => {
      for (const c of n.children) {
        const cs = getComputedStyle(c);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "absolute" || cs.position === "fixed") continue;
        const cr = r(c);
        if (cr.height === 0 && cr.width === 0) continue;
        const leaf = c.childElementCount === 0 || ["svg", "TABLE", "CANVAS", "IMG"].includes(c.tagName);
        if (leaf) b = Math.max(b, cr.bottom);
        else {
          const before = b;
          walk(c);
          if (b === before && (c.textContent || "").trim()) b = Math.max(b, cr.bottom);
        }
      }
    };
    walk(el);
    return b;
  };
  const deadSpace = [];
  const unevenRows = [];
  for (const g of main.querySelectorAll("*")) {
    if (getComputedStyle(g).display !== "grid" || g.children.length < 2) continue;
    const items = [...g.children].filter((c) => getComputedStyle(c).display !== "none" && r(c).height > 40);
    const rows = {};
    for (const it of items) (rows[Math.round(r(it).top / 8)] ??= []).push(it);
    for (const row of Object.values(rows)) {
      if (row.length < 2) continue;
      const hs = row.map((it) => r(it).height);
      const max = Math.max(...hs);
      row.forEach((it, i) => {
        const pad = parseFloat(getComputedStyle(it).paddingBottom) || 0;
        const empty = r(it).bottom - pad - contentBottom(it);
        const where = { item: label(it), y: Math.round(r(it).top + sy), grid: String(g.className).slice(0, 100) };
        if (empty > 32) deadSpace.push({ ...where, emptyPx: Math.round(empty), itemH: Math.round(hs[i]) });
        else if (max - hs[i] > 48) unevenRows.push({ ...where, shortByPx: Math.round(max - hs[i]) });
      });
    }
  }
  const clipped = [];
  for (const el of main.querySelectorAll("*")) {
    if (el.childElementCount > 0) continue;
    const cs = getComputedStyle(el);
    // Truncation that keeps the full text on hover (title) is intended.
    if (el.closest("[title]")) continue;
    if (el.scrollWidth > el.clientWidth + 1 && (cs.overflow === "hidden" || cs.overflowX === "hidden" || cs.textOverflow === "ellipsis")) {
      clipped.push({ text: el.textContent.trim().slice(0, 60), shown: el.clientWidth, needs: el.scrollWidth, y: Math.round(r(el).top + sy) });
    }
  }
  // Containers whose content is wider than their box (a table cut at the card edge).
  const innerOverflow = [];
  for (const el of main.querySelectorAll("*")) {
    if (el.childElementCount === 0) continue;
    const cs = getComputedStyle(el);
    if (!["auto", "scroll", "hidden"].includes(cs.overflowX)) continue;
    if (cs.textOverflow === "ellipsis") continue; // intended truncation
    if (el.tagName === "PRE" || el.closest("pre")) continue; // code blocks scroll by design
    if (el.scrollWidth > el.clientWidth + 2 && r(el).width > 120) {
      const card = el.closest("[class*=rounded]") || el;
      innerOverflow.push({ in: label(card), shown: el.clientWidth, needs: el.scrollWidth, y: Math.round(r(el).top + sy) });
    }
  }
  const placeholders = [];
  const re = /^(Loading…|Loading\.\.\.|…|Reading bytecode…)$|unavailable|unreachable|No .* yet|Could not/i;
  for (const el of main.querySelectorAll("p,span,div,td")) {
    if (el.childElementCount > 0) continue;
    const t = (el.textContent || "").trim();
    if (t && re.test(t) && r(el).height > 0) placeholders.push({ text: t.slice(0, 70), y: Math.round(r(el).top + sy) });
  }
  return {
    viewport: innerWidth,
    pageHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    deadSpace,
    unevenRows,
    clipped: clipped.slice(0, 30),
    innerOverflow: innerOverflow.slice(0, 20),
    placeholders: placeholders.slice(0, 30),
  };
}

mkdirSync(out, { recursive: true });
const browser = await playwright.chromium.launch();
const report = {};
try {
  for (const route of routes) {
    const slug = route.replace(/^\//, "").replace(/[/?&=]+/g, "-") || "home";
    report[route] = {};
    for (const [w, h] of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: "dark" });
      // Skip the onboarding tour and the missions widget: app chrome, not page content.
      await page.addInitScript(() => {
        // Mark the onboarding tour as done (zustand persist key of src/store/use-onboarding.ts).
        try {
          localStorage.setItem("onboarding-storage", JSON.stringify({ state: { hasCompletedOnboarding: true, hasSeenWelcome: true }, version: 1 }));
        } catch {}
      });
      await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(wait);
      const skip = page.getByText("Skip", { exact: true });
      if (await skip.count()) await skip.first().click().catch(() => {});
      await page.evaluate(() => document.querySelectorAll("button,div").forEach((el) => {
        if (/^Missions/.test(el.textContent?.trim() || "") && el.getBoundingClientRect().width < 220) el.style.display = "none";
      }));
      await page.waitForTimeout(600);
      const file = `${out}/${slug}-${w}.png`;
      await page.screenshot({ path: file, fullPage: true });
      report[route][w] = { screenshot: file, ...(await page.evaluate(audit)) };
      await page.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
for (const [route, byW] of Object.entries(report)) {
  console.log(`\n# ${route}`);
  for (const [w, d] of Object.entries(byW)) {
    console.log(`  ${w}px  height ${d.pageHeight}  overflowX ${d.horizontalOverflow}  deadSpace ${d.deadSpace.length}  uneven ${d.unevenRows.length}  clipped ${d.clipped.length}  innerOverflow ${d.innerOverflow.length}  placeholders ${d.placeholders.length}`);
    for (const k of ["deadSpace", "unevenRows", "clipped", "innerOverflow", "placeholders"]) for (const x of d[k].slice(0, 6)) console.log(`    ${k}: ${JSON.stringify(x)}`);
  }
}
