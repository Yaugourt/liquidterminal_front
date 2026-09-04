"use client";

import { useMemo, useState } from "react";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";

/**
 * Share studio — pick any Hyperliquid metric and get it back as a branded,
 * post-ready image. Every option maps to a `/api/tile/*` route that renders the
 * figure as a self-contained Liquid Terminal card; this page lets a visitor
 * choose the data, preview the image, and copy or download it.
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
  /** Route name under /api/tile. */
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
      { id: "positioning", label: "Smart money positioning", desc: "Net long/short of the top-trader cohort", route: "positioning" },
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
      { id: "hip3", label: "HIP-3 ecosystem", desc: "Builder-deployed perp DEXs at a glance", route: "hip3" },
    ],
  },
  {
    title: "Money shots",
    tiles: [
      { id: "biggest-trade", label: "Biggest closed trades", desc: "Largest realized win and loss", route: "biggest-trade" },
      { id: "liquidations", label: "Liquidations", desc: "24h flush, long vs short split", route: "liquidations" },
    ],
  },
  {
    title: "Market snapshots",
    tiles: [
      { id: "market-pulse", label: "Market pulse", desc: "24h volume, traders, trades, fees, OI", route: "market-pulse" },
      { id: "hype", label: "HYPE price", desc: "Spot price and fundamentals", route: "hype" },
      { id: "volume-10d", label: "Market volume", desc: "Daily traded volume, trailing window", route: "volume-10d" },
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
      { id: "stablecoins", label: "Stablecoins", desc: "Stablecoin supply on Hyperliquid", route: "stablecoins" },
    ],
  },
];

const ALL_TILES = GROUPS.flatMap((g) => g.tiles);

/** Default params: first option of each param. */
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
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const tile = useMemo(() => ALL_TILES.find((t) => t.id === selectedId)!, [selectedId]);
  const tileParams = useMemo(() => params[tile.id] ?? {}, [params, tile.id]);

  const src = useMemo(() => {
    const qs = new URLSearchParams(tileParams).toString();
    return `/api/tile/${tile.route}${qs ? `?${qs}` : ""}`;
  }, [tile.route, tileParams]);

  const filename = useMemo(
    () => `liquid-terminal-${tile.route}${Object.values(tileParams).map((v) => `-${v}`).join("")}`,
    [tile.route, tileParams]
  );

  const setParam = (key: string, value: string) =>
    setParams((prev) => ({ ...prev, [tile.id]: { ...prev[tile.id], [key]: value } }));

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
      const res = await fetch(src);
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
      const res = await fetch(src);
      if (!res.ok) throw new Error(`tile route returned ${res.status}`);
      download(await res.blob());
    } catch {
      toast.error("Could not render the image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Share studio"
        description="Turn any Hyperliquid metric into a branded, post-ready image."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* picker */}
        <Card className="overflow-hidden">
          <div className="p-2 space-y-4">
            {GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  {group.title}
                </div>
                {group.tiles.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full text-left rounded-md px-2.5 py-2 transition-colors ${
                        active ? "bg-brand/10" : "hover:bg-surface-2"
                      }`}
                    >
                      <div
                        className={`text-[12.5px] font-medium ${
                          active ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {t.label}
                      </div>
                      <div className="text-[11px] text-text-tertiary leading-snug">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* preview + actions */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
              <h3 className="text-[13px] font-semibold text-text-primary">{tile.label}</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
                1200 × 630
              </span>
            </div>
            <div className="p-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${tile.label} share tile`}
                width={1200}
                height={630}
                className="w-full h-auto rounded-lg border border-border-subtle bg-base"
              />
            </div>
          </Card>

          {/* params + actions */}
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-4 px-3.5 py-3">
              {tile.params?.map((p) => (
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
                <button
                  type="button"
                  onClick={copy}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-md bg-brand/10 text-brand hover:bg-brand/20 px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy image"}
                </button>
                <button
                  type="button"
                  onClick={saveFile}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-md bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                  <Download size={13} /> Download
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle px-3 py-1.5 text-[12px] font-medium transition-colors"
                >
                  <ExternalLink size={13} /> Open
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
