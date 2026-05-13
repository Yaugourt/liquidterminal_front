/**
 * Privy Service — Token retrieval and logout.
 *
 * Tokens are NOT read from or persisted to localStorage by our code.
 * A React-side bridge (AuthProvider) registers Privy SDK's `getAccessToken` here
 * so axios interceptors can fetch a fresh token from the SDK without leaving React context.
 * On logout, we clear a strict whitelist of known Privy SDK keys as best-effort.
 */

type AccessTokenGetter = () => Promise<string | null>;

let accessTokenGetter: AccessTokenGetter | null = null;
let privyLogout: (() => void) | null = null;

export const registerPrivyAccessTokenGetter = (getter: AccessTokenGetter | null): void => {
  accessTokenGetter = getter;
};

export const registerPrivyLogout = (logout: (() => void) | null): void => {
  privyLogout = logout;
};

/**
 * Get Privy access token via the registered SDK getter.
 * Returns null if no getter has been registered yet (e.g. before AuthProvider mounts).
 */
export const getPrivyToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) return null;
  try {
    const token = await accessTokenGetter();
    return token || null;
  } catch {
    return null;
  }
};

const PRIVY_SDK_KEYS_WHITELIST = [
  'privy:pat',
  'privy:session',
  'privy:token',
  'privy:refresh_token',
  'privy:embedded-wallet:iframe-ready',
  'authToken',
] as const;

/**
 * Best-effort cleanup of known Privy SDK keys.
 * Our own code does not write these — this is purely to flush SDK residue.
 */
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;

  try {
    for (const key of PRIVY_SDK_KEYS_WHITELIST) {
      localStorage.removeItem(key);
    }
  } catch {
    // Silent fail
  }
};

export const handleLogout = async (): Promise<void> => {
  clearAuthTokens();

  if (typeof window === 'undefined') return;

  try {
    if (privyLogout) {
      privyLogout();
      return;
    }
  } catch {
    // Fall through to toast
  }

  try {
    const { toast } = await import('sonner');
    toast.error('Session expired. Please reconnect.', { duration: 5000 });
  } catch {
    // Silent fail
  }
};
