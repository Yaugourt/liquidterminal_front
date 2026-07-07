"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader } from "@/components/common";
import { Breadcrumb } from "@/components/wiki/primitives";
import { ContributionsPanel } from "@/components/wiki/ContributionsPanel";
import { UserSubmissionModal } from "@/components/wiki/UserSubmissionModal";

export default function WikiContributionsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wiki");
  }, [setTitle]);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Wiki", href: "/wiki" }, { label: "Contributions" }]} />

      <PageHeader
        title="Contributions"
        description="Suggest content and track your submissions."
        actions={<UserSubmissionModal />}
      />

      <ContributionsPanel />
    </div>
  );
}
