/**
 * URL scheme guard against `javascript:` / `data:` / `vbscript:` XSS.
 *
 * React does NOT sanitize `javascript:` URLs at runtime in production (it only
 * warns in development), so any user- or API-supplied value rendered into an
 * `href`/`src` or passed to `window.open` must be validated first. Use this
 * everywhere a link comes from the backend (wiki resources, ecosystem projects,
 * public goods, link previews, …).
 */

const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

/**
 * Returns the URL when its scheme is safe, otherwise `undefined`.
 *
 * - Relative paths (`/…`, `#…`, `?…`) and protocol-relative (`//host`) URLs are
 *   allowed — they inherit the page origin and cannot carry a dangerous scheme.
 * - Absolute URLs are allowed only for http/https/mailto.
 * - `href={safeHref(x)}` with an undefined result makes React omit the attribute
 *   (the anchor becomes inert) instead of rendering an executable link.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (typeof url !== 'string') return undefined;

  const trimmed = url.trim();
  if (trimmed === '') return undefined;

  // Relative / fragment / query / protocol-relative — safe by construction.
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?')
  ) {
    return trimmed;
  }

  try {
    // Resolve against a dummy base so scheme-less values are treated as relative
    // (and therefore safe); absolute values keep their own scheme.
    const parsed = new URL(trimmed, 'https://placeholder.invalid');
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
}
