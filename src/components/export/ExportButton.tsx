"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { useAuthContext } from "@/contexts/auth.context";
import {
  useExportCatalog,
  useExportQuota,
  useExportPreview,
  runExport,
  readExportError,
  estimateExportDuration,
  type ExportParamValues,
} from "@/services/export";

interface ExportButtonProps {
  /** Dataset id from the export catalog (e.g. "vault-summaries"). */
  datasetId: string;
  /**
   * Filters the card is already showing, pre-applied in the popover so the
   * export matches what the user is looking at.
   */
  presetValues?: ExportParamValues;
  /** Overrides the button label; omit for the icon-only card variant. */
  label?: string;
  className?: string;
}

function formatReset(seconds: number): string {
  if (seconds <= 0) return "shortly";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${Math.max(1, minutes)}m`;
}

/**
 * Card-level CSV export: an icon in the card head that opens a small popover
 * with the dataset already selected.
 *
 * It is a shortcut into the same server-side engine as /export, not a second
 * mechanism: the file is built and the quota counted in one place, so what you
 * download from a card and what you download from the page are identical.
 */
export const ExportButton = memo(function ExportButton({
  datasetId,
  presetValues,
  label,
  className,
}: ExportButtonProps) {
  const { authenticated } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const { datasets } = useExportCatalog();
  const dataset = useMemo(
    () => datasets.find((d) => d.id === datasetId),
    [datasets, datasetId]
  );

  // Only asked for once the popover is open: a card must not fire a quota
  // request just by being on screen.
  const { quota, refetch: refetchQuota } = useExportQuota(authenticated && open);
  const values = useMemo<ExportParamValues>(() => presetValues ?? {}, [presetValues]);
  const { preview, isLoading: previewLoading } = useExportPreview(
    dataset,
    values,
    authenticated && open
  );

  const exhausted = quota != null && quota.remaining <= 0;

  const handleExport = async () => {
    if (!dataset || running) return;
    setRunning(true);
    setMessage(null);
    setFailed(false);
    try {
      const result = await runExport(dataset.id, values);
      setMessage(`${result.fileName} · ${(result.size / 1024).toFixed(0)} KB`);
      await refetchQuota();
    } catch (error) {
      setMessage(await readExportError(error));
      setFailed(true);
      // The server refuses over capacity without spending the quota, so the
      // count has not moved — but a refetch keeps the display honest either way.
      await refetchQuota();
    } finally {
      setRunning(false);
    }
  };

  // A card whose dataset is not in the catalog renders nothing rather than a
  // button that would 404 on click.
  if (!dataset) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={`Export ${dataset.label} as CSV`}
          aria-label={`Export ${dataset.label} as CSV`}
          className={`shrink-0 inline-flex items-center gap-1 rounded-md text-text-tertiary hover:text-brand hover:bg-surface-2 transition-colors ${
            label ? "h-7 px-2 text-[11px] font-medium" : "w-6 h-6 justify-center"
          } ${className ?? ""}`}
        >
          <Download className="w-3.5 h-3.5" />
          {label}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[320px] p-0">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
          <span className="text-[12.5px] font-semibold text-text-primary truncate">
            Export · {dataset.label}
          </span>
        </div>

        {!authenticated ? (
          <div className="px-3.5 py-3.5 space-y-2">
            <p className="text-[12px] text-text-secondary">
              Exports are tied to your account so the quota can be counted.
            </p>
          </div>
        ) : (
          <div className="px-3.5 py-3 space-y-3">
            <p className="text-[11.5px] text-text-secondary">{dataset.description}</p>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11.5px] text-text-secondary">Columns</span>
              <span className="mono text-[12px] text-text-primary">
                {previewLoading && !preview ? "…" : (preview?.columns.length ?? "—")}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11.5px] text-text-secondary">Row cap</span>
              <span className="mono text-[12px] text-text-primary">
                {dataset.maxRows.toLocaleString("en-US")}
              </span>
            </div>
            {/* The card exports the whole dataset, so the wait is the same as
                the workbench's — saying so here is the only warning this entry
                point gets. */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11.5px] text-text-secondary">Est. time</span>
              <span className="mono text-[12px] text-text-primary">
                {estimateExportDuration(preview?.totalCount, dataset.maxRows)}
              </span>
            </div>

            <div className="rounded-md bg-surface-2 border border-border-subtle px-2.5 py-2">
              <div className="text-[9.5px] uppercase tracking-[0.08em] text-text-tertiary mb-1">
                Source
              </div>
              <div className="mono text-[10.5px] text-text-secondary break-all">
                {dataset.publicPath}
              </div>
            </div>

            {running && (
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                Paging the source and streaming the rows. Leave this tab open —
                the download starts on its own.
              </p>
            )}

            {message && (
              <p
                className={`text-[11.5px] ${failed ? "text-danger" : "text-success"} break-all`}
              >
                {message}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 px-3.5 py-2.5 border-t border-border-subtle min-h-[44px]">
          {authenticated && quota && (
            <span className="text-[11px] text-text-tertiary">
              {exhausted ? (
                <>resets in {formatReset(quota.resetInSeconds)}</>
              ) : (
                <>
                  <span className="mono text-text-secondary">{quota.remaining}</span> left
                  today
                </>
              )}
            </span>
          )}
          <Link
            href={`/export?dataset=${dataset.id}`}
            className="text-[11px] text-text-tertiary hover:text-brand transition-colors"
          >
            More options
          </Link>
          <Button
            size="sm"
            className="ml-auto h-8 gap-1.5 text-xs font-semibold"
            onClick={handleExport}
            disabled={!authenticated || running || exhausted}
          >
            {running ? (
              <InlineSpinner className="w-3 h-3" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            {running ? "Building…" : "Export"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
