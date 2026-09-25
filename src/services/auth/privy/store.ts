import type { ComponentType } from "react";
import { create } from "zustand";
import { toast } from "sonner";
import type { PrivyEvents, PrivyInterface, User } from "@privy-io/react-auth";

/**
 * Privy, loaded on demand.
 *
 * The Privy SDK and the wallet stacks it bundles (viem, WalletConnect,
 * Coinbase, Solana, x402…) weigh ~380 KB gzipped as their own chunk. They
 * used to sit in the entry JS of every app route (~600 KB gzipped there)
 * through a <PrivyProvider> wrapping the tree.
 * Now the provider lives in a separate chunk (`./PrivyRoot`) mounted as a
 * sibling of the app, and a bridge mirrors what the app reads from it into
 * this store:
 *
 * - `ready` / `authenticated` / `user` / modal state: same values as Privy's
 *   hooks, `ready` stays false until the chunk is loaded AND Privy is ready.
 * - `login` / `logout` / `getAccessToken`: stable wrappers that call Privy
 *   once it is there. A `login()` before that is queued and replayed when
 *   Privy becomes ready. `getAccessToken()` answers `null` until then,
 *   unless asked to wait for a stored session (`waitForSession`, used by API
 *   calls flagged `awaitAuth`): API calls don't all stall on the SDK download.
 *
 * Components use the hooks from `@/services/auth/privy`, never the SDK
 * directly (ESLint enforces it): the SDK is only reachable through the
 * dynamic import below.
 */

type LoginCompleteParams = Parameters<NonNullable<PrivyEvents["login"]["onComplete"]>>[0];
type LoginOptions = Parameters<PrivyInterface["login"]>[0];

export interface PrivyDelegates {
  login: PrivyInterface["login"];
  logout: PrivyInterface["logout"];
  getAccessToken: PrivyInterface["getAccessToken"];
}

export interface AccessTokenOptions {
  /**
   * Privy not loaded yet and the browser holds a session: wait for it (up to
   * TOKEN_WAIT_MS) instead of answering `null` right away.
   */
  waitForSession?: boolean;
}

export interface PrivySnapshot {
  ready: boolean;
  authenticated: boolean;
  user: User | null;
  modalOpen: boolean;
}

interface PrivyStoreState extends PrivySnapshot {
  /** The loaded `PrivyRoot` component, rendered by `<LazyPrivy />`. */
  Root: ComponentType | null;
}

const INITIAL_SNAPSHOT: PrivySnapshot = {
  ready: false,
  authenticated: false,
  user: null,
  modalOpen: false,
};

export const usePrivyStore = create<PrivyStoreState>()(() => ({
  ...INITIAL_SNAPSHOT,
  Root: null,
}));

/**
 * How long an `awaitAuth` API call of a signed-in visitor waits for Privy's
 * client before going out without a token (see `getAccessToken`). Only a
 * pathological download hits it: a failed load releases the waiters at once.
 */
const TOKEN_WAIT_MS = 10_000;

let delegates: PrivyDelegates | null = null;
let pendingLogin: { options: LoginOptions } | null = null;
let loadPromise: Promise<void> | null = null;
/** Last download failed: token lookups stop waiting for (and re-fetching) it. */
let loadFailed = false;
const delegateWaiters = new Set<() => void>();
const loginCompleteListeners = new Set<(params: LoginCompleteParams) => void>();

const releaseDelegateWaiters = (): void => {
  const waiters = [...delegateWaiters];
  delegateWaiters.clear();
  waiters.forEach((release) => release());
};

// localStorage keys / cookies Privy writes for a session or an OAuth flow in
// progress (@privy-io/js-sdk-core). Only their presence is checked: the values
// are never read here.
const SESSION_STORAGE_KEYS = [
  "privy:token",
  "privy:refresh_token",
  "privy:pat",
  "privy:state_code",
  "privy:code_verifier",
] as const;
const SESSION_COOKIE = /(?:^|;\s*)privy-(?:token|refresh-token|id-token|session)=/;
const OAUTH_RETURN_PARAMS = ["privy_oauth_code", "privy_oauth_state", "privy_oauth_provider"] as const;

/**
 * Whether this browser probably holds a Privy session (or is coming back from
 * the Twitter OAuth redirect). Decides WHEN Privy loads, never whether the
 * visitor is authenticated: that answer only comes from Privy itself.
 */
