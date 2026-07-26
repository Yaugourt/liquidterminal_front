"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { useAuthContext } from "@/contexts/auth.context";
import {
  useExportCatalog,
  useExportQuota,
  useExportPreview,
  runExport,
  readExportError,
  type ExportDataset,
  type ExportParamSpec,
  type ExportParamValues,
} from "@/services/export";

const GROUP_ORDER = ["Trading", "Chain", "Markets", "Capital", "Ecosystem"] as const;

/** Presets sit on top of the raw start/end fields rather than replacing them. */
const WINDOW_PRESETS: Array<{ label: string; hours: number | null }> = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
  { label: "Custom", hours: null },
];

function isoNow(): string {
  return new Date().toISOString();
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

/** `datetime-local` wants `YYYY-MM-DDTHH:mm`, the API wants a full ISO string. */
function toLocalInput(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function fromLocalInput(value: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

/**
 * Rough wall-clock for the download, from the measured ~1.5s per 500-row page.
 * Vague on purpose: it exists so a two-minute wait does not read as a hang.
 */
function estimateDuration(totalCount: number | null | undefined, maxRows?: number): string {
  const cap = maxRows ?? 50_000;
  const rows = Math.min(totalCount ?? cap, cap);
  const seconds = Math.ceil((rows / 500) * 1.5);
  if (seconds < 20) return "a few seconds";
  if (seconds < 90) return `~${Math.ceil(seconds / 10) * 10}s`;
  return `~${Math.ceil(seconds / 60)} min`;
}

function formatReset(seconds: number): string {
  if (seconds <= 0) return "shortly";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${Math.max(1, minutes)}m`;
}

/**
 * The /export workbench: pick a dataset, shape the query, see what you get.
 *
 * Everything visible is generated from the catalog the backend validates
 * against, so a dataset added there appears here without a UI change and no
 * form can offer a parameter the server would reject.
 */
export function ExportWorkbench() {
  const searchParams = useSearchParams();
  const { authenticated } = useAuthContext();
  const { datasets, catalog, isLoading: catalogLoading } = useExportCatalog();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [values, setValues] = useState<ExportParamValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Deep link from a card's "More options", then the first dataset as fallback.
  useEffect(() => {
    if (selectedId || datasets.length === 0) return;
    const requested = searchParams.get("dataset");
    const match = requested && datasets.some((d) => d.id === requested) ? requested : datasets[0].id;
    setSelectedId(match);
  }, [datasets, searchParams, selectedId]);

  const dataset = useMemo(
    () => datasets.find((d) => d.id === selectedId),
    [datasets, selectedId]
  );

  const { quota, refetch: refetchQuota } = useExportQuota(authenticated);
  const { preview, isLoading: previewLoading, error: previewError } = useExportPreview(
    dataset,
    values,
    authenticated
  );

  // Columns follow the preview until the user overrides them.
  const availableColumns = preview?.columns ?? [];
  const activeColumns = selectedColumns ?? availableColumns;

  const grouped = useMemo(() => {
    const map = new Map<string, ExportDataset[]>();
    for (const d of datasets) {
      const list = map.get(d.group) ?? [];
      list.push(d);
      map.set(d.group, list);
    }
    return GROUP_ORDER.map((group) => ({ group, items: map.get(group) ?? [] })).filter(
      (g) => g.items.length > 0
    );
  }, [datasets]);

  const missingRequired = useMemo(
    () => dataset?.params.filter((p) => p.required && !values[p.key]?.trim()) ?? [],
    [dataset, values]
  );

  const exhausted = quota != null && quota.remaining <= 0;
  const canExport =
    authenticated && !!dataset && !running && !exhausted && missingRequired.length === 0;

  const selectDataset = (id: string) => {
    setSelectedId(id);
    // Params are per-dataset; carrying them over would send a coin filter to a
    // dataset that has no coin.
    setValues({});
    setSelectedColumns(null);
    setMessage(null);
    setFailed(false);
  };

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSelectedColumns(null);
  };

  const applyPreset = (hours: number | null) => {
    if (hours === null) return;
    setValues((prev) => ({ ...prev, start_time: isoHoursAgo(hours), end_time: isoNow() }));
    setSelectedColumns(null);
  };

  const toggleColumn = (key: string) => {
    const current = activeColumns;
    const next = current.includes(key)
      ? current.filter((c) => c !== key)
      : [...availableColumns.filter((c) => current.includes(c) || c === key)];
    setSelectedColumns(next);
  };

  const handleExport = async () => {
    if (!dataset || !canExport) return;
    setRunning(true);
    setMessage(null);
    setFailed(false);
    try {
      const columns =
        selectedColumns && selectedColumns.length > 0 && selectedColumns.length < availableColumns.length
          ? selectedColumns
          : undefined;
      const result = await runExport(dataset.id, values, columns);
      setMessage(`${result.fileName} · ${(result.size / 1024).toFixed(0)} KB`);
      await refetchQuota();
    } catch (error) {
      setMessage(await readExportError(error));
      setFailed(true);
    } finally {
      setRunning(false);
    }
  };

  const hasTimeWindow = dataset?.params.some((p) => p.key === "start_time") ?? false;
  const otherParams = dataset?.params.filter((p) => !p.key.endsWith("_time")) ?? [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)] gap-4 items-start">
      {/* Dataset picker */}
      <div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
        <div className="flex items-baseline gap-2 px-3.5 py-2.5 border-b border-border-subtle">
          <h3 className="text-[13px] font-semibold text-text-primary">Dataset</h3>
          <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">
            {datasets.length || "…"}
          </span>
        </div>
        <div className="px-2 py-2 space-y-3 max-h-[70vh] overflow-y-auto">
          {catalogLoading && datasets.length === 0 && (
            <p className="px-1.5 py-2 text-[12px] text-text-tertiary">…</p>
          )}
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <div className="px-1.5 pb-1 text-[9.5px] uppercase tracking-[0.1em] text-text-tertiary">
                {group}
              </div>
              {items.map((item) => {
                const active = item.id === selectedId;
                const timed = item.params.some((p) => p.key === "start_time");
                return (
                  <button
                    key={item.id}
                    onClick={() => selectDataset(item.id)}
                    className={`w-full text-left px-1.5 py-1.5 rounded-md text-[12.5px] flex items-center gap-2 transition-colors ${
                      active
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-text-tertiary hover:text-text-primary hover:bg-surface-2"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {timed && (
                      <span
                        className={`mono text-[10px] ml-auto shrink-0 ${active ? "text-brand/70" : "text-text-tertiary"}`}
                      >
                        time
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="px-3.5 py-2.5 border-t border-border-subtle">
          <span className="mono text-[10px] text-text-tertiary">time</span>
          <span className="text-[10.5px] text-text-tertiary"> = accepts a date window</span>
        </div>
      </div>

      <div className="min-w-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-4 items-start">
      {/* Parameters + preview */}
      <div className="min-w-0 space-y-4">
        <div className="bg-surface border border-border-subtle rounded-lg">
          <div className="flex flex-wrap items-baseline gap-2 px-3.5 py-2.5 border-b border-border-subtle">
            <h3 className="text-[13px] font-semibold text-text-primary">
              {dataset?.label ?? "…"}
            </h3>
            <span className="text-[11px] text-text-tertiary">{dataset?.description}</span>
            <span className="ml-auto shrink-0 mono text-[10.5px] text-text-tertiary">
              {dataset?.publicPath}
            </span>
          </div>

          <div className="px-3.5 py-3.5 space-y-4">
            {hasTimeWindow && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                    Time window
                  </div>
                  <span className="text-[10.5px] text-text-tertiary ml-auto">UTC</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {WINDOW_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset.hours)}
                      className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["start_time", "end_time"].map((key) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10.5px] text-text-tertiary">
                        {key === "start_time" ? "From" : "To"}
                      </label>
                      <input
                        type="datetime-local"
                        value={toLocalInput(values[key] ?? "")}
                        onChange={(e) => setValue(key, fromLocalInput(e.target.value))}
                        className="w-full px-3 h-8 text-[12.5px] mono bg-transparent border border-border-subtle rounded-md text-text-primary focus:outline-none focus:border-brand/50"
                      />
                    </div>
                  ))}
                </div>
                {values.end_time && !values.start_time && (
                  <p className="text-[11px] text-gold">
                    An end date without a start date makes the upstream query scan the whole
                    history and time out. Set a start date.
                  </p>
                )}
              </div>
            )}

            {otherParams.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                  Filters
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {otherParams.map((param) => (
                    <ParamField
                      key={param.key}
                      param={param}
                      value={values[param.key] ?? ""}
                      onChange={(v) => setValue(param.key, v)}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableColumns.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                    Columns
                  </div>
                  <button
                    onClick={() => setSelectedColumns(null)}
                    className="ml-auto text-[10.5px] text-text-tertiary hover:text-brand transition-colors"
                  >
                    Select all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableColumns.map((column) => {
                    const on = activeColumns.includes(column);
                    return (
                      <button
                        key={column}
                        onClick={() => toggleColumn(column)}
                        className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                          on
                            ? "bg-brand/10 border-brand/30 text-brand"
                            : "bg-surface-2 border-border-subtle text-text-tertiary hover:text-text-primary"
                        }`}
                      >
                        {column}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-baseline gap-2 px-3.5 py-2.5 border-b border-border-subtle">
            <h3 className="text-[13px] font-semibold text-text-primary">Preview</h3>
            <span className="text-[11px] text-text-tertiary">
              first rows · free, does not spend your export
            </span>
          </div>

          {!authenticated ? (
            <p className="px-3.5 py-6 text-[12px] text-text-secondary">
              Connect to preview and export.
            </p>
          ) : missingRequired.length > 0 ? (
            <p className="px-3.5 py-6 text-[12px] text-text-secondary">
              Fill {missingRequired.map((p) => p.label).join(", ")} to preview this dataset.
            </p>
          ) : previewError ? (
            <p className="px-3.5 py-6 text-[12px] text-danger">{previewError.message}</p>
          ) : previewLoading && !preview ? (
            <p className="px-3.5 py-6 text-[12px] text-text-tertiary">…</p>
          ) : !preview || preview.rows.length === 0 ? (
            <p className="px-3.5 py-6 text-[12px] text-text-secondary">
              No rows match this query.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {activeColumns.map((column) => (
                      <th
                        key={column}
                        className="px-4 py-2.5 text-[10px] uppercase tracking-[0.08em] font-medium text-text-tertiary border-b border-border-subtle text-left whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="mono text-[11.5px]">
                  {preview.rows.map((row, index) => (
                    <tr key={index} className="border-b border-border-subtle last:border-b-0">
                      {activeColumns.map((column) => (
                        <td
                          key={column}
                          className="px-4 py-2 text-text-secondary whitespace-nowrap max-w-[240px] truncate"
                        >
                          {formatCell(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary rail */}
      <div className="space-y-4">
        <div className="bg-surface border border-border-subtle rounded-lg flex flex-col">
          <div className="flex items-baseline gap-2 px-3.5 py-2.5 border-b border-border-subtle">
            <h3 className="text-[13px] font-semibold text-text-primary">Your export</h3>
          </div>
          <div className="px-3.5 py-3 space-y-3">
            <SummaryRow
              label="Rows upstream"
              value={
                preview?.totalCount != null
                  ? preview.totalCount.toLocaleString("en-US")
                  : "not reported"
              }
            />
            <SummaryRow
              label="Row cap"
              value={(dataset?.maxRows ?? catalog?.limits.maxRows ?? 0).toLocaleString("en-US")}
            />
            <SummaryRow label="Est. time" value={estimateDuration(preview?.totalCount, dataset?.maxRows)} />
            <SummaryRow
              label="Columns"
              value={
                availableColumns.length > 0
                  ? `${activeColumns.length} / ${availableColumns.length}`
                  : "—"
              }
            />
            {message && (
              <p className={`text-[11.5px] break-all ${failed ? "text-danger" : "text-success"}`}>
                {message}
              </p>
            )}
          </div>
          <div className="px-3.5 py-2.5 border-t border-border-subtle space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-tertiary">Exports left</span>
              <span className="ml-auto mono text-[12.5px] font-medium text-brand">
                {quota ? `${quota.remaining} / ${quota.limit}` : "—"}
              </span>
            </div>
            <Button
              className="w-full h-9 gap-1.5 text-xs font-semibold"
              onClick={handleExport}
              disabled={!canExport}
            >
              {running ? (
                <InlineSpinner className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {running ? "Building your file…" : "Export CSV"}
            </Button>
            {running ? (
              <p className="text-[10.5px] text-text-tertiary text-center leading-relaxed">
                The server is paging the source and streaming the rows. A large
                window takes a minute or two — leave this tab open, the download
                starts on its own.
              </p>
            ) : (
              <p className="text-[10.5px] text-text-tertiary text-center">
                {exhausted && quota
                  ? `Resets in ${formatReset(quota.resetInSeconds)}.`
                  : "Only a completed download counts against your quota."}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11.5px] text-text-secondary">{label}</span>
      <span className="mono text-[12.5px] text-text-primary">{value}</span>
    </div>
  );
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: ExportParamSpec;
  value: string;
  onChange: (value: string) => void;
}) {
  if (param.type === "enum" && param.options) {
    return (
      <div className="space-y-1">
        <label className="text-[10.5px] text-text-tertiary">
          {param.label}
          {param.required && <span className="text-gold ml-1">*</span>}
        </label>
        <div className="flex items-center gap-3 h-8 text-xs">
          <button
            onClick={() => onChange("")}
            className={value === "" ? "text-brand font-medium" : "text-text-tertiary hover:text-text-primary"}
          >
            All
          </button>
          {param.options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={
                value === option
                  ? "text-brand font-medium"
                  : "text-text-tertiary hover:text-text-primary"
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-[10.5px] text-text-tertiary">
        {param.label}
        {param.required && <span className="text-gold ml-1">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={param.placeholder}
        inputMode={param.type === "number" ? "numeric" : undefined}
        title={param.help}
        className="w-full px-3 h-8 text-[12.5px] mono bg-transparent border border-border-subtle rounded-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50"
      />
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}
