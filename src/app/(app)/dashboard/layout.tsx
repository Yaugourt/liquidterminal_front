import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { PageHeader } from "@/components/common";
import { DashboardScopeBar } from "@/components/dashboard/DashboardScopeBar";

export const metadata: Metadata = generateMetadata(seoConfig.dashboard);

/**
 * Dashboard shell — header + scope bar, shared by the four scopes
 * (Overview · Market · Capital · Ecosystem). Each scope route owns its own
 * metadata through its nested layout.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        titleQualifier="the Hyperliquid ecosystem at a glance"
        description="Market, capital and ecosystem, each in its own scope."
      />
      <DashboardScopeBar />
      {children}
    </div>
  );
}