export function hasPrivySessionHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (SESSION_STORAGE_KEYS.some((key) => window.localStorage.getItem(key) !== null)) return true;
  } catch {
    // Storage blocked: fall through to the other signals.
  }
  try {
    if (SESSION_COOKIE.test(document.cookie)) return true;
  } catch {
    // Cookies blocked.
  }
  try {
    const params = new URLSearchParams(window.location.search);
    if (OAUTH_RETURN_PARAMS.some((param) => params.has(param))) return true;
  } catch {
    // Malformed URL.
  }
  return false;
}

/**
 * Fetch the Privy chunk (once). Note that Turbopack's runtime caches a failed
 * chunk load for the lifetime of the page, so a retry only succeeds after a
 * reload (see `login`).
 */
export function loadPrivy(): Promise<void> {
  if (!loadPromise) {
    loadFailed = false;
    loadPromise = import("./PrivyRoot").then(
      (mod) => {
        usePrivyStore.setState({ Root: mod.default });
      },
      (error: unknown) => {
        loadPromise = null;
        loadFailed = true;
        // Signed-in visitors' requests must not wait for a chunk that failed.
        releaseDelegateWaiters();
        console.error("Failed to load the Privy SDK", error);
      },
    );
  }
  return loadPromise;
}

const waitForDelegates = (timeoutMs: number): Promise<void> =>
  new Promise((resolve) => {
    const release = () => {
      clearTimeout(timer);
      delegateWaiters.delete(release);
      resolve();
    };
    const timer = setTimeout(release, timeoutMs);
    delegateWaiters.add(release);
  });

/** Same contract as Privy's `login`; queued until Privy is ready. */
export function login(options?: LoginOptions): void {
  if (delegates && usePrivyStore.getState().ready) {
    delegates.login(options);
    return;
  }
  // Replayed by the bridge once Privy is ready, unless the stored session
  // turns out to be authenticated already.
  pendingLogin = { options };
  void loadPrivy().then(() => {
    if (!loadFailed || !pendingLogin) return;
    // The download failed (network, or a deploy removed the chunk): say so
    // rather than leaving "Connect" silently dead.
    pendingLogin = null;
    toast.error("Login is unavailable right now.", {
      description: "Reload the page to try again.",
      action: { label: "Reload", onClick: () => window.location.reload() },
    });
  });
}

/**
 * Same contract as Privy's `logout`. Only reachable while authenticated,
 * which implies Privy is loaded; before that there is nothing to log out.
 */
export async function logout(): Promise<void> {
  if (delegates) await delegates.logout();
}

/**
 * Same contract as Privy's `getAccessToken` once Privy is loaded. Before
 * that: `null`, or — with `waitForSession` and a stored session — the token
 * once Privy's client is up, as when Privy was in the entry bundle.
 */
export async function getAccessToken(options?: AccessTokenOptions): Promise<string | null> {
  if (!delegates) {
    if (!options?.waitForSession || loadFailed || !hasPrivySessionHint()) return null;
    void loadPrivy();
    await waitForDelegates(TOKEN_WAIT_MS);
  }
  return delegates ? delegates.getAccessToken() : null;
}

export function subscribeLoginComplete(listener: (params: LoginCompleteParams) => void): () => void {
  loginCompleteListeners.add(listener);
  return () => {
    loginCompleteListeners.delete(listener);
  };
}

/** Drop a queued login (the app shell unmounted before Privy was ready). */
export function cancelPendingLogin(): void {
  pendingLogin = null;
}

/**
 * Called by the bridge inside `PrivyRoot` only. Kept apart from the hooks so
 * nothing else can push state into the mirror.
 */
export const privyBridge = {
  setDelegates(next: PrivyDelegates | null): void {
    delegates = next;
    if (next) releaseDelegateWaiters();
  },
  setSnapshot(next: PrivySnapshot): void {
    usePrivyStore.setState(next);
    if (next.ready && pendingLogin && delegates) {
      const { options } = pendingLogin;
      pendingLogin = null;
      if (!next.authenticated) delegates.login(options);
    }
  },
  reset(): void {
    delegates = null;
    pendingLogin = null;
    usePrivyStore.setState(INITIAL_SNAPSHOT);
  },
  emitLoginComplete(params: LoginCompleteParams): void {
    loginCompleteListeners.forEach((listener) => listener(params));
  },
};
