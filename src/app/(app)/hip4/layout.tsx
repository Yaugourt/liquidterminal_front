import type { Metadata } from "next";
import { Hip4SubNav } from "@/components/hip4/Hip4SubNav";
import { Hip4Breadcrumbs } from "@/components/hip4/Hip4Breadcrumbs";
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
      <div className="hip4-docs-root mx-auto w-full max-w-[1200px] px-4 pb-16 lg:px-6">
        <header className="pt-6 pb-5">
          <h1 className="font-inter text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <span className="text-gold">HIP-4</span>
            <span className="text-white"> documentation</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Exploratory documentation — not official Hyperliquid documentation.
          </p>
        </header>

        <div className="border-t border-gold/20 pt-6">
          <div className="lg:grid lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <aside className="mb-6 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
              <Hip4SubNav />
            </aside>

            <div className="min-w-0">
              <Hip4Breadcrumbs />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
