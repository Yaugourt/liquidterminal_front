import { decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

/**
 * SEO chrome for the venue overview page only.
 *
 * It sits in a route group so it does NOT wrap `[dex]/[asset]`. Rendered from
 * `[dex]/layout.tsx` it would emit a second `<h1>` and a second BreadcrumbList
 * on every asset page, competing with the asset's own — the asset layout
 * already publishes a breadcrumb that includes this venue.
 *
 * It stays in a layout rather than the page because the client view returns
 * early while loading, which would make the heading vanish for crawlers.
 */
export default async function PerpDexOverviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dex: string }>;
}) {
  const { dex } = await params;
  const name = decodeEntityParam(dex);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Market", path: "/market" },
          { name: "Perp DEXs", path: "/market/perpdex" },
          { name, path: `/market/perpdex/${encodeURIComponent(name)}` },
        ])}
      />
      <h1 className="sr-only">{name} perp DEX on Hyperliquid (HIP-3)</h1>
      {children}
    </>
  );
}
