"use client";

import { memo } from "react";
import { BookOpen } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useEducationalResources } from "@/services/wiki/hooks/useEducationalResources";
import { useEducationalCategories } from "@/services/wiki";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** WikiModule — résumé de /wiki (ressources éducatives) sur le Dashboard. */
export const WikiModule = memo(function WikiModule() {
  const { resources, isLoading: resourcesLoading } = useEducationalResources();
  const { categories, isLoading: categoriesLoading } = useEducationalCategories();
  const { format } = useNumberFormat();

  const isLoading = resourcesLoading || categoriesLoading;

  return (
    <OverviewModule
      title="Wiki"
      icon={BookOpen}
      href="/wiki"
      isLoading={isLoading}
      stats={[
        {
          label: "Resources",
          value: formatNumber(resources.length, format, { maximumFractionDigits: 0 }),
        },
        {
          label: "Categories",
          value: formatNumber(categories.length, format, { maximumFractionDigits: 0 }),
        },
      ]}
    >
      <ModuleSubhead>Latest resources</ModuleSubhead>
      {resources.slice(0, 3).map((r) => {
        const category = r.categories[0]?.category.name;
        const hasUrl = !!r.url && r.url.startsWith("http");
        return (
          <ModuleRow
            key={r.id}
            href={hasUrl ? r.url : undefined}
            left={
              <span className="font-medium text-text-primary truncate">{r.url}</span>
            }
            right={
              category ? (
                <span className="text-text-tertiary text-[11px]">{category}</span>
              ) : null
            }
          />
        );
      })}
    </OverviewModule>
  );
});
