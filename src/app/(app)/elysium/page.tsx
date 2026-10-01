"use client";

import { PageFaq } from "@/components/common";
import { ElysiumOverview } from "@/components/elysium/ElysiumOverview";
import { ELYSIUM_FAQ } from "@/lib/page-faqs";

export default function ElysiumPage() {
  return (
    <div className="space-y-5">
      <ElysiumOverview />
      <PageFaq items={ELYSIUM_FAQ} />
    </div>
  );
}
