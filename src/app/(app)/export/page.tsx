"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/common";
import { ExportWorkbench } from "@/components/export/ExportWorkbench";

/**
 * /export — the parameterised CSV workbench.
 *
 * Suspense boundary: ExportWorkbench reads `?dataset=` through useSearchParams,
 * which opts a route out of static rendering unless it sits under one.
 */
export default function ExportPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Export"
        titleQualifier="Hyperliquid data as CSV"
        description="Pick a dataset, shape the query, download it. Previews are free."
      />
      <Suspense
        fallback={<p className="text-[12px] text-text-tertiary">Loading datasets…</p>}
      >
        <ExportWorkbench />
      </Suspense>
    </div>
  );
}
