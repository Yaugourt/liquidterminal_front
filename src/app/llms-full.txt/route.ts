import { SITE_CONFIG } from "@/lib/site-config";
import { env } from "@/lib/env";

export const revalidate = 3600;

const API_BASE = env.NEXT_PUBLIC_API;

interface ApiLinkPreview {
  title?: string | null;
  description?: string | null;
  siteName?: string | null;
}

interface ApiResourceCategory {
  category?: { name?: string | null } | null;
}

interface ApiResource {
  url: string;
  savesCount?: number;
  linkPreview?: ApiLinkPreview | null;
  categories?: ApiResourceCategory[];
}

interface ResourcesPage {
  data: ApiResource[];
  pagination?: { hasNext?: boolean };
}

async function fetchAllResources(): Promise<ApiResource[]> {
  const all: ApiResource[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${API_BASE}/educational/resources?limit=100&page=${page}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;
    const body = (await res.json()) as ResourcesPage;
    all.push(...(body.data ?? []));
    if (!body.pagination?.hasNext) break;
  }
  return all;
}

/**
 * llms-full.txt: the whole approved wiki corpus as one markdown document.
 * AI crawlers do not execute JS, so this is how the wiki content actually
 * reaches them; each entry keeps its source URL so answers can cite it.
 */
export async function GET() {
  const base = SITE_CONFIG.url;
  let resources: ApiResource[] = [];
  try {
    resources = await fetchAllResources();
  } catch {
    // Backend unreachable: still serve the header so the file never 500s.
  }

  const byCategory = new Map<string, ApiResource[]>();
  for (const resource of resources) {
    const names = (resource.categories ?? [])
      .map((c) => c.category?.name)
      .filter((name): name is string => Boolean(name));
    for (const name of names.length ? names : ["Uncategorized"]) {
      const bucket = byCategory.get(name) ?? [];
      bucket.push(resource);
      byCategory.set(name, bucket);
    }
  }

  const sections = [...byCategory.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([name, items]) => {
      const lines = items
        .sort((a, b) => (b.savesCount ?? 0) - (a.savesCount ?? 0))
        .map((r) => {
          const title = r.linkPreview?.title?.trim() || r.url;
          const desc = r.linkPreview?.description?.trim();
          const saves = r.savesCount ? ` (${r.savesCount} saves)` : "";
          return `- [${title}](${r.url})${saves}${desc ? `: ${desc}` : ""}`;
        })
        .join("\n");
      return `## ${name}\n\n${lines}`;
    })
    .join("\n\n");

  const body = `# Liquid Terminal - Hyperliquid Wiki, full corpus

> Every approved resource of the community-curated Hyperliquid wiki (${resources.length} entries), grouped by category and ranked by community saves. Browse interactively at ${base}/wiki. Site map for LLMs: ${base}/llms.txt.

${sections}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
