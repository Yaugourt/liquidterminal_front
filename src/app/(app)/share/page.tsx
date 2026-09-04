"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, Check, LayoutTemplate, Wand2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CUSTOM_METRICS, CUSTOM_MAX, SERIES_METRICS, CHART_STATS_MAX } from "@/lib/og/customCatalog";

/**
 * Share studio — a preview-first composer. The tile is the hero of the page:
 * a large live preview up top, a template gallery or a custom builder below.
 * Every option maps to a `/api/tile/*` route; "Build your own" drives
 * `/api/tile/custom` so a visitor chooses the layout, the data and where it goes.
 */

interface TileParam {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}
interface TileDef {
  id: string;
  label: string;
  desc: string;
  route: string;
  params?: TileParam[];
}
interface TileGroup {
  title: string;
  tiles: TileDef[];
}

const GROUPS: TileGroup[] = [
  {
    title: "Protocol moats",
    tiles: [
      { id: "positioning", label: "Smart money positioning", desc: "Net long/short of the top traders", route: "positioning" },
      {
        id: "metric",
        label: "Growth trend",
        desc: "Self-sampled OI, users or fees over time",
        route: "metric",
        params: [
          {
            key: "metric",
            label: "Metric",
            options: [
              { value: "total_oi", label: "Open interest" },
              { value: "active_users_24h", label: "Active users" },
              { value: "total_fees_24h", label: "Protocol fees" },
            ],
          },
        ],
      },
      { id: "hip3", label: "HIP-3 ecosystem", desc: "Builder-deployed perp DEXs", route: "hip3" },
    ],
  },
  {
    title: "Money shots",
    tiles: [
      { id: "biggest-trade", label: "Biggest closed trades", desc: "Largest realized win and loss", route: "biggest-trade" },
      { id: "liquidations", label: "Liquidations", desc: "24h flush, long vs short", route: "liquidations" },
    ],
  },
  {
    title: "Market snapshots",
    tiles: [
      { id: "market-pulse", label: "Market pulse", desc: "24h volume, traders, fees, OI", route: "market-pulse" },
      { id: "hype", label: "HYPE price", desc: "Spot price and fundamentals", route: "hype" },
      { id: "volume-10d", label: "Market volume", desc: "Daily traded volume", route: "volume-10d" },
    ],
  },
  {
    title: "Fundamentals",
    tiles: [
      {
        id: "revenue",
        label: "Protocol revenue",
        desc: "Fee revenue by source",
        route: "revenue",
        params: [
          {
            key: "window",
            label: "Window",
            options: [
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
              { value: "1y", label: "1y" },
              { value: "all", label: "All" },
            ],
          },
        ],
      },
      { id: "validators", label: "Validators", desc: "Staking decentralization", route: "validators" },
      { id: "stablecoins", label: "Stablecoins", desc: "Stablecoin supply", route: "stablecoins" },
    ],
  },
];

const ALL_TILES = GROUPS.flatMap((g) => g.tiles);

const CUSTOM_BY_GROUP = CUSTOM_METRICS.reduce<Record<string, typeof CUSTOM_METRICS>>((acc, m) => {
  (acc[m.group] ??= []).push(m);
  return acc;
}, {});

function defaultParams(tile: TileDef): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of tile.params ?? []) out[p.key] = p.options[0].value;
  return out;
}

