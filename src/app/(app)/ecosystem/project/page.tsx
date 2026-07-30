"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, PageFaq, DataStatus } from "@/components/common";
import { ProjectsDirectory } from "@/components/ecosystem/project/ProjectsDirectory";
import { EcosystemBanner } from "@/components/ecosystem/project/EcosystemBanner";
import { useChainStats } from "@/services/ecosystem/project";
import { ECOSYSTEM_FAQ } from "@/lib/page-faqs";

export default function L1ProjectPage() {
  const { setTitle } = usePageTitle();
  const { stats, isRefreshing, refetch, dataUpdatedAt } = useChainStats();

  useEffect(() => {
    setTitle("Ecosystem Projects");
  }, [setTitle]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        titleQualifier="building on Hyperliquid"
        description="Apps building on Hyperliquid — live fundamentals via DefiLlama."
        actions={
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        }
      />
      <EcosystemBanner stats={stats} />
      <ProjectsDirectory />
      <PageFaq items={ECOSYSTEM_FAQ} />
    </div>
  );
}
