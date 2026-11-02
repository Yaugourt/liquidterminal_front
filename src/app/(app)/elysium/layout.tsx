import { Suspense } from "react";
import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { ElysiumPageHeader } from "@/components/elysium/ElysiumPageHeader";

// Each Elysium page sets its own title and canonical in its layout (seoConfig.elysium*).
export const metadata: Metadata = generateMetadata(seoConfig.elysium);

/** Elysium section shell: header with an explicit testnet status, titled after the tool on tool pages. */
export default function ElysiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      {/* The header reads ?network= (useSearchParams), which needs a Suspense boundary. */}
      <Suspense>
        <ElysiumPageHeader />
      </Suspense>
      {children}
    </div>
  );
}