export default function SharePage() {
  const [mode, setMode] = useState<"templates" | "build">("templates");
  const [selectedId, setSelectedId] = useState<string>(ALL_TILES[0].id);
  const [params, setParams] = useState<Record<string, Record<string, string>>>(() => {
    const seed: Record<string, Record<string, string>> = {};
    for (const t of ALL_TILES) seed[t.id] = defaultParams(t);
    return seed;
  });
  const [customTitle, setCustomTitle] = useState("Hyperliquid snapshot");
  const [debouncedTitle, setDebouncedTitle] = useState(customTitle);
  const [customLayout, setCustomLayout] = useState<"grid" | "chart">("grid");
  const [customChart, setCustomChart] = useState<string>("total_oi");
  const [customMetrics, setCustomMetrics] = useState<string[]>(["volume_24h", "open_interest", "active_users", "fees_24h"]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedTitle(customTitle), 400);
    return () => window.clearTimeout(id);
  }, [customTitle]);

  const isCustom = mode === "build";
  const tile = useMemo(() => ALL_TILES.find((t) => t.id === selectedId) ?? null, [selectedId]);
  const tileParams = useMemo(() => (tile ? params[tile.id] ?? {} : {}), [params, tile]);
  const metricCap = customLayout === "chart" ? CHART_STATS_MAX : CUSTOM_MAX;

  /** Route for a template using its default params (for the gallery thumbnails). */
  const thumbSrc = (t: TileDef) => {
    const qs = new URLSearchParams(defaultParams(t)).toString();
    return `/api/tile/${t.route}${qs ? `?${qs}` : ""}`;
  };

  const previewSrc = useMemo(() => {
    if (isCustom) {
      const qs = new URLSearchParams(
        customLayout === "chart"
          ? { layout: "chart", title: debouncedTitle, chart: customChart, metrics: customMetrics.slice(0, CHART_STATS_MAX).join(",") }
          : { layout: "grid", title: debouncedTitle, metrics: customMetrics.join(",") }
      ).toString();
      return `/api/tile/custom?${qs}`;
    }
    if (!tile) return "";
    const qs = new URLSearchParams(tileParams).toString();
    return `/api/tile/${tile.route}${qs ? `?${qs}` : ""}`;
  }, [isCustom, customLayout, debouncedTitle, customChart, customMetrics, tile, tileParams]);

  const filename = useMemo(() => {
    if (isCustom) return "liquid-terminal-custom";
    if (!tile) return "liquid-terminal";
    return `liquid-terminal-${tile.route}${Object.values(tileParams).map((v) => `-${v}`).join("")}`;
  }, [isCustom, tile, tileParams]);

  const headerTitle = isCustom ? debouncedTitle || "Custom tile" : tile?.label ?? "";

  const setParam = (key: string, value: string) =>
    tile && setParams((prev) => ({ ...prev, [tile.id]: { ...prev[tile.id], [key]: value } }));
  const toggleMetric = (key: string) =>
    setCustomMetrics((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= metricCap) return prev;
      return [...prev, key];
    });
  const promoteMetric = (key: string) =>
    setCustomMetrics((prev) => (prev.includes(key) ? [key, ...prev.filter((k) => k !== key)] : prev));
  const labelOf = (key: string) => CUSTOM_METRICS.find((m) => m.key === key)?.label ?? key;

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(previewSrc);
      if (!res.ok) throw new Error(`tile route returned ${res.status}`);
      const blob = await res.blob();
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Image copied — paste it in your post");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        download(blob);
        toast.success("Image downloaded");
      }
    } catch {
      toast.error("Could not render the image");
    } finally {
      setBusy(false);
    }
  };
  const saveFile = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(previewSrc);
      if (!res.ok) throw new Error(`tile route returned ${res.status}`);
      download(await res.blob());
    } catch {
      toast.error("Could not render the image");
    } finally {
      setBusy(false);
    }
  };

  const actionBtn = "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50";

  return (
    <div className="space-y-5">
      {/* header + mode switch */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.01em]">Share studio</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Turn any Hyperliquid metric into a branded, post-ready image.</p>
        </div>
        <div className="inline-flex rounded-lg bg-surface-2 border border-border-subtle p-0.5 self-start">
          <button
            type="button"
            onClick={() => setMode("templates")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              mode === "templates" ? "bg-brand text-brand-text-on" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LayoutTemplate size={13} /> Templates
          </button>
          <button
            type="button"
            onClick={() => setMode("build")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
              mode === "build" ? "bg-brand text-brand-text-on" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Wand2 size={13} /> Build your own
          </button>
        </div>
      </div>

      {/* preview stage — the tile is the hero */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
          <h3 className="text-[13px] font-semibold text-text-primary truncate">{headerTitle}</h3>
          <span className="ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
            1200 × 630
          </span>
        </div>
        <div className="flex items-center justify-center p-5 bg-base/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={`${headerTitle} share tile`}
            width={1200}
            height={630}
            className="w-full max-w-[860px] h-auto rounded-xl border border-border-subtle shadow-2xl"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 px-3.5 py-3 border-t border-border-subtle">
          {!isCustom &&
            tile?.params?.map((p) => (
              <div key={p.key} className="flex items-center gap-2">
                <span className="text-[11px] text-text-tertiary">{p.label}</span>
                <PillTabs
                  tabs={p.options.map((o) => ({ value: o.value, label: o.label }))}
                  activeTab={tileParams[p.key]}
                  onTabChange={(v) => setParam(p.key, v)}
                />
              </div>
            ))}
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={copy} disabled={busy} className={`${actionBtn} bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20`}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy image"}
            </button>
            <button type="button" onClick={saveFile} disabled={busy} className={`${actionBtn} bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle`}>
              <Download size={13} /> Download
            </button>
            <a href={previewSrc} target="_blank" rel="noopener noreferrer" className={`${actionBtn} bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle`}>
              <ExternalLink size={13} /> Open
            </a>
          </div>
        </div>
      </Card>

      {/* selector: template gallery or custom builder */}
      {mode === "templates" ? (
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">{group.title}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {group.tiles.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`text-left rounded-lg overflow-hidden border transition-colors ${
                        active ? "border-brand ring-1 ring-brand/40" : "border-border-subtle hover:border-border-default"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbSrc(t)}
                        alt={t.label}
                        width={1200}
                        height={630}
                        loading="lazy"
                        className="w-full h-auto bg-base"
                      />
                      <div className="px-3 py-2 bg-surface">
                        <div className={`text-[12.5px] font-medium ${active ? "text-brand" : "text-text-primary"}`}>{t.label}</div>
                        <div className="text-[11px] text-text-tertiary leading-snug">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="px-3.5 py-3 space-y-3">
            {/* layout */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-tertiary shrink-0 w-16">Layout</span>
              <PillTabs
                tabs={[
                  { value: "grid", label: "Stat grid" },
                  { value: "chart", label: "Chart" },
                ]}
                activeTab={customLayout}
                onTabChange={(v) => setCustomLayout(v as "grid" | "chart")}
              />
            </div>

            {/* title */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-tertiary shrink-0 w-16">Title</span>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                maxLength={48}
                placeholder="Hyperliquid snapshot"
                className="flex-1 h-8 rounded-md bg-surface-2 border border-border-subtle px-2.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50"
              />
            </div>

            {/* chart series */}
            {customLayout === "chart" ? (
              <div className="flex items-start gap-2">
                <span className="text-[11px] text-text-tertiary shrink-0 w-16 pt-1.5">Series</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SERIES_METRICS.map((s) => {
                    const on = customChart === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setCustomChart(s.key)}
                        className={`rounded-md px-2 py-1 text-[11px] font-medium border transition-colors ${
                          on ? "bg-brand/10 text-brand border-brand/25" : "bg-surface-2 text-text-secondary border-border-subtle hover:text-text-primary"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* selected, in order: first is the headline (grid) */}
            <div className="flex items-start gap-2">
              <span className="text-[11px] text-text-tertiary shrink-0 w-16 pt-1.5">
                {customLayout === "chart" ? "Stats" : "On tile"}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {customMetrics.length === 0 ? (
                  <span className="text-[11px] text-text-tertiary pt-1">Pick metrics below</span>
                ) : (
                  customMetrics.map((k, i) => (
                    <div key={k} className="flex items-center gap-1.5 rounded-md bg-brand/10 border border-brand/25 pl-2 pr-1 py-1">
                      {customLayout === "grid" && i === 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-brand">
                          <Star size={10} className="fill-brand" /> Headline
                        </span>
                      ) : customLayout === "grid" ? (
                        <button type="button" onClick={() => promoteMetric(k)} title="Set as headline" className="text-text-tertiary hover:text-brand">
                          <Star size={11} />
                        </button>
                      ) : null}
                      <span className="text-[11px] text-text-primary">{labelOf(k)}</span>
                      <button type="button" onClick={() => toggleMetric(k)} title="Remove" className="text-text-tertiary hover:text-danger">
                        <X size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* add a metric */}
            <div className="space-y-2 pt-1 border-t border-border-subtle">
              <div className="text-[11px] text-text-tertiary pt-2">
                {customLayout === "chart"
                  ? `Add a supporting stat (${Math.min(customMetrics.length, CHART_STATS_MAX)}/${CHART_STATS_MAX})`
                  : `Add a metric (${customMetrics.length}/${CUSTOM_MAX}) — star sets the headline`}
              </div>
              {Object.entries(CUSTOM_BY_GROUP).map(([groupName, metrics]) => (
                <div key={groupName} className="flex flex-wrap items-center gap-1.5">
                  {metrics.map((m) => {
                    const on = customMetrics.includes(m.key);
                    const capped = !on && customMetrics.length >= metricCap;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => toggleMetric(m.key)}
                        disabled={capped}
                        className={`rounded-md px-2 py-1 text-[11px] font-medium border transition-colors ${
                          on
                            ? "bg-brand/10 text-brand border-brand/25"
                            : capped
                              ? "bg-surface-2 text-text-tertiary/50 border-border-subtle cursor-not-allowed"
                              : "bg-surface-2 text-text-secondary border-border-subtle hover:text-text-primary"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
