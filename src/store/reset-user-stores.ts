import { useWallets, initialWalletsData } from './use-wallets';
import { useReadLists, initialReadListsData } from './use-readlists';
import { useWalletLists, initialWalletListsData } from './use-wallet-lists';

/**
 * Empties every store that holds one account's data (tracked wallets, wallet
 * lists, read lists), in memory and in localStorage. Loads still in flight for
 * the old account find no active list and drop their answer.
 */
export function resetUserStores(): void {
  useWallets.setState(initialWalletsData);
  useReadLists.setState(initialReadListsData);
  useWalletLists.setState(initialWalletListsData);
  try {
    useWallets.persist.clearStorage();
    useReadLists.persist.clearStorage();
  } catch {
    // localStorage unavailable: nothing persisted to clear
  }
}
