import { Suspense } from "react";
import { LandingViewport } from "@/components/landing/LandingViewport";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/components/JsonLd";

// Server component: the JSON-LD blocks render into the HTML only and ship no
// JS; the interactive landing is the <LandingViewport> client island.

function HomePageContent() {
  return <LandingViewport />;
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareApplicationSchema} />
      <JsonLd data={websiteSchema} />
      <Suspense
        fallback={
          <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-base">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand/30 border-t-brand" />
          </div>
        }
      >
        <HomePageContent />
      </Suspense>
    </>
  );
}
