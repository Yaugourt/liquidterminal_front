import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { CHAPTER_CATEGORY_MAP, slugify } from '@/components/wiki/hub/topics'
import { env } from '@/lib/env'
import { API_URLS } from '@/services/api/constants'
import { HIP4_SLUGS } from '@/lib/hip4-chapters'

export const revalidate = 3600

/**
 * Learn chapter slugs, derived from the same map the wiki routes use.
 * "introduction" redirects to /wiki (next.config): a redirecting URL in a
 * sitemap is reported as an error, so it is left out.
 */
const WIKI_CHAPTERS = Object.keys(CHAPTER_CATEGORY_MAP)
  .map(slugify)
  .filter((slug) => slug !== 'introduction')

/**
 * Static sections. No lastModified on purpose: a build-time `new Date()`
 * is a fake freshness signal crawlers learn to distrust.
 */
const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  // Dashboard scopes
  { path: '/dashboard', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/dashboard/market', changeFrequency: 'hourly', priority: 0.7 },
  { path: '/dashboard/capital', changeFrequency: 'hourly', priority: 0.7 },
  { path: '/dashboard/ecosystem', changeFrequency: 'daily', priority: 0.7 },
  { path: '/export', changeFrequency: 'weekly', priority: 0.6 },
  // Explorer
  { path: '/explorer', changeFrequency: 'daily', priority: 0.9 },
  { path: '/explorer/vaults', changeFrequency: 'hourly', priority: 0.8 },
  { path: '/market/yields', changeFrequency: 'hourly', priority: 0.8 },
  { path: '/explorer/validator', changeFrequency: 'daily', priority: 0.7 },
  { path: '/explorer/liquidations', changeFrequency: 'hourly', priority: 0.7 },
  { path: '/explorer/priority-fees', changeFrequency: 'daily', priority: 0.6 },
  // Market
  { path: '/market', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/market/spot', changeFrequency: 'hourly', priority: 0.8 },
  { path: '/market/perp', changeFrequency: 'hourly', priority: 0.8 },
  { path: '/market/spot/auction', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/perp/auction', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/tracker', changeFrequency: 'daily', priority: 0.8 },
  { path: '/alerts', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/names', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/perks', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/market/tracker/public-lists', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/builders', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/perpdex', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/hip4', changeFrequency: 'hourly', priority: 0.7 },
  { path: '/market/trades', changeFrequency: 'hourly', priority: 0.6 },
  { path: '/market/builders/intelligence', changeFrequency: 'daily', priority: 0.5 },
  // HYPE token chapters
  { path: '/hype', changeFrequency: 'daily', priority: 0.8 },
  { path: '/hype/financials', changeFrequency: 'daily', priority: 0.7 },
  { path: '/hype/valuation', changeFrequency: 'daily', priority: 0.6 },
  { path: '/hype/capital', changeFrequency: 'daily', priority: 0.7 },
  { path: '/hype/reserve-yield', changeFrequency: 'daily', priority: 0.7 },
  { path: '/hype/operations', changeFrequency: 'daily', priority: 0.6 },
  // HyperEVM and the share studio
  { path: '/evm', changeFrequency: 'daily', priority: 0.6 },
  { path: '/share', changeFrequency: 'weekly', priority: 0.5 },
  // Elysium testnet (address pages are noindex: not listed)
  ...['', '/start', '/ecosystem', '/launchpads', '/network', '/simulate', '/tx', '/decode', '/contracts', '/tokens', '/dex', '/bridge', '/users', '/economics', '/fees', '/node', '/share'].map(
    (p) => ({ path: `/elysium${p}`, changeFrequency: 'daily' as const, priority: p === '' ? 0.7 : 0.6 })
  ),
  // HIP-4 docs: /hip4 itself only redirects to /hip4/home, so list the chapters
  ...HIP4_SLUGS.map((slug) => ({ path: `/hip4/${slug}`, changeFrequency: 'monthly' as const, priority: slug === 'home' ? 0.6 : 0.4 })),
  // Ecosystem (the bare /ecosystem route does not exist — never list it)
  { path: '/ecosystem/publicgoods', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ecosystem/project', changeFrequency: 'weekly', priority: 0.7 },
  // Wiki (Atlas routes)
  { path: '/wiki', changeFrequency: 'daily', priority: 0.8 },
  { path: '/wiki/topics', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/wiki/readlists', changeFrequency: 'daily', priority: 0.6 },
  { path: '/wiki/contributions', changeFrequency: 'weekly', priority: 0.4 },
  ...WIKI_CHAPTERS.map((chapter) => ({
    path: `/wiki/learn/${chapter}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })),
]

interface ApiCategory {
  name?: string | null
}

interface ApiReadList {
  id: number
  name?: string | null
  isPublic?: boolean
  updatedAt?: string | null
}

/** Flips to incomplete when a backend source failed: its URLs are missing, not absent. */
interface Health {
  complete: boolean
}

/** Wiki category and public read-list URLs, straight from the backend. */
async function dynamicWikiRoutes(baseUrl: string, health: Health): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/educational/categories`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const body = (await res.json()) as { data?: ApiCategory[] }
      for (const category of body.data ?? []) {
        if (!category.name) continue
        routes.push({
          url: `${baseUrl}/wiki/c/${slugify(category.name)}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    } else {
      health.complete = false
    }
  } catch {
    // Backend down: the static sitemap still ships (see `sitemap` for what is cached).
    health.complete = false
  }
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API}/readlists?limit=100`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const body = (await res.json()) as { data?: ApiReadList[] }
      for (const list of body.data ?? []) {
        if (!list.name || list.isPublic === false) continue
        routes.push({
          url: `${baseUrl}/wiki/readlists/${slugify(list.name)}-${list.id}`,
          ...(list.updatedAt ? { lastModified: new Date(list.updatedAt) } : {}),
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    } else {
      health.complete = false
    }
  } catch {
    // Same: never let the sitemap 500 because of the API.
    health.complete = false
  }
  return routes
}

const ENTITY_LIMIT = 100

/**
 * Projects are listed page by page until the backend says there are no more
 * (`collectPaginated` stops at `totalPages`); this only bounds a runaway list.
 * A fixed 3 pages dropped every project past the 300th (343 listed).
 */
const PROJECT_MAX_PAGES = 10

/** GET/POST JSON with soft failure: the sitemap must never 500 because of an API. */
async function fetchJson<T>(url: string, health: Health, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 }, ...init })
    if (!res.ok) {
      health.complete = false
      return null
    }
    return (await res.json()) as T
  } catch {
    health.complete = false
    return null
  }
}

interface PaginatedBody<T> {
  data?: T[]
  pagination?: { totalPages?: number }
}

/** Collect a bounded number of pages from a paginated backend list. */
async function collectPaginated<T>(
  buildUrl: (page: number) => string,
  maxPages: number,
  health: Health
): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; page <= maxPages; page++) {
    const body = await fetchJson<PaginatedBody<T>>(buildUrl(page), health)
    const rows = body?.data ?? []
    if (rows.length === 0) break
    items.push(...rows)
    const totalPages = body?.pagination?.totalPages
    if (totalPages !== undefined && page >= totalPages) break
  }
  return items
}

/**
 * Entity URLs (spot tokens, perp markets, HIP-3 dexs, vaults, projects).
 * These pages exist and carry per-entity metadata; the sitemap has to
 * surface them or crawlers only ever discover the list pages.
 */
async function entityRoutes(baseUrl: string, health: Health): Promise<MetadataRoute.Sitemap> {
  const api = env.NEXT_PUBLIC_API
  const routes: MetadataRoute.Sitemap = []

  const [spotTokens, perpMarkets, vaults, projects, perpDexs] = await Promise.all([
    collectPaginated<{ name?: string }>(
      (page) => `${api}/market/spot?limit=${ENTITY_LIMIT}&page=${page}&sortBy=volume&sortOrder=desc`,
      5,
      health
    ),
    collectPaginated<{ name?: string }>(
      (page) => `${api}/market/perp?limit=${ENTITY_LIMIT}&page=${page}&sortBy=volume&sortOrder=desc`,
      3,
      health
    ),
    collectPaginated<{ summary?: { vaultAddress?: string; isClosed?: boolean } }>(
      (page) => `${api}/market/vaults?limit=${ENTITY_LIMIT}&page=${page}`,
      3,
      health
    ),
    collectPaginated<{ id?: number }>(
      (page) => `${api}/project?limit=${ENTITY_LIMIT}&page=${page}&sort=title&order=asc`,
      PROJECT_MAX_PAGES,
      health
    ),
    // HIP-3 dex list comes straight from the public Hyperliquid API (tiny list).
    fetchJson<Array<{ name?: string } | null>>(`${API_URLS.HYPERLIQUID_API}/info`, health, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'perpDexs' }),
    }),
  ])

  for (const token of spotTokens) {
    if (!token.name) continue
    routes.push({
      url: `${baseUrl}/market/spot/${encodeURIComponent(token.name)}`,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }
  for (const market of perpMarkets) {
    if (!market.name) continue
    routes.push({
      url: `${baseUrl}/market/perp/${encodeURIComponent(market.name)}`,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }
  for (const dex of perpDexs ?? []) {
    if (!dex?.name) continue
    routes.push({
      url: `${baseUrl}/market/perpdex/${encodeURIComponent(dex.name)}`,
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }
  for (const vault of vaults) {
    const address = vault.summary?.vaultAddress
    if (!address || vault.summary?.isClosed) continue
    routes.push({
      url: `${baseUrl}/explorer/vaults/${address}`,
      changeFrequency: 'daily',
      priority: 0.5,
    })
  }
  for (const project of projects) {
    if (typeof project.id !== 'number') continue
    routes.push({
      url: `${baseUrl}/ecosystem/project/${project.id}`,
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }
  return routes
}

/** The last sitemap built from complete data, served again when a source fails. */
let lastCompleteSitemap: MetadataRoute.Sitemap | null = null

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url
  const health: Health = { complete: true }
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
  const [wikiRoutes, entities] = await Promise.all([
    dynamicWikiRoutes(baseUrl, health),
    entityRoutes(baseUrl, health),
  ])
  const all = [...staticRoutes, ...wikiRoutes, ...entities]
  const seen = new Set<string>()
  const routes = all.filter((route) => {
    if (seen.has(route.url)) return false
    seen.add(route.url)
    return true
  })
  if (health.complete) {
    lastCompleteSitemap = routes
    return routes
  }
  // A source failed during this regeneration. Shipping the gap would replace
  // the previous good page for an hour: serve the last complete one, or throw so
  // Next keeps the previous cached page. The build itself never fails over a blip.
  if (lastCompleteSitemap) return lastCompleteSitemap
  if (process.env.NEXT_PHASE === 'phase-production-build') return routes
  throw new Error('sitemap: a backend source failed and no complete sitemap is cached')
}
