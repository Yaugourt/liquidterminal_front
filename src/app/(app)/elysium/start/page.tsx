"use client";

import { Suspense } from "react";
import { ElysiumStart } from "@/components/elysium/ElysiumStart";

// useSearchParams (the chosen path lives in ?track=) needs a Suspense boundary.
export default function Page() {
  return (
    <Suspense>
      <ElysiumStart />
    </Suspense>
  );
}
