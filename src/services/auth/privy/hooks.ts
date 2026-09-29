import { useEffect, useMemo, useRef, useState } from "react";
import type { PrivyEvents, PrivyInterface } from "@privy-io/react-auth";
import { getAccessToken, hasPrivySessionHint, login, logout, subscribeLoginComplete, usePrivyStore } from "./store";
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

/**
 * Whether the visitor is known to be signed out, for sign-in prompts: Privy
 * says so, or (before the SDK has loaded) this browser holds no Privy session
 * at all, so there is nothing for Privy to restore. The prompt then shows at
 * once instead of after the SDK download (up to 10-15 s on a slow network).
 * Storage is read after mount, so the server render and the first client
 * render agree. Anything that needs Privy's own answer keeps reading `ready`.
 */
export function useSignedOut(): boolean {
  const ready = usePrivyStore((s) => s.ready);
  const authenticated = usePrivyStore((s) => s.authenticated);
  const [noStoredSession, setNoStoredSession] = useState(false);

  useEffect(() => {
    setNoStoredSession(!hasPrivySessionHint());
  }, []);

  return !authenticated && (ready || noStoredSession);
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
