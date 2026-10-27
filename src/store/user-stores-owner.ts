/**
 * Whose data the per-account stores (wallets, wallet lists, read lists) hold.
 * They persist to localStorage, so without this the next person to sign in on
 * the same browser (or the same visitor once signed out) would read the
 * previous account's wallets and lists on pages that never reload them.
 *
 * Kept out of the stores' module graph on purpose: the stores are only
 * imported when an owner change actually has to empty them.
 */
const OWNER_KEY = 'lt-user-stores-owner';
const PERSISTED_KEYS = ['wallets-storage', 'readlists-storage'];

let owner: string | null = null;

const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Call once Privy has answered, with the signed-in user's id or '' for a
 * visitor. Empties the stores when that is not the owner of what they hold.
 * An owner never recorded (data saved before this existed) counts as foreign.
 */
export async function syncUserStoresOwner(next: string): Promise<void> {
  const known = owner ?? readStored(OWNER_KEY);
  if (known === next) {
    owner = next;
    return;
  }
  owner = next;
  const hasPersisted = PERSISTED_KEYS.some((key) => readStored(key) !== null);
  if (known !== null || hasPersisted) {
    try {
      const { resetUserStores } = await import('./reset-user-stores');
      resetUserStores();
    } catch {
      owner = known;
      return;
    }
  }
  try {
    localStorage.setItem(OWNER_KEY, next);
  } catch {
    // Storage blocked: the in-memory owner still covers this tab
  }
}
