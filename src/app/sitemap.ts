import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { CHAPTER_CATEGORY_MAP, slugify } from '@/components/wiki/hub/topics'
import { env } from '@/lib/env'

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
  // Ecosystem
  { path: '/ecosystem', changeFrequency: 'weekly', priority: 0.8 },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
  const wikiRoutes = await dynamicWikiRoutes(baseUrl)
  return [...staticRoutes, ...wikiRoutes]
}
