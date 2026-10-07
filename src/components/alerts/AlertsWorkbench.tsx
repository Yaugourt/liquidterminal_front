"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy, useSignedOut } from "@/services/auth/privy";
import { toast } from "sonner";
import {
  Activity,
  Banknote,
  BellRing,
  Flame,
  Gauge,
  Layers,
  Rocket,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CardHead } from "@/components/common";
import { TelegramLinkCard } from "@/components/profile/TelegramLinkCard";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import {
  getAlertRules,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  type AlertRule,
  type AlertRuleType,
  type AlertRulesState,
} from "@/services/market/tracker/walletlist.service";
import { cn } from "@/lib/utils";

interface TypeDef {
  type: AlertRuleType;
  label: string;
  hint: string;
  icon: typeof Target;
  coin: "required" | "optional" | "none";
}

const TYPES: TypeDef[] = [
  { type: "price_cross", label: "Price level", hint: "A perp crosses a price you set.", icon: Target, coin: "required" },
  { type: "price_move", label: "Price move", hint: "A big % move in 1h or 24h, on one coin or any.", icon: TrendingUp, coin: "optional" },
  { type: "liq_cascade", label: "Liquidation cascade", hint: "Liquidations piling up within 60 seconds.", icon: Flame, coin: "optional" },
  { type: "funding", label: "Extreme funding", hint: "Funding past an annualized rate, either side.", icon: Gauge, coin: "optional" },
  { type: "oi_surge", label: "Open interest surge", hint: "Fresh leverage piling in over the last hour.", icon: Layers, coin: "optional" },
  { type: "listing", label: "New listings", hint: "A new perp market goes live.", icon: Rocket, coin: "none" },
  { type: "leverage", label: "Leverage changes", hint: "A market's max leverage is raised or cut.", icon: Activity, coin: "optional" },
  {
    type: "reserve_yield",
    label: "Reserve yield",
    hint: "The USDC reserve yield reaches the protocol, then the Assistance Fund.",
    icon: Banknote,
    coin: "none",
  },
];
const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.type, t])) as Record<AlertRuleType, TypeDef>;

const CASCADE_PRESETS = [250_000, 1_000_000, 5_000_000, 10_000_000];
const usd = (v: number) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(v % 1e6 ? 1 : 0)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;
const price = (v: number) => `$${v.toLocaleString("en-US", { maximumSignificantDigits: 6 })}`;

function errorText(err: unknown): string {
  const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
  return data?.error || data?.message || "Something went wrong. Try again.";
}

/** One-line reading of a rule's settings, for the list. */
function describe(rule: AlertRule): string {
  const p = rule.params;
  const where = (p.coin as string | null) ?? "Any coin";
  switch (rule.type) {
    case "price_cross":
      return `${where} crosses ${p.direction} ${price(p.level as number)}`;
    case "price_move":
      return `${where} ${p.direction === "up" ? "up" : p.direction === "down" ? "down" : "up or down"} ${p.pct}% in ${p.window}`;
    case "funding":
      return `${where} funding beyond ${p.aprPct}% APR`;
    case "oi_surge":
      return `${where} open interest +${p.pct}% in 1h (min ${usd(p.minOiUsd as number)})`;
    case "listing":
      return "Every new perp market";
    case "leverage":
      return `${where} max leverage changes`;
    case "liq_cascade":
      return `${(p.coin as string | null) ?? "All markets"}: ${usd(p.minUsd as number)}+ liquidated within 60s`;
    case "reserve_yield":
      return "Each USDC reserve yield payment, and its transfer to the Assistance Fund";
  }
}

/**
 * Alert builder and list for the generic market alerts. Wallet alerts live
 * with the lists in the tracker; this page links there.
 */
