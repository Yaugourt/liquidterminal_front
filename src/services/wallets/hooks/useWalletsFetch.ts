import { addWallet, getWalletsByUser, removeWalletFromUser } from "../api";

export const useWalletsFetch = () => {
  const fetchWallets = async (privyUserId: string | number) => {
    const response = await getWalletsByUser(String(privyUserId));
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }
    return response.data;
  };

  const fetchAddWallet = async (address: string, name: string, privyUserId: string | number) => {
    const normalizedAddress = address.toLowerCase().trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
      throw new Error("Invalid wallet address format");
    }
    return await addWallet(normalizedAddress, name, String(privyUserId));
  };

  const fetchRemoveWallet = async (userId: number, walletId: number) => {
    return await removeWalletFromUser(userId, walletId);
  };

  return {
    fetchWallets,
    fetchAddWallet,
    fetchRemoveWallet
  };
}; 