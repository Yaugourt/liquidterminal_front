"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CardHeading, TokenAvatar } from "@/components/common";
import { useWallets } from "@/store/use-wallets";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { getTokenName } from "@/services/explorer/address/formatters";
import {
  useTrackedWalletFills,
  LIVE_WALLET_CAP,
  type TrackedFill,
} from "@/services/market/tracker/hooks/useTrackedWalletFills";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { cn } from "@/lib/utils";

const PREFS_KEY = "lt-live-wallet-alerts";
const TOAST_COOLDOWN_MS = 3_000;
/** A live fill keeps its "new" tag this long. */
const NEW_FOR_MS = 60_000;
const MIN_FILTERS = [
  { value: 0, label: "All" },
  { value: 10_000, label: "$10K+" },
  { value: 100_000, label: "$100K+" },
];

interface Prefs {
  popups: boolean;
  sound: boolean;
  min: number;
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { popups: true, sound: false, min: 0, ...JSON.parse(raw) };
  } catch {
    // Storage blocked: defaults below.
  }
  return { popups: true, sound: false, min: 0 };
}

/** Short two-tone chime, synthesized (no audio asset to load). */
function chime(buy: boolean) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = buy ? [660, 880] : [660, 495];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + i * 0.09 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.18);
    });
    setTimeout(() => void ctx.close(), 600);
  } catch {
    // Audio unavailable (autoplay policy, no device): stay silent.
  }
}

const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

/**
 * Live fills of every tracked wallet, in one feed, while this page is open.
 * Optional pop-up and sound on each new fill. Hyperliquid serves up to ten
 * wallets per browser over its websocket; Telegram list alerts have no such
 * cap and keep working with the page closed.
 */