export function AlertsWorkbench() {
  const { ready, authenticated, login } = usePrivy();
  // Shown at once for a visitor with no stored session, like the other sign-in prompts.
  const signedOut = useSignedOut();
  const [state, setState] = useState<AlertRulesState | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setState(await getAlertRules());
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && authenticated) void load();
  }, [ready, authenticated, load]);

  const { data: markets } = usePerpMarkets({ limit: 300 });
  const prices = useMemo(() => new Map(markets.map((m) => [m.name.toUpperCase(), m.price])), [markets]);

  if (signedOut) {
    return (
      <Card className="flex flex-col items-start gap-3 p-6">
        <BellRing className="h-5 w-5 text-brand" />
        <h2 className="text-base font-semibold text-text-primary">Sign in to set up alerts</h2>
        <p className="max-w-prose text-sm text-text-secondary">
          Alerts go to your Telegram. Sign in, link Telegram in one tap, then pick what you want to hear about.
        </p>
        <Button onClick={login} className="bg-brand font-semibold text-brand-text-on hover:bg-brand/90">
          Sign in
        </Button>
      </Card>
    );
  }

  const linked = state?.telegram.linked ?? false;
  const rules = state?.rules ?? [];
  const full = state ? rules.length >= state.limit : false;

  return (
    <div className="space-y-4">
      {state && !linked && <TelegramLinkCard onLinked={load} />}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <NewAlertCard
          disabled={!linked || full}
          disabledReason={!linked ? "Link Telegram first" : full ? `You have reached ${state?.limit} alerts` : undefined}
          prices={prices}
          coins={markets.map((m) => m.name)}
          onCreated={(rule) => setState((s) => (s ? { ...s, rules: [...s.rules, rule] } : s))}
        />

        <Card className="overflow-hidden">
          <CardHead
            title="Your alerts"
            tag={state ? `${rules.length}/${state.limit}` : undefined}
            actions={
              linked ? (
                <span className="ml-auto text-xs text-success">
                  {state?.telegram.username ? `@${state.telegram.username}` : "Telegram connected"}
                </span>
              ) : undefined
            }
          />
          <div className="border-t border-border-subtle">
            {loading && !state ? (
              <p className="px-4 py-6 text-sm text-text-tertiary">Loading alerts...</p>
            ) : rules.length === 0 ? (
              <p className="px-4 py-6 text-sm text-text-tertiary">
                No alerts yet. Pick a type on the left: it takes a few seconds.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onChange={(next) => setState((s) => (s ? { ...s, rules: s.rules.map((r) => (r.id === next.id ? next : r)) } : s))}
                    onDelete={() => setState((s) => (s ? { ...s, rules: s.rules.filter((r) => r.id !== rule.id) } : s))}
                  />
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/market/tracker/my-wallets"
            className="flex items-center gap-3 border-t border-border-subtle px-4 py-3 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
          >
            <Wallet className="h-4 w-4 text-brand" />
            <span>
              <span className="font-medium text-text-primary">Wallet alerts</span> live with your lists: every fill, open,
              close or flip of the wallets you track.
            </span>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export function NewAlertCard({
  disabled,
  disabledReason,
  prices,
  coins,
  onCreated,
}: {
  disabled: boolean;
  disabledReason?: string;
  prices: Map<string, number>;
  coins: string[];
  onCreated: (rule: AlertRule) => void;
}) {
  const [type, setType] = useState<AlertRuleType>("price_cross");
  // `/alerts?type=reserve_yield` opens the builder on that type (links from other pages).
  useEffect(() => {
    const wanted = new URLSearchParams(globalThis.location.search).get("type");
    if (wanted && wanted in TYPE_BY_ID) setType(wanted as AlertRuleType);
  }, []);
  const [coin, setCoin] = useState("BTC");
  const [level, setLevel] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [pct, setPct] = useState("5");
  const [window, setWindow] = useState<"1h" | "24h">("1h");
  const [moveDir, setMoveDir] = useState<"up" | "down" | "both">("both");
  const [apr, setApr] = useState("100");
  const [minUsd, setMinUsd] = useState(1_000_000);
  const [saving, setSaving] = useState(false);

  const def = TYPE_BY_ID[type];
  const coinKey = coin.trim().toUpperCase();
  const current = coinKey ? prices.get(coinKey) : undefined;

  const params = (): Record<string, unknown> => {
    const c = coinKey || null;
    switch (type) {
      case "price_cross":
        return { coin: c, level: Number(level), direction };
      case "price_move":
        return { coin: c, pct: Number(pct), window, direction: moveDir };
      case "funding":
        return { coin: c, aprPct: Number(apr) };
      case "oi_surge":
        return { coin: c, pct: Number(pct) };
      case "listing":
        return {};
      case "leverage":
        return { coin: c };
      case "liq_cascade":
        return { coin: c, minUsd };
      case "reserve_yield":
        return {};
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      const rule = await createAlertRule(type, params());
      onCreated(rule);
      toast.success(`Alert on: ${rule.name}`);
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const pickType = (t: AlertRuleType) => {
    setType(t);
    if (TYPE_BY_ID[t].coin === "optional" && coin === "BTC") setCoin("");
    if (TYPE_BY_ID[t].coin === "required" && !coin) setCoin("BTC");
    if (t === "oi_surge") setPct("25");
    if (t === "price_move") setPct("5");
  };

  const invalid =
    (def.coin === "required" && !coinKey) ||
    (type === "price_cross" && !(Number(level) > 0)) ||
    ((type === "price_move" || type === "oi_surge") && !(Number(pct) > 0)) ||
    (type === "funding" && !(Number(apr) > 0));

  return (
    <Card className="overflow-hidden">
      <CardHead title="New alert" />
      <div className="space-y-4 border-t border-border-subtle p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => pickType(t.type)}
              aria-pressed={type === t.type}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
                type === t.type
                  ? "border-brand/50 bg-brand/10 text-text-primary"
                  : "border-border-subtle text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )}
            >
              <t.icon className={cn("h-3.5 w-3.5 shrink-0", type === t.type ? "text-brand" : "text-text-tertiary")} />
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-tertiary">{def.hint}</p>

        <div className="space-y-3">
          {def.coin !== "none" && (
            <Field label={def.coin === "required" ? "Coin" : "Coin (empty = any coin)"}>
              <Input
                id="alert-coin"
                list="alert-coins"
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                placeholder={def.coin === "required" ? "BTC" : "Any coin"}
                className="h-9 font-mono uppercase text-text-primary"
              />
              <datalist id="alert-coins">
                {coins.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {current !== undefined && <p className="text-[11px] text-text-tertiary">Now {price(current)}</p>}
            </Field>
          )}

          {type === "price_cross" && (
            <div className="grid grid-cols-[auto_1fr] items-end gap-2">
              <Segmented value={direction} onChange={setDirection} options={[["above", "Above"], ["below", "Below"]]} />
              <Input
                id="alert-level"
                inputMode="decimal"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder={current ? String(current) : "Price"}
                className="h-9 font-mono text-text-primary"
              />
            </div>
          )}

          {type === "price_move" && (
            <div className="flex flex-wrap items-center gap-2">
              <Segmented value={moveDir} onChange={setMoveDir} options={[["both", "Up or down"], ["up", "Up"], ["down", "Down"]]} />
              <PctInput id="alert-move-pct" value={pct} onChange={setPct} />
              <span className="text-xs text-text-tertiary">in</span>
              <Segmented value={window} onChange={setWindow} options={[["1h", "1h"], ["24h", "24h"]]} />
            </div>
          )}

          {type === "oi_surge" && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              Open interest up <PctInput id="alert-oi-pct" value={pct} onChange={setPct} /> in 1h, on markets above $1M OI
            </div>
          )}

          {type === "funding" && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              Beyond <PctInput id="alert-apr" value={apr} onChange={setApr} /> APR, longs or shorts paying
            </div>
          )}

          {type === "liq_cascade" && (
            <Field label="Liquidated within 60 seconds">
              <div className="flex flex-wrap gap-2">
                {CASCADE_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMinUsd(v)}
                    aria-pressed={minUsd === v}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-mono",
                      minUsd === v ? "border-brand/50 bg-brand/10 text-text-primary" : "border-border-subtle text-text-secondary hover:bg-surface-2"
                    )}
                  >
                    {usd(v)}+
                  </button>
                ))}
              </div>
            </Field>
          )}
        </div>

        <Button
          onClick={submit}
          disabled={disabled || saving || invalid}
          className="w-full bg-brand font-semibold text-brand-text-on hover:bg-brand/90"
        >
          {saving ? "Saving..." : disabled && disabledReason ? disabledReason : "Create alert"}
        </Button>
      </div>
    </Card>
  );
}

