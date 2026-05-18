"use client";

import { memo } from "react";
import { Boxes } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { TokenIcon } from "@/components/common";
import { useProjects } from "@/services/ecosystem/project/hooks/useProjects";
import { useCategories } from "@/services/ecosystem/project/hooks/useCategories";
import { usePublicGoods } from "@/services/ecosystem/publicgood/hooks/usePublicGoods";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** EcosystemModule — résumé de /ecosystem sur le Dashboard. */
export const EcosystemModule = memo(function EcosystemModule() {
  const { projects, isLoading, pagination } = useProjects({ sort: "createdAt", order: "desc", limit: 3 });
  const { categories } = useCategories();
  const { pagination: pgPagination } = usePublicGoods({ status: "approved" });
  const { format } = useNumberFormat();

  const count = (n?: number) =>
    n != null ? formatNumber(n, format, { maximumFractionDigits: 0 }) : "—";

  return (
    <OverviewModule
      title="Ecosystem"
      icon={Boxes}
      href="/ecosystem/project"
      isLoading={isLoading}
      stats={[
        { label: "Projects", value: count(pagination?.total) },
        { label: "Categories", value: count(categories.length) },
        { label: "Public Goods", value: count(pgPagination?.total) },
      ]}
    >
      <ModuleSubhead>Recent projects</ModuleSubhead>
      {projects.slice(0, 3).map((p) => (
        <ModuleRow
          key={p.id}
          left={
            <>
              <TokenIcon src={p.logo} name={p.title} size="sm" />
              <span className="font-medium text-text-primary truncate">{p.title}</span>
            </>
          }
          right={
            p.categories && p.categories.length > 0 ? (
              <span className="text-text-tertiary text-[11px]">
                {p.categories[0].name}
              </span>
            ) : null
          }
        />
      ))}
    </OverviewModule>
  );
});
