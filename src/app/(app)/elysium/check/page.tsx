"use client";

import { Suspense } from "react";
import { ElysiumTokenCheck } from "@/components/elysium/ElysiumTokenCheck";

// useSearchParams (shareable checks) needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ElysiumTokenCheck />
    </Suspense>
  );
}