export function RuleRow({ rule, onChange, onDelete }: { rule: AlertRule; onChange: (r: AlertRule) => void; onDelete: () => void }) {
  const [busy, setBusy] = useState(false);
  const def = TYPE_BY_ID[rule.type];
  const Icon = def?.icon ?? BellRing;

  const toggle = async (isActive: boolean) => {
    setBusy(true);
    try {
      onChange(await updateAlertRule(rule.id, { isActive }));
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await deleteAlertRule(rule.id);
      onDelete();
    } catch (err) {
      toast.error(errorText(err));
      setBusy(false);
    }
  };

  return (
    <li className={cn("flex items-center gap-3 px-4 py-3", !rule.isActive && "opacity-60")}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10">
        <Icon className="h-3.5 w-3.5 text-brand" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{rule.name}</p>
        <p className="truncate text-xs text-text-tertiary">
          {def?.label ?? rule.type} · {describe(rule)}
        </p>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        aria-label={`Delete ${rule.name}`}
        className="rounded p-1.5 text-text-tertiary hover:bg-danger/10 hover:text-danger disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <Switch checked={rule.isActive} disabled={busy} onCheckedChange={toggle} aria-label={`Turn ${rule.name} on or off`} />
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</span>
      {children}
    </div>
  );
}

function PctInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <span className="relative inline-flex items-center">
      <Input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-20 pr-6 font-mono text-text-primary" />
      <span className="pointer-events-none absolute right-2 text-xs text-text-tertiary">%</span>
    </span>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="inline-flex h-9 rounded-md border border-border-subtle p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn(
            "rounded px-2.5 text-xs",
            value === v ? "bg-surface-2 text-text-primary" : "text-text-tertiary hover:text-text-primary"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