export function LiveWalletActivity() {
  const wallets = useWallets((s) => s.wallets);
  const [prefs, setPrefs] = useState<Prefs>({ popups: true, sound: false, min: 0 });
  useEffect(() => setPrefs(readPrefs()), []);
  const updatePrefs = (patch: Partial<Prefs>) =>
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // Not persisted: still applies for this visit.
      }
      return next;
    });

  const labels = useMemo(() => {
    const m: Record<string, string> = {};
    for (const w of wallets) m[w.address.toLowerCase()] = w.name;
    return m;
  }, [wallets]);
  const addresses = useMemo(() => wallets.map((w) => w.address), [wallets]);

  const { data: spotTokens } = useSpotTokens({ limit: 300 });
  const coinName = useCallback(
    (coin: string) => (coin.startsWith("@") ? getTokenName(coin, spotTokens ?? undefined) : coin),
    [spotTokens]
  );

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  // A busy wallet (market maker) can fill several orders a second: pop up at
  // most once per TOAST_COOLDOWN_MS, showing the largest fill of the window
  // and how many came with it.
  const lastToastRef = useRef(0);
  const heldRef = useRef<TrackedFill[]>([]);
  const onLiveFill = useCallback(
    (batch: TrackedFill[]) => {
      const p = prefsRef.current;
      const shown = batch.filter((f) => f.ntl >= p.min);
      if (!shown.length) return;
      heldRef.current.push(...shown);
      const now = Date.now();
      if (now - lastToastRef.current < TOAST_COOLDOWN_MS) return;
      lastToastRef.current = now;
      const held = heldRef.current.splice(0, heldRef.current.length);
      const top = held.reduce((a, b) => (b.ntl > a.ntl ? b : a));
      if (p.sound) chime(top.side === "B");
      if (!p.popups) return;
      const who = labels[top.wallet] || shortAddr(top.wallet);
      const pnl = top.closedPnl
        ? `, PnL ${top.closedPnl > 0 ? "+" : "-"}${compactUsd(Math.abs(top.closedPnl), { fallback: "-" })}`
        : "";
      const more = held.length > 1 ? ` · +${held.length - 1} more fill${held.length > 2 ? "s" : ""}` : "";
      toast(`${who}: ${top.dir} ${coinName(top.coin)}`, {
        description: `${compactUsd(top.ntl, { fallback: "-" })} at ${top.px.toLocaleString("en-US", { maximumSignificantDigits: 6 })}${pnl}${more}`,
      });
    },
    [labels, coinName]
  );

  const { fills, connected, watchedCount, totalCount } = useTrackedWalletFills(addresses, { onLiveFill });
  const visible = useMemo(() => fills.filter((f) => f.ntl >= prefs.min).slice(0, 40), [fills, prefs.min]);

  // Re-render the relative times every 15s.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!wallets.length) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeading
        title="Live activity"
        icon={<Activity className="h-4 w-4 text-brand" />}
        meta={`${watchedCount} wallet${watchedCount === 1 ? "" : "s"} live`}
        description={
          totalCount > LIVE_WALLET_CAP
            ? `Hyperliquid streams ${LIVE_WALLET_CAP} wallets per browser: the first ${LIVE_WALLET_CAP} of your ${totalCount} are live here. Telegram list alerts cover all of them.`
            : "Fills of your tracked wallets as they happen, with an optional pop-up and sound."
        }
        status={
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-success animate-pulse" : "bg-text-tertiary")} />
            {connected ? "Live" : "Connecting"}
          </span>
        }
        actions={
          <div className="flex items-center gap-1">
            <div className="mr-1 flex rounded-md border border-border-subtle p-0.5">
              {MIN_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => updatePrefs({ min: f.value })}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs",
                    prefs.min === f.value ? "bg-surface-2 text-text-primary" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <IconToggle
              on={prefs.popups}
              onClick={() => updatePrefs({ popups: !prefs.popups })}
              label={prefs.popups ? "Pop-ups on" : "Pop-ups off"}
              iconOn={<Bell className="h-4 w-4" />}
              iconOff={<BellOff className="h-4 w-4" />}
            />
            <IconToggle
              on={prefs.sound}
              onClick={() => {
                if (!prefs.sound) chime(true);
                updatePrefs({ sound: !prefs.sound });
              }}
              label={prefs.sound ? "Sound on" : "Sound off"}
              iconOn={<Volume2 className="h-4 w-4" />}
              iconOff={<VolumeX className="h-4 w-4" />}
            />
          </div>
        }
      />
      <div className="max-h-[360px] overflow-y-auto border-t border-border-subtle">
        {visible.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-tertiary">
            {connected ? "No recent fills for these wallets at this size. New ones appear here as they happen." : "Connecting to Hyperliquid..."}
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {visible.map((f) => (
              <FillRow
                key={f.key}
                fill={f}
                label={labels[f.wallet]}
                coin={coinName(f.coin)}
                spot={f.coin.startsWith("@") || f.coin.includes("/")}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function FillRow({ fill, label, coin, spot }: { fill: TrackedFill; label?: string; coin: string; spot: boolean }) {
  const buy = fill.side === "B";
  return (
    <li
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2 text-xs",
        fill.live && "animate-in fade-in slide-in-from-top-1 duration-300"
      )}
    >
      <TokenAvatar assetName={spot ? `${coin}_spot` : coin} size="sm" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{coin}</span>
          <span className={cn("rounded px-1.5 py-px text-[10px] font-semibold", buy ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
            {fill.dir}
          </span>
          {fill.live && Date.now() - fill.time < NEW_FOR_MS && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand">new</span>
          )}
        </div>
        <Link
          href={`/market/tracker/wallet/${fill.wallet}`}
          className="truncate text-text-tertiary hover:text-text-primary"
        >
          {label || shortAddr(fill.wallet)}
        </Link>
      </div>
      <div className="text-right tabular-nums">
        <div className="font-mono text-text-primary">{compactUsd(fill.ntl, { fallback: "-" })}</div>
        <div className="text-text-tertiary">
          {fill.closedPnl !== 0 && (
            <span className={cn("mr-2", fill.closedPnl > 0 ? "text-success" : "text-danger")}>
              {fill.closedPnl > 0 ? "+" : "-"}
              {compactUsd(Math.abs(fill.closedPnl), { fallback: "-" })}
            </span>
          )}
          {timeAgo(fill.time)}
        </div>
      </div>
    </li>
  );
}

function IconToggle({
  on,
  onClick,
  label,
  iconOn,
  iconOff,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        on ? "bg-brand/10 text-brand" : "text-text-tertiary hover:bg-surface-2 hover:text-text-primary"
      )}
    >
      {on ? iconOn : iconOff}
    </button>
  );
}
