import { compactUsd, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { formatDuration, timeAgo } from "@/lib/formatters/dateFormatting";
import type {
  CadenceProfile,
  CapitalFlows,
  CarryProfile,
  ExposureProfile,
  PeriodPnl,
  RiskProfile,
  SmartMoneyAlignment,
  TradingProfile,
} from "./useAddressDigest";

export type InsightTone = "good" | "warn" | "neutral";

export interface WalletInsight {
  id: string;
  tone: InsightTone;
  /** The finding, with its numbers inline. */
  text: string;
  /** Which feeds the rule crossed — surfaced as a tooltip. */
  source: string;
  /** Optional deep link (a linked account, a market). */
  href?: string;
  hrefLabel?: string;
}

interface InsightInput {
  address: string;
  pnl: PeriodPnl;
  netWorth: { total: number; hyperCore: number };
  trading: TradingProfile | null;
  cadence: CadenceProfile | null;
  flows: CapitalFlows | null;
  smartMoney: SmartMoneyAlignment | null;
  carry: CarryProfile | null;
  risk: RiskProfile;
  exposure: ExposureProfile;
}

const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const perDay = (n: number) => (n >= 10 ? Math.round(n).toString() : n.toFixed(1));

/**
 * Cross-feed findings for a wallet you might follow or copy. Every rule is a
 * plain comparison over figures the digest already derived; a rule that has
 * no data stays silent rather than hedging. Ordered by what a copier needs to
 * know first: can I replicate it, is the equity real, where is it leaning,
 * what does holding it cost, is it in danger.
 */
export function deriveWalletInsights(input: InsightInput): WalletInsight[] {
  const { pnl, netWorth, trading, cadence, flows, smartMoney, carry, risk, exposure } = input;
  const out: WalletInsight[] = [];

  // 1. Cadence — is this manually copyable?
  if (cadence) {
    const hold = formatDuration(cadence.medianHoldS);
    if (cadence.style === "Scalper") {
      out.push({
        id: "cadence",
        tone: "warn",
        text: `Scalper: median hold ${hold}, ~${perDay(cadence.tradesPerDay)} round-trips/day, ${pct(cadence.under5mShare)} closed under 5 min — not copyable by hand.`,
        source: `Last ${cadence.sample} closed round-trips (indexer)`,
      });
    } else {
      out.push({
        id: "cadence",
        tone: "neutral",
        text: `${cadence.style} trader: median hold ${hold}, ~${perDay(cadence.tradesPerDay)} round-trips/day, ${pct(cadence.longShare)} opened long.`,
        source: `Last ${cadence.sample} closed round-trips (indexer)`,
      });
    }
  }

  // 2. Recent form vs lifetime.
  if (cadence && trading && cadence.sample >= 20) {
    const delta = cadence.recentWinRate - trading.winRate;
    if (Math.abs(delta) >= 0.05) {
      const hot = delta > 0;
      out.push({
        id: "form",
        tone: hot ? "good" : "warn",
        text: `${hot ? "Hot hand" : "Cooling off"}: ${pct(cadence.recentWinRate)} win rate on the last ${cadence.sample} trades vs ${pct(trading.winRate)} lifetime (${signedCompactUsd(cadence.recentPnl)} realized).`,
        source: "Round-trip sample vs lifetime overview (indexer)",
      });
    }
  }

  // 3. Capital flows vs PnL — is the equity curve real or swept? Every
  // comparison uses the NET capital (deposits, withdrawals and transfers from
  // other HL accounts together): a wallet funded by a sub-account can
  // withdraw more than it deposited without having taken any profit out.
  if (flows) {
    const parent = flows.linked[0];
    const sweptOut = flows.transfersOut - flows.transfersIn;
    const netOut = -flows.netCapitalIn;
    if (parent && parent.netOut > 0 && pnl.allTime != null && pnl.allTime > 0 && sweptOut >= pnl.allTime * 0.5) {
      out.push({
        id: "sweep",
        tone: "warn",
        text: `Profits swept: ${compactUsd(sweptOut)} moved to ${short(parent.address)} over ${parent.count} transfers vs ${signedCompactUsd(pnl.allTime)} all-time PnL — the equity here does not compound.`,
        source: "HL ledger transfers × exchange PnL",
        href: `/market/tracker/wallet/${parent.address}`,
        hrefLabel: "Open linked account",
      });
    } else if (pnl.allTime != null && pnl.allTime > 0 && netOut >= pnl.allTime * 0.5) {
      out.push({
        id: "flows",
        tone: "neutral",
        text: `Takes profit out: ${compactUsd(netOut)} more withdrawn or sent away than put in, against ${signedCompactUsd(pnl.allTime)} all-time PnL.`,
        source: "HL ledger deposits, withdrawals and transfers × exchange PnL",
      });
    } else if (pnl.allTime != null && pnl.allTime < 0 && flows.netCapitalIn > 0 && Math.abs(pnl.allTime) >= flows.netCapitalIn * 0.25) {
      out.push({
        id: "flows",
        tone: "warn",
        text: `Has burnt ${pct(Math.min(1, Math.abs(pnl.allTime) / flows.netCapitalIn))} of the ${compactUsd(flows.netCapitalIn)} net it put in (${signedCompactUsd(pnl.allTime)} all-time).`,
        source: "HL ledger deposits, withdrawals and transfers × exchange PnL",
      });
    } else if (parent && parent.netOut < 0 && Math.abs(parent.netOut) >= Math.max(10_000, flows.deposits * 0.25)) {
      // A large share of the money came from another HL account, not a deposit.
      out.push({
        id: "funded",
        tone: "neutral",
        text: `Funded from ${short(parent.address)}: ${compactUsd(Math.abs(parent.netOut))} net received over ${parent.count} transfers${
          flows.deposits > 0 ? `, vs ${compactUsd(flows.deposits)} deposited from outside` : ""
        }.`,
        source: "HL ledger transfers",
        href: `/market/tracker/wallet/${parent.address}`,
        hrefLabel: "Open linked account",
      });
    }
  }

  // 3b. Liquidations — the indexer's round-trips exclude them, so a high win
  // rate can sit on top of a history of blow-ups. Say it next to the ratio.
  const dbLiqs = risk.liquidations.count;
  const ledgerLiqs = flows?.liquidationEvents ?? 0;
  if (dbLiqs > 0 || ledgerLiqs > 0) {
    const fromDb = dbLiqs >= ledgerLiqs;
    const count = fromDb ? dbLiqs : ledgerLiqs;
    const notional = fromDb ? risk.liquidations.totalNotional : flows?.liquidatedNotional ?? 0;
    const last = fromDb ? risk.liquidations.last?.time_ms ?? null : null;
    const times = count === 1 ? "once" : `${count}${fromDb && risk.liquidations.hasMore ? "+" : ""} times`;
    const winRateNote =
      trading && trading.winRate >= 0.5 && pnl.allTime != null && pnl.allTime < 0
        ? ` — the ${pct(trading.winRate)} win rate leaves these out, all-time PnL is ${signedCompactUsd(pnl.allTime)}`
        : "";
    out.push({
      id: "liquidations",
      tone: "warn",
      text: `Liquidated ${times} for ${compactUsd(notional)} of notional${last != null ? `, last ${timeAgo(last)} ago` : ""}${winRateNote}.`,
      source: fromDb ? "Liquidations DB × indexer win rate × exchange PnL" : "HL non-funding ledger × exchange PnL",
    });
  }

  // 4. Perp vs spot PnL split.
  if (pnl.allTime != null && pnl.perpAllTime != null) {
    const spot = pnl.allTime - pnl.perpAllTime;
    if (Math.abs(spot) >= Math.max(10_000, Math.abs(pnl.allTime) * 0.2)) {
      const perpSign = pnl.perpAllTime >= 0;
      const spotSign = spot >= 0;
      out.push({
        id: "split",
        tone: perpSign === spotSign ? "neutral" : spotSign ? "warn" : "good",
        text: `Perp ${signedCompactUsd(pnl.perpAllTime)} · spot ${signedCompactUsd(spot)} all-time — ${
          !perpSign && spotSign ? "the spot book carries the perp losses" : perpSign && !spotSign ? "perps earn, spot bleeds" : "both books point the same way"
        }.`,
        source: "HL portfolio allTime vs perpAllTime",
      });
    }
  }

  // 5. Smart-money alignment on the open book.
  if (smartMoney) {
    const against = smartMoney.rows.filter((r) => !r.aligned);
    const biggest = smartMoney.rows[0];
    if (against.length > 0) {
      const a = against[0];
      const cohortSide = a.cohortLongShare >= 0.5 ? "long" : "short";
      const cohortShare = cohortSide === "long" ? a.cohortLongShare : 1 - a.cohortLongShare;
      out.push({
        id: "smart-money",
        tone: "warn",
        text: `Contrarian on ${a.coin}: ${a.side} ${compactUsd(a.notional)} while ${pct(cohortShare)} of smart-money notional is ${cohortSide} (${a.cohortTraders} traders)${
          against.length > 1 ? `, and against the cohort on ${against.length - 1} more` : ""
        }.`,
        source: `Open positions × top-trader positioning (${smartMoney.cohortSize} wallets)`,
      });
    } else if (biggest) {
      const cohortShare = biggest.side === "long" ? biggest.cohortLongShare : 1 - biggest.cohortLongShare;
      out.push({
        id: "smart-money",
        tone: "good",
        text: `With the crowd: ${biggest.side} ${biggest.coin} alongside ${pct(cohortShare)} of smart-money notional (${biggest.cohortTraders} traders).`,
        source: `Open positions × top-trader positioning (${smartMoney.cohortSize} wallets)`,
      });
    }
  }

  // 6. Carry — what the open book costs or earns per day.
  if (carry && Math.abs(carry.dailyUsd) >= 1) {
    const top = carry.rows[0];
    const pays = carry.dailyUsd < 0;
    const perpValue = netWorth.hyperCore > 0 ? Math.abs(carry.dailyUsd) * 365 / netWorth.hyperCore : null;
    out.push({
      id: "carry",
      tone: pays ? "warn" : "good",
      text: `${pays ? "Pays" : "Earns"} ~${compactUsd(Math.abs(carry.dailyUsd))}/day in funding at current rates${
        perpValue != null && perpValue >= 0.02 ? ` (${pct(perpValue)} of net worth a year)` : ""
      }, mostly ${top.side} ${top.coin} at ${top.hlApr.toFixed(1)}% APR.`,
      source: "Open positions × HL predicted funding",
    });
  }

  // 7. Danger — nearest liquidation and margin.
  const nearest = risk.nearest;
  if (nearest && nearest.distance != null && Math.abs(nearest.distance) <= 0.15) {
    out.push({
      id: "liq-distance",
      tone: "warn",
      text: `${nearest.coin} ${nearest.side} ${nearest.leverage > 0 ? `${nearest.leverage}× ` : ""}is ${pct(Math.abs(nearest.distance), 1)} from liquidation${
        risk.marginUtilisation != null ? ` with ${pct(risk.marginUtilisation)} of margin in use` : ""
      }.`,
      source: "HL clearinghouseState",
    });
  } else if (exposure.effectiveLeverage != null && exposure.effectiveLeverage >= 3) {
    out.push({
      id: "leverage",
      tone: "warn",
      text: `Runs ${exposure.effectiveLeverage.toFixed(1)}× effective leverage: ${compactUsd(exposure.grossNotional)} open on the perp account${
        risk.marginUtilisation != null ? `, ${pct(risk.marginUtilisation)} of margin used` : ""
      }.`,
      source: "HL clearinghouseState",
    });
  }

  return out;
}
