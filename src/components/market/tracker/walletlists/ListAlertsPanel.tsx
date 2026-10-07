"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardHead } from "@/components/common";
import { TelegramLinkCard } from "@/components/profile/TelegramLinkCard";
import { useDataFetching } from "@/hooks/useDataFetching";
import { useWalletLists } from "@/store/use-wallet-lists";
import {
  getListAlerts,
  saveListAlert,
  deleteListAlert,
  type ListAlert,
  type ListAlertSettings,
} from "@/services/market/tracker/walletlist.service";
import { cn } from "@/lib/utils";

const MIN_SIZES = [
  { value: "0", label: "Any size" },
  { value: "1000", label: "$1K+" },
  { value: "10000", label: "$10K+" },
  { value: "100000", label: "$100K+" },
  { value: "1000000", label: "$1M+" },
];
const EVENTS = [
  { value: "ALL", label: "Every fill" },
  { value: "OPEN", label: "Opens only" },
  { value: "CLOSE", label: "Closes only" },
  { value: "FLIP", label: "Flips only" },
];
const MARKETS = [
  { value: "ALL", label: "Perp + spot" },
  { value: "PERP", label: "Perp" },
  { value: "SPOT", label: "Spot" },
];

const DEFAULTS: ListAlertSettings = { minUsd: 0, direction: null, source: null, isActive: true };

/** Message from a backend error ({ error, code }), else a generic line. */
function errorText(err: unknown): string {
  const data = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
  return data?.error || data?.message || "Could not save the alert. Try again.";
}

interface Row {
  listId: number;
  name: string;
  walletCount: number;
  owned: boolean;
  alert: ListAlert | null;
}

/**
 * Telegram alerts driven by wallet lists. Turning a list on sends every order
 * its wallets fill to the user's Telegram, named as in the list. The list stays
 * the source of truth: wallets added or removed here change the alerts within
 * 30 seconds, with nothing to set up in the bot. Public lists of other users
 * can be followed the same way (from their preview).
 */
