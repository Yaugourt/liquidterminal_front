/**
 * Elysium ecosystem directory and launchpad token market, read from
 * elysiumeco.xyz (an independent community site, used with its author's
 * permission). Their pages carry every figure as `data-*` attributes on each
 * row, refreshed every 5 minutes on their side, so we parse those attributes
 * rather than the rendered text.
 */

export const ELYSIUM_ECO_URL = "https://elysiumeco.xyz";

export type EcoProjectStatus =
  | "powers"
  | "live"
  | "testnet"
  | "verifying"
  | "announced"
  | "exploring";

export interface EcoProject {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: EcoProjectStatus;
  statusLabel: string;
  logo: string | null;
  /** Main outbound link (app, launch page, docs). */
  url: string | null;
  urlLabel: string | null;
  x: string | null;
  /** 7-day activity; null when the project has no reading (shown as a dash). */
  wallets7d: number | null;
  txs7d: number | null;
  volume7d: number | null;
  launches7d: number | null;
  sales7d: number | null;
  bets7d: number | null;
  plays7d: number | null;
  tvl: number | null;
  accounts: number | null;
  followers: number | null;
}

export interface EcoToken {
  address: string;
  symbol: string;
  name: string;
  launchpad: string;
  image: string | null;
  priceUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  txns24h: number | null;
  holders: number | null;
  marketCap: number | null;
  fdv: number | null;
  top10Pct: number | null;
  devPct: number | null;
  /** Bonding-curve progress in percent; null when the token trades in a pool. */
  curvePct: number | null;
  bornAt: number | null;
  graduated: boolean;
  links: { x: string | null; telegram: string | null; website: string | null };
}

export interface EcoSnapshot {
  projects: EcoProject[];
  tokens: EcoToken[];
  hypeUsd: number | null;
  fetchedAt: number;
}

// Their "Partner" badge is a commercial tie of theirs, not a chain status: it reads as on testnet here.
const STATUS_BY_CLASS: Record<string, EcoProjectStatus> = {
  "st-partner": "testnet",
  "st-confirmed": "live",
  "st-verify": "verifying",
  "st-announced": "announced",
  "st-exploring": "exploring",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function attr(head: string, name: string): string | null {
  const m = head.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decodeEntities(m[1]) : null;
}

/** Their convention: -1 means "no reading" for a project metric. */
function num(head: string, name: string, missing = -1): number | null {
  const raw = attr(head, name);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n === missing) return null;
  return n;
}

function text(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : null;
}

function absolute(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${ELYSIUM_ECO_URL}${url}`;
  return null;
}

/** Split a listing page into its rows: each row opens with `<div class="pl-row…"` (featured rows add classes). */
function rows(html: string): string[] {
  return html.split(/<div class="pl-row(?:\s[^"]*)?"/).slice(1);
}

export function parseProjects(html: string): EcoProject[] {
  const out: EcoProject[] = [];
  for (const row of rows(html)) {
    const head = row.slice(0, row.indexOf(">") + 1);
    const slug = text(row, /href="\/projects\/([^/"]+)\/?"/);
    const name = text(row, /<span class="c-name"><b>([^<]+)<\/b>/);
    if (!slug || !name) continue;
    const badge = row.match(/class="badge (st-[a-z-]+)">([^<]+)</);
    const label = badge ? decodeEntities(badge[2]) : "";
    let status: EcoProjectStatus = badge ? STATUS_BY_CLASS[badge[1]] ?? "testnet" : "testnet";
    if (label === "Powers Elysium") status = "powers";
    const go = row.match(/<span class="pl-go"><a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
    out.push({
      slug,
      name,
      tagline: text(row, /<span class="c-name"><b>[^<]+<\/b><em>([^<]*)<\/em>/) ?? "",
      description: attr(head, "title") ?? "",
      category: attr(head, "data-cat") ?? "Other",
      status,
      statusLabel: badge?.[1] === "st-partner" ? "On testnet" : label,
      logo: absolute(text(row, /<span class="logo"><img src="([^"]+)"/)),
      url: go ? decodeEntities(go[1]) : null,
      urlLabel: go ? decodeEntities(go[2]) : null,
      x: text(row, /<a class="soc" href="(https:\/\/x\.com\/[^"]+)"/),
      wallets7d: num(head, "data-wwallets"),
      txs7d: num(head, "data-wtxs"),
      volume7d: num(head, "data-wvolume"),
      launches7d: num(head, "data-wlaunches"),
      sales7d: num(head, "data-wsales"),
      bets7d: num(head, "data-wbets"),
      plays7d: num(head, "data-wplays"),
      tvl: num(head, "data-wtvl"),
      accounts: num(head, "data-waccounts"),
      followers: num(head, "data-wfollowers"),
    });
  }
  return out;
}

export function parseTokens(html: string): EcoToken[] {
  const out: EcoToken[] = [];
  for (const row of rows(html)) {
    const head = row.slice(0, row.indexOf(">") + 1);
    const address = attr(head, "data-addr");
    const symbol = text(row, /<span class="c-name"><b>([^<]+)<\/b>/);
    if (!address || !symbol) continue;
    const tags = (attr(head, "data-tags") ?? "").split(/\s+/);
    const link = (label: string) => text(row, new RegExp(`<a class="soc" href="([^"]+)"[^>]*aria-label="${label}"`));
    // Signed fields (change) keep -1 as a real value; only the curve uses -1 as "none".
    const raw = (name: string) => num(head, name, Number.NaN);
    out.push({
      address: address.toLowerCase(),
      symbol,
      name: text(row, /<small>([^<]*)<\/small>/) ?? symbol,
      launchpad: attr(head, "data-cat") ?? "",
      image: text(row, /<img src="(https:[^"]+)"/),
      priceUsd: raw("data-price"),
      change24h: raw("data-ch"),
      volume24h: raw("data-v24"),
      txns24h: raw("data-tx"),
      holders: raw("data-holders"),
      marketCap: raw("data-mcap"),
      fdv: raw("data-fdv"),
      top10Pct: raw("data-top10"),
      devPct: raw("data-dev"),
      curvePct: num(head, "data-curve"),
      bornAt: raw("data-born"),
      graduated: tags.includes("Graduated"),
      links: { x: link("X"), telegram: link("Telegram"), website: link("Website") },
    });
  }
  return out;
}

function hypeFrom(html: string): number | null {
  const m = html.match(/<script type="application\/json" id="tk-live">\s*(\{.*?\})\s*<\/script>/s);
  if (!m) return null;
  try {
    const hype = (JSON.parse(m[1]) as { hype?: unknown }).hype;
    return typeof hype === "number" && hype > 0 ? hype : null;
  } catch {
    return null;
  }
}

async function page(path: string): Promise<string> {
  const res = await fetch(`${ELYSIUM_ECO_URL}${path}`, {
    headers: { "user-agent": "LiquidTerminal/1.0 (+https://liquidterminal.xyz)" },
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`elysiumeco ${path} ${res.status}`);
  return res.text();
}

export async function getEcoSnapshot(): Promise<EcoSnapshot> {
  const [projectsHtml, tokensHtml] = await Promise.all([page("/projects"), page("/tokens")]);
  const projects = parseProjects(projectsHtml);
  const tokens = parseTokens(tokensHtml);
  if (projects.length === 0 && tokens.length === 0) throw new Error("elysiumeco layout changed: no rows parsed");
  return { projects, tokens, hypeUsd: hypeFrom(tokensHtml), fetchedAt: Date.now() };
}
