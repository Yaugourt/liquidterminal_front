import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { CHAPTER_CATEGORY_MAP, slugify } from '@/components/wiki/hub/topics'
import { env } from '@/lib/env'
import { API_URLS } from '@/services/api/constants'

export const revalidate = 3600

/** Learn chapter slugs, derived from the same map the wiki routes use. */
const WIKI_CHAPTERS = Object.keys(CHAPTER_CATEGORY_MAP).map(slugify)

/**
 * Static sections. No lastModified on purpose: a build-time `new Date()`
 * is a fake freshness signal crawlers learn to distrust.
 */
const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  // Explorer
  { path: '/explorer', changeFrequency: 'daily', priority: 0.9 },
  { path: '/explorer/vaults', changeFrequency: 'hourly', priority: 0.8 },
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
  { path: '/market/tracker/public-lists', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/builders', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/perpdex', changeFrequency: 'daily', priority: 0.7 },
  { path: '/market/hip4', changeFrequency: 'hourly', priority: 0.7 },
  // HIP-4 docs
  { path: '/hip4', changeFrequency: 'weekly', priority: 0.6 },
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

/** Wiki category and public read-list URLs, straight from the backend. */
async function dynamicWikiRoutes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
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
    }
  } catch {
    // Backend down: the static sitemap still ships.
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
    }
  } catch {
    // Same: never let the sitemap 500 because of the API.
  }
  return routes
}

const ENTITY_LIMIT = 100

/** GET/POST JSON with soft failure: the sitemap must never 500 because of an API. */
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 }, ...init })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
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
  maxPages: number
): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; page <= maxPages; page++) {
    const body = await fetchJson<PaginatedBody<T>>(buildUrl(page))
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
async function entityRoutes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const api = env.NEXT_PUBLIC_API
  const routes: MetadataRoute.Sitemap = []

  const [spotTokens, perpMarkets, vaults, projects, perpDexs] = await Promise.all([
    collectPaginated<{ name?: string }>(
      (page) => `${api}/market/spot?limit=${ENTITY_LIMIT}&page=${page}&sortBy=volume&sortOrder=desc`,
      5
    ),
    collectPaginated<{ name?: string }>(
      (page) => `${api}/market/perp?limit=${ENTITY_LIMIT}&page=${page}&sortBy=volume&sortOrder=desc`,
      3
    ),
    collectPaginated<{ summary?: { vaultAddress?: string; isClosed?: boolean } }>(
      (page) => `${api}/market/vaults?limit=${ENTITY_LIMIT}&page=${page}`,
      3
    ),
    collectPaginated<{ id?: number }>(
      (page) => `${api}/project?limit=${ENTITY_LIMIT}&page=${page}&sort=title&order=asc`,
      3
    ),
    // HIP-3 dex list comes straight from the public Hyperliquid API (tiny list).
    fetchJson<Array<{ name?: string } | null>>(`${API_URLS.HYPERLIQUID_API}/info`, {
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
  const [wikiRoutes, entities] = await Promise.all([
    dynamicWikiRoutes(baseUrl),
    entityRoutes(baseUrl),
  ])
  const all = [...staticRoutes, ...wikiRoutes, ...entities]
  const seen = new Set<string>()
  return all.filter((route) => {
    if (seen.has(route.url)) return false
    seen.add(route.url)
    return true
  })
}
