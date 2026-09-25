// Privy facade: the SDK itself is loaded on demand (see ./store.ts).
// Never re-export ./PrivyRoot here — it must stay behind the dynamic import.
export { usePrivy, useModalStatus, useLogin } from "./hooks";
export type { PrivyAuth } from "./hooks";
export type { AccessTokenOptions } from "./store";
export { LazyPrivy } from "./LazyPrivy";
