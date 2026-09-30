"use client";

import { Suspense } from "react";
import { ElysiumSimulator } from "@/components/elysium/ElysiumSimulator";

// useSearchParams (shareable simulations) needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ElysiumSimulator />
    </Suspense>
  );
}
