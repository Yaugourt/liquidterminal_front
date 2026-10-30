/**
 * Raw TWAP statuses that can never be followed by another one, the same set
 * as the backend's live feed: finished, terminated, stopped, canceled,
 * cancelled and any 'error...'. 'activated' and 'waitingForTrigger' are not
 * terminal: a TWAP waiting for its trigger can be activated afterwards.
 */
const TERMINAL_STATUSES: ReadonlySet<string> = new Set(['finished', 'terminated', 'stopped', 'canceled', 'cancelled']);

export function isTerminal(status: string): boolean {
  return status.startsWith('error') || TERMINAL_STATUSES.has(status);
}
