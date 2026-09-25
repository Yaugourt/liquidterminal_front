import { useEffect, useMemo, useRef } from "react";
import type { PrivyEvents, PrivyInterface } from "@privy-io/react-auth";
import { getAccessToken, login, logout, subscribeLoginComplete, usePrivyStore } from "./store";
import type { AccessTokenOptions } from "./store";

/**
 * The part of Privy's `usePrivy()` the app relies on. `getAccessToken` also
 * takes `AccessTokenOptions` (see ./store).
 */
export type PrivyAuth = Pick<PrivyInterface, "ready" | "authenticated" | "user" | "login" | "logout"> & {
  getAccessToken: (options?: AccessTokenOptions) => Promise<string | null>;
};

/**
 * Drop-in for Privy's `usePrivy()` that works before the SDK is loaded
 * (`ready` is false until then). The functions are stable.
 */
export function usePrivy(): PrivyAuth {
  const ready = usePrivyStore((s) => s.ready);
  const authenticated = usePrivyStore((s) => s.authenticated);
  const user = usePrivyStore((s) => s.user);
  return useMemo(
    () => ({ ready, authenticated, user, login, logout, getAccessToken }),
    [ready, authenticated, user],
  );
}

/** Drop-in for Privy's `useModalStatus()`. */
export function useModalStatus(): { isOpen: boolean } {
  const isOpen = usePrivyStore((s) => s.modalOpen);
  return useMemo(() => ({ isOpen }), [isOpen]);
}

type LoginCallbacks = Pick<PrivyEvents["login"], "onComplete">;

/**
 * Drop-in for Privy's `useLogin({ onComplete })`: `onComplete` fires when a
 * login completes. Privy also reports an already-authenticated session once,
 * when it starts (`wasAlreadyAuthenticated: true`), to the listeners
 * subscribed at that moment. `onError` is not relayed.
 */
export function useLogin(callbacks?: LoginCallbacks): { login: PrivyInterface["login"] } {
  const onCompleteRef = useRef(callbacks?.onComplete);
  onCompleteRef.current = callbacks?.onComplete;

  useEffect(() => subscribeLoginComplete((params) => onCompleteRef.current?.(params)), []);

  return { login };
}
