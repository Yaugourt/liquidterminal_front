import type { Metadata } from "next";
import { Hip4SubNav } from "@/components/hip4/Hip4SubNav";
import { generateMetadata as genMeta, seoConfig } from "@/lib/seo";

export const metadata: Metadata = genMeta(seoConfig.hip4);

/** HIP-4 HTML is semi-static; refresh occasionally in production */
export const revalidate = 300;

export default function Hip4Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Interim: synced CSS from hip4_docs — full React port replaces this */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/hip4/main.css" />
      <div className="hip4-docs-root mx-auto w-full max-w-[1200px] px-4 pb-16 lg:px-6">
        <p className="mb-4 mt-1 text-xs text-zinc-500">
          HIP-4 testnet · Exploratory documentation — not official Hyperliquid
          documentation.
        </p>
        <Hip4SubNav />
        {children}
      </div>
    </>
  );
}
