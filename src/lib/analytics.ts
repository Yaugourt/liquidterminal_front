import { track } from "@vercel/analytics";

/**
 * Central catalog of Vercel Web Analytics custom events.
 *
 * One function per event keeps names stable (the dashboard groups by exact
 * string) and typechecks the allowed properties. Rules: no PII, no wallet
 * addresses, values limited to string/number/boolean/null, 255 chars max.
 * Custom events require a Vercel Pro/Enterprise plan; on Hobby the calls
 * are no-ops on the dashboard side, so instrumenting is safe either way.
 */

/** A global search result was selected. Track the kind, never the query. */
export function trackSearch(resultType: string): void {
  track("Search", { type: resultType });
}

/** A wiki resource link was opened. `kind` is the detected content type. */
export function trackResourceOpened(kind: string): void {
  track("Wiki Resource Opened", { kind });
}

/** A wiki resource was saved to a read list. */
export function trackResourceSaved(): void {
  track("Wiki Resource Saved");
}

/** Login / connect flow started (before Privy takes over). */
export function trackConnectStarted(location: string): void {
  track("Connect Started", { location });
}

/** Telegram bot call-to-action clicked. */
export function trackBotCta(location: string): void {
  track("Bot CTA", { location });
}
