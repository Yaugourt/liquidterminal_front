"use client";

import { Suspense } from "react";
import { ElysiumBridgeAnalyticsView } from "@/components/elysium/ElysiumBridgeAnalyticsView";

// useSearchParams (shareable ?track= lookups) needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ElysiumBridgeAnalyticsView />
    </Suspense>
  );
}
