import type { FormattedUserTransaction } from "@/services/explorer/address/types";
import type { WalletOverview } from "@/services/market/tracker/wallet-performance";

export type WalletArchetypeId =
  | "vault-depositor"
  | "staker"
  | "market-maker"
  | "twap-executor"
  | "transfer-hub"
  | "perp-trader"
  | "spot-trader";

export interface WalletArchetype {
  id: WalletArchetypeId;
  label: string;
  /** The rule that fired, with its numbers — surfaced as a tooltip so the
   *  badge is never a black box. */
  reason: string;
}

interface WalletArchetypeInput {
  /** Recent transactions (the RPC caps `userDetails` to the latest few thousand). */
  transactions: FormattedUserTransaction[] | null;
  overview: WalletOverview | null;
  balances: {
    totalBalance: number;
    vaultBalance: number;
    stakedBalance: number;
  } | null;
}

const TRANSFER_METHODS = new Set([
  "usdSend",
  "spotSend",
  "deposit",
  "withdraw",
  "accountClassTransfer",
  "usdClassTransfer",
  "internalTransfer",
  "subAccountTransfer",
  "subAccountSpotTransfer",
  "cDeposit",
  "cWithdraw",
  "vaultDeposit",
  "vaultTransfer",
]);

const isSpotCoin = (coin: string) => coin.startsWith("@") || coin.includes("/");
const isFillRow = (tx: FormattedUserTransaction) =>
  tx.isLong === true || tx.isShort === true || tx.isClose === true;

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

/**
 * Heuristic "who is this wallet?" classifier — first matching rule wins, and
 * `null` when nothing is conclusive (we would rather show no badge than a
 * wrong one). Every rule is a plain ratio over data the page already fetches;
 * no scoring, no ML. Thresholds are deliberately conservative.
 */
export function classifyWallet(input: WalletArchetypeInput): WalletArchetype | null {
  const { transactions, overview, balances } = input;

  // 1–2. Capital allocation dominates: a wallet parking >50% of its net worth
  //      in vaults / staking is that first, whatever it trades on the side.
  if (balances && balances.totalBalance > 0) {
    const vaultShare = balances.vaultBalance / balances.totalBalance;
    if (vaultShare >= 0.5) {
      return {
        id: "vault-depositor",
        label: "Vault depositor",
        reason: `${Math.round(vaultShare * 100)}% of net worth sits in vaults`,
      };
    }
    const stakedShare = balances.stakedBalance / balances.totalBalance;
    if (stakedShare >= 0.5) {
      return {
        id: "staker",
        label: "Staker",
        reason: `${Math.round(stakedShare * 100)}% of net worth is staked HYPE`,
      };
    }
  }

  // The merged transaction list mixes fills (up to 2 000 from `userFills`)
  // with signed actions (a few hundred from the RPC), so ratios are taken
  // over *intents* (orders / cancels / TWAPs / modifies) and fills separately.
  const txs = transactions ?? [];
  let orders = 0;
  let cancels = 0;
  let twaps = 0;
  let transfers = 0;
  let perpFills = 0;
  let spotFills = 0;
  for (const tx of txs) {
    const m = tx.method;
    if (isFillRow(tx)) {
      if (isSpotCoin(tx.token)) spotFills += 1;
      else perpFills += 1;
    } else if (m.startsWith("cancel") || m === "scheduleCancel") cancels += 1;
    else if (m === "twapOrder") twaps += 1;
    else if (m === "order" || m === "Buy" || m === "Sell" || m === "modify" || m === "batchModify") orders += 1;
    else if (TRANSFER_METHODS.has(m)) transfers += 1;
  }
  const intents = orders + cancels + twaps;
  const actions = intents + transfers;
  const lifetimeFills = overview?.fill_count ?? 0;
  // Lifetime traded notional per dollar of net worth — a bot recycles its
  // capital thousands of times, a discretionary trader tens of times.
  const turnover =
    overview && balances && balances.totalBalance >= 1_000
      ? overview.total_volume / balances.totalBalance
      : null;

  // 3. Market maker / HFT: a very deep fill history plus either a cancel-heavy
  //    order flow or an absurd capital turnover. The fill floor keeps a human
  //    tidying a grid of resting orders out of this bucket.
  const cancelHeavy = intents >= 50 && cancels / intents >= 0.3;
  const hyperactive = turnover != null && turnover >= 2_000;
  if (lifetimeFills >= 10_000 && (cancelHeavy || hyperactive)) {
    const facts = [
      cancelHeavy ? `${pct(cancels, intents)}% of recent order intents are cancels` : null,
      hyperactive ? `${Math.round(turnover).toLocaleString("en-US")}× capital turnover` : null,
      `${lifetimeFills.toLocaleString("en-US")} lifetime fills`,
    ].filter(Boolean);
    return { id: "market-maker", label: "Market maker · HFT", reason: facts.join(" · ") };
  }

  // 4. TWAP executor: a meaningful share of intents are TWAPs.
  if (twaps >= 5 && twaps / intents >= 0.2) {
    return {
      id: "twap-executor",
      label: "TWAP executor",
      reason: `${pct(twaps, intents)}% of recent order intents are TWAPs`,
    };
  }

  // 5. Transfer hub: mostly moves funds around, barely trades.
  if (actions >= 10 && transfers / actions >= 0.6 && lifetimeFills < 50 && perpFills + spotFills < 50) {
    return {
      id: "transfer-hub",
      label: "Transfer hub",
      reason: `${pct(transfers, actions)}% of recent actions are transfers · under 50 fills`,
    };
  }

  // 6. Plain trader: perp or spot, by where its recent fills land.
  if (perpFills + spotFills >= 10) {
    return perpFills >= spotFills
      ? {
          id: "perp-trader",
          label: "Perp trader",
          reason: `${perpFills} perp vs ${spotFills} spot fills in recent activity`,
        }
      : {
          id: "spot-trader",
          label: "Spot trader",
          reason: `${spotFills} spot vs ${perpFills} perp fills in recent activity`,
        };
  }

  return null;
}
