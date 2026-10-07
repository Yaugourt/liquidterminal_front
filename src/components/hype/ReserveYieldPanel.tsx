"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead, KpiRibbon, ShareTile } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { useAfBuybacks } from "@/services/market/hype";
import type { ReserveYieldInterval, ReserveYieldSnapshot } from "@/services/market/reserve-yield";
import { cn } from "@/lib/utils";
import { fmtUsd, fmtUsdFull, fmtHype } from "./format";

const DAY_MS = 86_400_000;
const INTERVAL_DATES = 30;
const PAYOUT_LAG = 8;

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const tiny = (a: string) => `${a.slice(0, 4)}…${a.slice(-2)}`;
const day = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const dayTime = (t: number) =>
  `${new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}, ${new Date(t)
    .toISOString()
    .slice(11, 16)} UTC`;
const usdc = (n: number) =>
  `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

function AddressLink({ address, compact }: { address: string; compact?: boolean }) {
  return (
    <Link href={`/explorer/address/${address}`} title={address} className="mono text-brand hover:underline">
      {compact ? tiny(address) : short(address)}
    </Link>
  );
}

/**
 * Headline of the USDC reserve yield: what has been paid, the rate that
 * payment implies, where the money sits right now and when the next one is
 * due. Every number is read from the chain by `/api/reserve-yield`.
 */
export function ReserveYieldOverviewCard({ data }: { data: ReserveYieldSnapshot }) {
  const { data: bb } = useAfBuybacks();
  const paid = data.intervals.filter((i) => i.status === "paid");
  const lastPaid = paid[paid.length - 1] ?? null;
  const current = data.intervals[data.intervals.length - 1];
  const daysOfBuybacks = bb && bb.avgDailyUsd > 0 && lastPaid?.paidUsdc ? lastPaid.paidUsdc / bb.avgDailyUsd : null;

  const cells: KpiCell[] = [
    {
      key: "paid",
      label: "Paid to the protocol",
      value: fmtUsd(data.totalPaidUsdc),
      tone: "gold",
      sub: lastPaid?.paidAt ? `${paid.length} payment · ${day(lastPaid.paidAt)}` : "no payment yet",
    },
    {
      key: "rate",
      label: "Implied rate",
      value: lastPaid?.impliedRatePct != null ? `${lastPaid.impliedRatePct.toFixed(2)}%` : "—",
      sub: lastPaid ? `from interval ${lastPaid.index}, per year` : "after the first payment",
    },
    {
      key: "eligible",
      label: "Eligible balance",
      value: fmtUsd(data.treasuryUsdc),
      sub: "treasury, HyperEVM",
    },
    {
      key: "interval",
      label: `Interval ${current.index}`,
      value: `${data.current.dateNumber} / ${data.current.of}`,
      sub: `dates sampled · ends ${day(current.end)}`,
    },
    {
      key: "next",
      label: "Next payment",
      value: day(data.current.nextPayoutDate),
      sub: current.projectedUsdc != null ? `~${fmtUsd(current.projectedUsdc)} at the same rate` : undefined,
    },
    {
      key: "hype",
      label: "In HYPE today",
      value: data.hypeUsd && lastPaid?.paidUsdc ? fmtHype(lastPaid.paidUsdc / data.hypeUsd, 0) : "—",
      sub: daysOfBuybacks != null ? `≈ ${daysOfBuybacks.toFixed(1)} days of fund buybacks` : "at the current price",
    },
  ];

  const ratio = data.treasuryToLinkedRatio;
  const ratioOk = ratio != null && Math.abs(ratio - 9) < 0.01;

  return (
    <Card className="overflow-hidden">
      <CardHead
        title="USDC reserve yield"
        tag="AQAv2"
        subtitle="The yield on the USDC reserves held for Hyperliquid, paid to the protocol and sent to the Assistance Fund"
        actions={
          <span className="inline-flex items-center gap-2">
            <Link
              href="/alerts?type=reserve_yield"
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold shrink-0 transition-colors bg-surface-2 text-text-secondary hover:text-text-primary border border-border-subtle focus-ring"
            >
              <BellRing size={13} />
              Telegram alert
            </Link>
            {data.totalPaidUsdc > 0 && (
              <ShareTile src="/api/tile/reserve-yield" filename="liquidterminal-reserve-yield" />
            )}
          </span>
        }
      />

      <div className="p-3.5 border-b border-border-subtle">
        <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />
      </div>

      {/* where the money is: treasury -> interest address -> fund */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2 p-3.5">
        <FlowNode
          title="Treasury"
          where="HyperEVM"
          address={data.addresses.treasury}
          value={fmtUsdFull(data.treasuryUsdc)}
          note={
            ratio != null ? (
              <span className={cn("inline-flex items-center gap-1", ratioOk ? "text-success" : "text-warning")}>
                {ratioOk && <Check size={11} />}
                {ratio.toFixed(2)} : 1 vs the linked contract, the split the docs require
              </span>
            ) : undefined
          }
        />
        <FlowArrow label="charged daily, paid 8 days after each interval" />
        <FlowNode
          title="Interest address"
          where="HyperCore"
          address={data.addresses.interest}
          value={fmtUsdFull(data.interestUsdc)}
          note={
            data.interestUsdc > 1 ? "waiting to be sent to the fund" : "empty, everything has been sent on"
          }
          highlight={data.interestUsdc > 1}
        />
        <FlowArrow label="sent on by the protocol" />
        <FlowNode
          title="Assistance Fund"
          where="HyperCore"
          address={data.addresses.assistanceFund}
          value={fmtUsdFull(data.forwardedToFundUsdc)}
          note="received from the interest address, then used to buy HYPE"
        />
      </div>
    </Card>
  );
}

function FlowNode({
  title,
  where,
  address,
  value,
  note,
  highlight,
}: {
  title: string;
  where: string;
  address: string;
  value: string;
  note?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3.5 py-3 min-w-0",
        highlight ? "border-gold/40 bg-gold/5" : "border-border-subtle bg-surface-2/40",
      )}
    >
      <div className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">{title}</span>
        <span className="text-[10px] text-text-tertiary">{where}</span>
        <span className="ml-auto text-[11px]">
          <AddressLink address={address} compact />
        </span>
      </div>
      <div className={cn("mono text-[20px] font-semibold leading-none mt-2", highlight ? "text-gold" : "text-text-primary")}>
        {value}
      </div>
      {note && <div className="text-[11px] text-text-tertiary mt-1.5">{note}</div>}
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex md:flex-col items-center justify-center gap-1 px-1 text-text-tertiary">
      <ArrowRight size={16} className="rotate-90 md:rotate-0 shrink-0" />
      <span className="text-[10px] text-center leading-tight md:max-w-[96px]">{label}</span>
    </div>
  );
}

/**
 * One row per 30-date interval: the sampled dates, the 8-day wait, and the
 * payment that closed it (or the projection while it accrues).
 */
export function ReserveYieldScheduleCard({ data }: { data: ReserveYieldSnapshot }) {
  const today = Math.floor(data.asOf / DAY_MS) * DAY_MS;
  return (
    <Card className="overflow-hidden">
      <CardHead
        title="Interval schedule"
        subtitle="30 daily readings of the treasury balance, then 8 days until the payment"
      />
      <div className="divide-y divide-border-subtle">
        {[...data.intervals].reverse().map((iv) => (
          <IntervalRow key={iv.index} iv={iv} today={today} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3.5 py-2 border-t border-border-subtle text-[10.5px] text-text-tertiary">
        <Legend className="bg-brand" label="date read" />
        <Legend className="bg-surface-3 border border-border-subtle" label="date to come" />
        <Legend className="bg-gold/30" label="waiting for the payment" />
        <Legend className="bg-gold" label="payment day" />
      </div>
    </Card>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-sm", className)} />
      {label}
    </span>
  );
}

function IntervalRow({ iv, today }: { iv: ReserveYieldInterval; today: number }) {
  const cells = useMemo(() => {
    const out: { kind: "read" | "future" | "lag" | "payout"; t: number }[] = [];
    for (let k = 0; k < INTERVAL_DATES; k++) {
      const t = iv.start + k * DAY_MS;
      out.push({ kind: t <= today ? "read" : "future", t });
    }
    for (let k = 1; k <= PAYOUT_LAG; k++) {
      const t = iv.end + k * DAY_MS;
      out.push({ kind: k === PAYOUT_LAG ? "payout" : "lag", t });
    }
    return out;
  }, [iv, today]);

  const statusLabel =
    iv.status === "paid" ? "Paid" : iv.status === "due" ? "Waiting for payment" : "Accruing";

  return (
    <div className="px-3.5 py-3 space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[12.5px] font-semibold text-text-primary">Interval {iv.index}</span>
        <span className="text-[11px] text-text-tertiary">
          {day(iv.start)} to {day(iv.end)} · paid {day(iv.payoutDate)}
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded",
            iv.status === "paid" ? "bg-success/10 text-success" : "bg-brand/10 text-brand",
          )}
        >
          {statusLabel}
        </span>
        <span className="ml-auto mono text-[13px] font-semibold text-gold">
          {iv.paidUsdc != null
            ? usdc(iv.paidUsdc)
            : iv.projectedUsdc != null
              ? `~${fmtUsd(iv.projectedUsdc)} projected`
              : "—"}
        </span>
      </div>
      <div className="flex gap-[3px]" role="img" aria-label={`Interval ${iv.index} timeline`}>
        {cells.map((c, i) => (
          <span
            key={i}
            title={`${day(c.t)}${c.kind === "payout" ? " · payment" : c.kind === "lag" ? " · waiting" : ""}`}
            className={cn(
              "h-3 flex-1 rounded-[2px] min-w-0",
              c.kind === "read" && "bg-brand",
              c.kind === "future" && "bg-surface-3 border border-border-subtle",
              c.kind === "lag" && "bg-gold/30",
              c.kind === "payout" && "bg-gold",
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-text-tertiary">
        {iv.sampledDates > 0 && (
          <span>
            {iv.sampledDates} of {INTERVAL_DATES} readings · average{" "}
            <span className="mono text-text-secondary">{fmtUsd(iv.avgBalance)}</span>
          </span>
        )}
        {iv.impliedRatePct != null && (
          <span>
            implied rate <span className="mono text-text-secondary">{iv.impliedRatePct.toFixed(3)}%</span> a year
          </span>
        )}
        {iv.paidAt && (
          <span>
            landed {dayTime(iv.paidAt)}
            {iv.paidHash && (
              <>
                {" "}
                ·{" "}
                <Link href={`/explorer/transaction/${iv.paidHash}`} className="mono text-brand hover:underline">
                  {short(iv.paidHash)}
                </Link>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

/** Every USDC movement in and out of the interest address, from its ledger. */
export function ReserveYieldLedgerCard({ data }: { data: ReserveYieldSnapshot }) {
  const KIND: Record<string, { label: string; cls: string }> = {
    payment: { label: "Payment", cls: "text-gold" },
    transfer: { label: "Transfer", cls: "text-text-secondary" },
    forward: { label: "To the fund", cls: "text-success" },
  };
  return (
    <Card className="overflow-hidden">
      <CardHead
        title="Interest address ledger"
        tag={short(data.addresses.interest)}
        subtitle="USDC in and out of the system interest address"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.06em] text-text-tertiary">
              <th className="px-3.5 py-2 font-semibold">Time (UTC)</th>
              <th className="px-2 py-2 font-semibold">Type</th>
              <th className="px-2 py-2 font-semibold">From → to</th>
              <th className="px-3.5 py-2 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.flows.map((f) => {
              const k = KIND[f.kind];
              const zeroHash = /^0x0+$/.test(f.hash);
              return (
                <tr key={`${f.hash}-${f.time}`}>
                  <td className="px-3.5 py-2 mono text-text-tertiary whitespace-nowrap">
                    {zeroHash ? (
                      dayTime(f.time)
                    ) : (
                      <Link href={`/explorer/transaction/${f.hash}`} className="hover:text-brand">
                        {dayTime(f.time)}
                      </Link>
                    )}
                  </td>
                  <td className={cn("px-2 py-2 font-semibold whitespace-nowrap", k.cls)}>{k.label}</td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <AddressLink address={f.from} /> <span className="text-text-tertiary">→</span>{" "}
                    <AddressLink address={f.to} />
                  </td>
                  <td className="px-3.5 py-2 mono text-right text-text-primary whitespace-nowrap">
                    {f.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3.5 py-2 border-t border-border-subtle text-[10.5px] text-text-tertiary">
        Transfers under 1,000 USDC are not interval payments; the first one, on 27 Aug, marks the activation. The
        protocol&apos;s own transfers to the fund carry no transaction hash.
      </div>
    </Card>
  );
}

/** What the yield is worth a year at a rate the reader sets (defaults to the implied one). */
export function ReserveYieldEstimatorCard({ data }: { data: ReserveYieldSnapshot }) {
  const implied = [...data.intervals].reverse().find((i) => i.impliedRatePct != null)?.impliedRatePct ?? null;
  const [rate, setRate] = useState<number>(implied != null ? Number(implied.toFixed(2)) : 3);
  const [balanceB, setBalanceB] = useState<number>(Number((data.treasuryUsdc / 1e9).toFixed(2)));

  const yearly = (balanceB * 1e9 * rate) / 100;
  const perInterval = (yearly * INTERVAL_DATES) / 365;

  return (
    <Card className="overflow-hidden">
      <CardHead
        title="Estimator"
        subtitle="What one interval and one year pay"
      />
      <div className="p-3.5 space-y-4">
        <Slider
          id="ry-rate"
          label="Rate paid to the protocol"
          value={rate}
          min={0}
          max={6}
          step={0.01}
          display={`${rate.toFixed(2)}%`}
          onChange={setRate}
          hint={implied != null ? `implied by the last payment: ${implied.toFixed(2)}%` : undefined}
        />
        <Slider
          id="ry-balance"
          label="Eligible balance"
          value={balanceB}
          min={0}
          max={20}
          step={0.05}
          display={`$${balanceB.toFixed(2)}B`}
          onChange={setBalanceB}
          hint={`today: ${fmtUsd(data.treasuryUsdc)}`}
        />
        <div className="grid grid-cols-2 gap-3">
          <Out label="Per interval" usd={perInterval} hypeUsd={data.hypeUsd} />
          <Out label="Per year" usd={yearly} hypeUsd={data.hypeUsd} />
        </div>
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          Daily charge = balance × rate ÷ 365. The implied rate is computed the same way from the real payment,
          so the two agree on the day count. HYPE amounts use today&apos;s price.
        </p>
      </div>
    </Card>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-[11px] text-text-secondary">
          {label}
        </label>
        <span className="ml-auto mono text-[13px] font-semibold text-text-primary">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand mt-1.5"
      />
      {hint && <div className="text-[10.5px] text-text-tertiary">{hint}</div>}
    </div>
  );
}

function Out({ label, usd, hypeUsd }: { label: string; usd: number; hypeUsd: number | null }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2/40 px-3.5 py-3">
      <div className="text-[10px] uppercase tracking-[0.07em] text-text-tertiary font-semibold">{label}</div>
      <div className="mono text-[20px] font-semibold text-gold leading-none mt-2">{fmtUsd(usd)}</div>
      <div className="mono text-[11px] text-text-tertiary mt-1.5">
        {hypeUsd ? `≈ ${fmtHype(usd / hypeUsd, 0)}` : "—"}
      </div>
    </div>
  );
}

/** Mechanism and method, with every assumption named. */
export function ReserveYieldMethodCard() {
  return (
    <Card className="overflow-hidden">
      <CardHead
        title="How it works"
      />
      <div className="p-3.5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 text-[12px] leading-relaxed text-text-secondary">
        <p>
          USDC on Hyperliquid is an aligned quote asset (AQAv2). Coinbase acts as the treasury deployer and Circle
          as the technical deployer, each staking 500k HYPE. In exchange, the protocol receives about 90% of the
          cost-adjusted reserve yield earned on the USDC supply held for Hyperliquid.
        </p>
        <p>
          The charge is computed on the treasury address balance on HyperEVM, read once per UTC date, at a rate the
          validators publish daily. Readings add up over 30-date intervals. 8 days after an interval ends, the total
          is paid into the system interest address for USDC and the protocol sends it to the Assistance Fund,
          which buys HYPE with it.
        </p>
        <p>
          <span className="text-text-primary font-medium">What is read, not assumed.</span> Treasury and linked
          contract balances come from HyperEVM; past readings are taken at the first block of each UTC date on
          archive nodes, checked against a second node. The linked
          contract address comes from Hyperliquid&apos;s spot metadata. The interest address balance and ledger,
          and the fund&apos;s receipts, come from HyperCore.
        </p>
        <p>
          <span className="text-text-primary font-medium">What is inferred.</span> The settled rate has no public
          read path, so the rate shown is the one the payment implies (amount ÷ sum of the 30 readings × 365). The
          interval dates start on 27 Aug, the day the interest address was first funded; that schedule puts the
          first payment on 3 Oct, the day it landed. Projections hold today&apos;s balance and the last implied
          rate.
        </p>
      </div>
    </Card>
  );
}
