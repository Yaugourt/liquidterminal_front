# HIP-4 smoke checklist (post-migration)

Run after deploy or `next build && next start`.

## Routes

- `/hip4` redirects to `/hip4/home`.
- Each slug loads without console errors: `home`, `overview`, `abi`, `events`, `reverts`, `markets`, `mechanics`, `bridge`, `txexamples`, `storage`, `docs`.

## Redirects (`next.config.js`)

- `/docs/hip4` → `/hip4/home` (308).
- `/docs/hip4/overview` → `/hip4/overview`.

## Static downloads

- `/hip4/HIP4Contest.sol`, `.v1.abi`, `.v2.abi`, `.bin` return 200.

## Interactive

- **ABI**: V1/V2 tabs switch JSON panels; keyboard focus visible on tab triggers.
- **Markets**: “Refresh on-chain scan” runs; tables show loading then rows or empty state (RPC-dependent).

## a11y quick pass

- Sub-nav links are focusable; active state visible.
- Code blocks scroll horizontally with keyboard focus on `pre` where present.
