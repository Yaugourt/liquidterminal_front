import { toast } from "sonner";
import { commonMessages, handleApiError } from "./shared";

// Messages pour l'ajout de wallet
export const walletAddMessages = {
  success: (walletName: string) => 
    toast.success(`Wallet "${walletName}" added successfully!`),
  
  error: {
    invalidAddress: () => 
      toast.error("Invalid wallet address. Check the format (0x...)."),
    
    alreadyExists: () => 
      toast.error("This wallet is already associated with your account."),
    
    networkError: commonMessages.networkError,
    serverError: commonMessages.serverError,
    generic: commonMessages.generic
  },
  
  validation: {
    emptyAddress: () => 
      toast.error("Please enter a wallet address."),
    
    invalidFormat: () => 
      toast.error("Invalid address format. Must start with 0x and contain 42 characters."),
    
    walletLimitExceeded: () => 
      toast.error("Maximum number of wallets reached (5 wallets per user). Please remove an existing wallet to add a new one.")
  }
};

// Messages pour la suppression de wallet
export const walletDeleteMessages = {
  success: (walletName: string) => 
    toast.success(`Wallet "${walletName}" deleted successfully!`),
  
  error: {
    notFound: () => 
      toast.error("Wallet not found."),
    
    noPermission: () => 
      toast.error("You don't have permission to delete this wallet."),
    
    networkError: () => 
      toast.error("Connection error during deletion."),
    
    serverError: () => 
      toast.error("Server error during deletion."),
    
    generic: (message?: string) => 
      toast.error(message || "Error deleting wallet.")
  }
};

// Messages pour le chargement des wallets
export const walletLoadMessages = {
  error: {
    networkError: () => 
      toast.error("Unable to load your wallets. Check your connection.", {
        action: { label: "Retry", onClick: () => window.location.reload() }
      }),
    
    serverError: () => 
      toast.error("Server error. Unable to load your wallets."),
    
    noUsername: () => 
      toast.error("Username missing. Please reconnect."),
    
    noToken: () => 
      toast.error("Authentication token missing. Please reconnect."),
    
    generic: (message?: string) => 
      toast.error(message || "Error loading wallets.")
  }
};

// Messages pour la réorganisation des wallets
export const walletReorderMessages = {
  success: () => 
    toast.success("Wallet order updated!"),
  
  error: () => 
    toast.error("Error reordering wallets.")
};

// Messages pour le changement de wallet actif
export const walletActiveMessages = {
  success: (walletName: string) => 
    toast.success(`Wallet "${walletName}" selected.`),
  
  error: () => 
    toast.error("Error changing active wallet.")
};

// Messages pour les états vides
export const walletEmptyMessages = {
  noWallets: () => 
    toast.info("No wallets added. Add your first wallet to get started."),
  
  noActiveWallet: () => 
    toast.warning("No active wallet selected.")
};

// Fonction spécifique pour les wallets (pour la compatibilité)
export const handleWalletApiError = (error: unknown) => {
  // Vérifier si c'est une erreur de limite de wallets
  if (error && typeof error === 'object' && 'code' in error && error.code === 'WALLET_LIMIT_EXCEEDED') {
    return walletAddMessages.validation.walletLimitExceeded();
  }
  
  return handleApiError(error, 'wallet');
};
