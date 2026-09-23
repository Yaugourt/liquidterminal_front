"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Copy, Download, ExternalLink, Check, Wand2, Star, X,
  Users, TrendingUp, Layers, Trophy, Zap, Activity, Droplet, BarChart3,
  DollarSign, ShieldCheck, Landmark, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CUSTOM_METRICS, CUSTOM_MAX, SERIES_METRICS, CHART_STATS_MAX } from "@/lib/og/customCatalog";

/**
 * Share studio — a focused composer. One screen: a compact picker rail on the
 * left, the tile you will post shown large on the right. Every entry maps to a
 * `/api/tile/*` route; the last rail entry, "Build your own", drives
 * `/api/tile/custom` and reveals the layout/metric controls under the preview.
 * The rail lists templates by name (not by full render) so the page stays light
 * and the single big preview never shows a stale tile between swaps.
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
  icon: LucideIcon;
  params?: TileParam[];
}
interface TileGroup {
  title: string;
  tiles: TileDef[];
}

/** Sentinel selection for the "Build your own" composer entry. */
const BUILD_ID = "__build__";

const GROUPS: TileGroup[] = [
  {
    title: "Protocol moats",
    tiles: [
      { id: "positioning", label: "Smart money positioning", desc: "Net long/short of the top traders", route: "positioning", icon: Users },
      {
        id: "metric",
        label: "Growth trend",
        desc: "Self-sampled OI, users or fees over time",
        route: "metric",
        icon: TrendingUp,
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
      { id: "hip3", label: "HIP-3 ecosystem", desc: "Builder-deployed perp DEXs", route: "hip3", icon: Layers },
    ],
  },
  {
    title: "Money shots",
    tiles: [
      { id: "biggest-trade", label: "Biggest closed trades", desc: "Largest realized win and loss", route: "biggest-trade", icon: Trophy },
      { id: "liquidations", label: "Liquidations", desc: "24h flush, long vs short", route: "liquidations", icon: Zap },
    ],
  },
  {
    title: "Market snapshots",
    tiles: [
      { id: "market-pulse", label: "Market pulse", desc: "24h volume, traders, fees, OI", route: "market-pulse", icon: Activity },
      { id: "hype", label: "HYPE price", desc: "Spot price and fundamentals", route: "hype", icon: Droplet },
      { id: "volume-10d", label: "Market volume", desc: "Daily traded volume", route: "volume-10d", icon: BarChart3 },
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
        icon: DollarSign,
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
      { id: "validators", label: "Validators", desc: "Staking decentralization", route: "validators", icon: ShieldCheck },
      { id: "stablecoins", label: "Stablecoins", desc: "Stablecoin supply", route: "stablecoins", icon: Landmark },
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
  const [imgLoading, setImgLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedTitle(customTitle), 400);
    return () => window.clearTimeout(id);
  }, [customTitle]);

  const isCustom = selectedId === BUILD_ID;
  const tile = useMemo(() => ALL_TILES.find((t) => t.id === selectedId) ?? null, [selectedId]);
  const tileParams = useMemo(() => (tile ? params[tile.id] ?? {} : {}), [params, tile]);
  const metricCap = customLayout === "chart" ? CHART_STATS_MAX : CUSTOM_MAX;

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

  // Show the loading state on every swap so the big preview never lingers on the
  // previous tile while the new render streams in. Reconcile on the next frame:
  // the first (server-rendered) image can finish loading before React binds
  // onLoad, which would otherwise leave the spinner stuck on.
  useEffect(() => {
    setImgLoading(true);
    const id = requestAnimationFrame(() => {
      const im = imgRef.current;
      if (im && im.complete && im.naturalWidth > 0) setImgLoading(false);
    });
    return () => cancelAnimationFrame(id);
  }, [previewSrc]);

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

  /** One selectable row in the picker rail. */
  const RailRow = ({
    icon,
    label,
    desc,
    active,
    dashed,
    onClick,
  }: {
    icon: ReactNode;
    label: string;
    desc: string;
    active: boolean;
    dashed?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left border transition-colors ${
        active
          ? "bg-brand/10 border-brand/35"
          : dashed
            ? "border-dashed border-border-default hover:border-border-strong hover:bg-surface-2"
            : "border-transparent hover:bg-surface-2"
      }`}
    >
      <span
        className={`grid place-items-center w-6 h-6 rounded-md shrink-0 border ${
          active ? "border-brand/40 bg-brand/10 text-brand" : "border-border-subtle bg-surface-2 text-text-tertiary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className={`block text-[12px] font-medium leading-tight truncate ${active ? "text-brand" : "text-text-primary"}`}>
          {label}
        </span>
        <span className="block text-[10px] text-text-tertiary leading-tight truncate">{desc}</span>
      </span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* header */}
      <div>
        <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.01em]">Share studio</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">Turn any Hyperliquid metric into a branded, post-ready image.</p>
      </div>

      {/* composer: picker rail + preview stage */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
        {/* rail */}
        <div className="w-full lg:w-[236px] lg:shrink-0 lg:sticky lg:top-4">
          <Card className="p-2 space-y-2.5">
            {GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-text-tertiary">{group.title}</div>
                <div className="space-y-0.5">
                  {group.tiles.map((t) => {
                    const Icon = t.icon;
                    return (
                      <RailRow
                        key={t.id}
                        icon={<Icon size={13} />}
                        label={t.label}
                        desc={t.desc}
                        active={!isCustom && t.id === selectedId}
                        onClick={() => setSelectedId(t.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="pt-1 border-t border-border-subtle">
              <RailRow
                icon={<Wand2 size={13} />}
                label="Build your own"
                desc="Compose your own tile"
                active={isCustom}
                dashed
                onClick={() => setSelectedId(BUILD_ID)}
              />
            </div>
          </Card>
        </div>

        {/* stage — the tile is the hero */}
        <Card className="flex-1 min-w-0 overflow-hidden w-full">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
            <h3 className="text-[13px] font-semibold text-text-primary truncate">{headerTitle}</h3>
            <span className="ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
              1200 × 630
            </span>
          </div>
          <div className="flex items-center justify-center p-5 bg-base/40">
            <div className="relative w-full max-w-[900px]" style={{ aspectRatio: "1200 / 630" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={previewSrc}
                alt={`${headerTitle} share tile`}
                width={1200}
                height={630}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)}
                className={`w-full h-full rounded-xl border border-border-subtle shadow-2xl transition-opacity duration-200 ${
                  imgLoading ? "opacity-40" : "opacity-100"
                }`}
              />
              {imgLoading && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-base/30 backdrop-blur-[1px]">
                  <div className="w-7 h-7 rounded-full border-2 border-border-subtle border-t-brand animate-spin" aria-label="Rendering tile" />
                </div>
              )}
            </div>
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

          {/* custom builder — appears under the preview when "Build your own" is active */}
          {isCustom && (
            <div className="px-3.5 py-3 space-y-3 border-t border-border-subtle bg-surface-2/30">
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
          )}
        </Card>
      </div>
    </div>
  );
}