export function ListAlertsPanel() {
  const userLists = useWalletLists((s) => s.userLists);
  const { data, isLoading, refetch } = useDataFetching({
    fetchFn: getListAlerts,
    refreshInterval: 0,
    maxRetries: 1,
  });
  const [pending, setPending] = useState<number | null>(null);
  const [state, setState] = useState(data);
  useEffect(() => setState(data), [data]);

  const rows = useMemo<Row[]>(() => {
    const byList = new Map((state?.alerts ?? []).map((a) => [a.walletListId, a]));
    const own: Row[] = userLists.map((l) => ({
      listId: l.id,
      name: l.name,
      walletCount: byList.get(l.id)?.walletCount ?? l.itemsCount ?? l.items?.length ?? 0,
      owned: true,
      alert: byList.get(l.id) ?? null,
    }));
    const followed: Row[] = (state?.alerts ?? [])
      .filter((a) => !a.isOwner)
      .map((a) => ({ listId: a.walletListId, name: a.listName, walletCount: a.walletCount, owned: false, alert: a }));
    return [...own, ...followed];
  }, [userLists, state]);

  const save = useCallback(
    async (row: Row, patch: Partial<ListAlertSettings>) => {
      const current = row.alert ?? DEFAULTS;
      const next: ListAlertSettings = {
        minUsd: patch.minUsd ?? current.minUsd,
        direction: patch.direction !== undefined ? patch.direction : current.direction,
        source: patch.source !== undefined ? patch.source : current.source,
        isActive: patch.isActive ?? (row.alert ? row.alert.isActive : true),
      };
      setPending(row.listId);
      try {
        const saved = await saveListAlert(row.listId, next);
        setState((s) =>
          s ? { ...s, alerts: [...s.alerts.filter((a) => a.walletListId !== row.listId), saved] } : s
        );
        if (!row.alert) toast.success(`Alerts on for ${row.name}. They arrive in Telegram.`);
      } catch (err) {
        toast.error(errorText(err));
      } finally {
        setPending(null);
      }
    },
    []
  );

  const remove = useCallback(async (row: Row) => {
    setPending(row.listId);
    try {
      await deleteListAlert(row.listId);
      setState((s) => (s ? { ...s, alerts: s.alerts.filter((a) => a.walletListId !== row.listId) } : s));
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setPending(null);
    }
  }, []);

  const linked = state?.telegram.linked ?? false;
  const activeCount = (state?.alerts ?? []).filter((a) => a.isActive && a.inTelegram).length;

  return (
    <Card className="overflow-hidden">
      <CardHead
        title="Telegram alerts"
        tag={linked ? `${activeCount} active` : undefined}
        subtitle="Every order a wallet in your lists fills, sent to Telegram within seconds. Edit a list here and its alerts follow."
        actions={
          linked ? (
            <span className="ml-auto text-xs text-success">
              {state?.telegram.username ? `@${state.telegram.username}` : "Telegram connected"}
            </span>
          ) : undefined
        }
      />

      <div className="border-t border-border-subtle">
        {isLoading && !state ? (
          <div className="px-4 py-6 text-sm text-text-tertiary">Loading alerts...</div>
        ) : !linked ? (
          <div className="p-4">
            <TelegramLinkCard onLinked={refetch} />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-text-tertiary">
            Create a list to get alerts on its wallets, or follow a{" "}
            <Link href="/market/tracker/public-lists" className="text-brand hover:underline">
              public list
            </Link>
            .
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <ListAlertRow
                key={row.listId}
                row={row}
                busy={pending === row.listId}
                onSave={(patch) => save(row, patch)}
                onRemove={() => remove(row)}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function ListAlertRow({
  row,
  busy,
  onSave,
  onRemove,
}: {
  row: Row;
  busy: boolean;
  onSave: (patch: Partial<ListAlertSettings>) => void;
  onRemove: () => void;
}) {
  const on = Boolean(row.alert?.isActive && row.alert.inTelegram);
  const empty = row.walletCount === 0;
  const a = row.alert;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-48">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text-primary">{row.name}</span>
          {!row.owned && (
            <span className="rounded border border-border-subtle px-1.5 text-[10px] uppercase tracking-wide text-text-tertiary">
              Following
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary">
          {row.walletCount} wallet{row.walletCount === 1 ? "" : "s"}
          {a && !a.inTelegram && (
            <span className="ml-2 inline-flex items-center gap-1 text-warning">
              <AlertTriangle className="h-3 w-3" /> removed in Telegram, switch on to restore
            </span>
          )}
          {empty && !a && <span className="ml-2">· add a wallet to enable alerts</span>}
        </p>
      </div>

      {a && a.inTelegram && (
        <div className={cn("flex flex-wrap items-center gap-2", !on && "opacity-60")}>
          <SettingSelect
            label="Minimum size"
            value={String(a.minUsd)}
            options={MIN_SIZES.some((o) => o.value === String(a.minUsd)) ? MIN_SIZES : [...MIN_SIZES, { value: String(a.minUsd), label: `$${a.minUsd.toLocaleString("en-US")}+` }]}
            disabled={busy}
            onChange={(v) => onSave({ minUsd: Number(v) })}
          />
          <SettingSelect
            label="Events"
            value={a.direction ?? "ALL"}
            options={EVENTS}
            disabled={busy}
            onChange={(v) => onSave({ direction: v === "ALL" ? null : (v as "OPEN" | "CLOSE" | "FLIP") })}
          />
          <SettingSelect
            label="Markets"
            value={a.source ?? "ALL"}
            options={MARKETS}
            disabled={busy}
            onChange={(v) => onSave({ source: v === "ALL" ? null : (v as "PERP" | "SPOT") })}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {!row.owned && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Stop following ${row.name}`}
            className="rounded p-1.5 text-text-tertiary hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <Switch
          checked={on}
          disabled={busy || (empty && !on)}
          onCheckedChange={(checked) => onSave({ isActive: checked })}
          aria-label={`Telegram alerts for ${row.name}`}
        />
      </div>
    </li>
  );
}

function SettingSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label} className="h-8 w-auto min-w-[104px] gap-2 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
