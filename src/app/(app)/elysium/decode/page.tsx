"use client";

import { Suspense } from "react";
import { ElysiumDecode } from "@/components/elysium/ElysiumDecode";

// useSearchParams (shareable decodes) needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ElysiumDecode />
    </Suspense>
  );
}
