/**
 * Bridge events emitted by Hyperliquid's USDC bridge with Arbitrum.
 *
 * The bridge handles USDC exclusively — no token/asset field exists on the
 * payload. Every user-facing transfer surfaces as multiple events because
 * each validator vote is logged separately (dedupe by `nonce` if you only
 * want unique transfers).
 *
 * Event-type lifecycle:
 *  - `deposit_vote`         — validator votes for an Arbitrum→HL USDC deposit
 *  - `withdraw3`            — user-initiated HL→Arbitrum withdrawal
 *  - `withdrawal_sign`      — validator signs the pending withdrawal
 *  - `withdrawal_finalized` — withdrawal confirmed on Arbitrum
 */
type EvmBridgeEventType =
  | "deposit_vote"
  | "withdraw3"
  | "withdrawal_sign"
  | "withdrawal_finalized"
  | (string & {});

export interface EvmBridgeEvent {
  event_type: EvmBridgeEventType;
  user_addr: string;
  /** Amount in USDC, already parsed (e.g. `4048.84`). */
  amount: number;
  time: string;
  block_height?: number;
  validator?: string;
  destination?: string;
  nonce?: number;
  /** Raw HL action payload, JSON-encoded. Debug-only. */
  raw?: string;
}

/** True for events that move USDC INTO Hyperliquid (deposits). */
export function isDepositEvent(e: Pick<EvmBridgeEvent, "event_type">): boolean {
  return e.event_type.startsWith("deposit");
}

/** True for events that move USDC OUT of Hyperliquid (withdrawals, any stage). */
export function isWithdrawalEvent(e: Pick<EvmBridgeEvent, "event_type">): boolean {
  return e.event_type.startsWith("withdraw");
}

// Hook result types
export interface UseEvmBridgeEventsResult {
  events: EvmBridgeEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
