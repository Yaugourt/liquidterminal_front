import { addWallet, getWalletsByUser, removeWalletFromUser } from "../api";

export const useWalletsFetch = () => {
  const fetchWallets = async () => {
    // NOUVEAU: pas besoin de privyUserId
    const response = await getWalletsByUser();
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from server");
    }
    return response.data;
  };

  const fetchAddWallet = async (address: string, name: string) => {
    const normalizedAddress = address.toLowerCase().trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
      throw new Error("Invalid wallet address format");
    }
    // NOUVEAU: pas besoin de privyUserId
    return await addWallet(normalizedAddress, name);
  };

  const fetchRemoveWallet = async (walletId: number) => {
    // NOUVEAU: pas besoin de userId
    return await removeWalletFromUser(walletId);
  };

  return {
    fetchWallets,
    fetchAddWallet,
    fetchRemoveWallet
  };
}; 