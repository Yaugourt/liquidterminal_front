import { toast } from "sonner";

// Messages pour l'ajout de wallet
export const walletAddMessages = {
  success: (walletName: string) => 
    toast.success(`Wallet "${walletName}" added successfully!`),
  
  error: {
    invalidAddress: () => 
      toast.error("Invalid wallet address. Check the format (0x...)."),
    
    alreadyExists: () => 
      toast.error("This wallet is already associated with your account."),
    
    networkError: () => 
      toast.error("Connection error. Check your internet connection.", {
        action: { label: "Retry", onClick: () => window.location.reload() }
      }),
    
    serverError: () => 
      toast.error("Server error. Please try again later."),
    
    generic: (message?: string) => 
      toast.error(message || "Error adding wallet.", {
        action: { label: "Retry", onClick: () => window.location.reload() }
      })
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

// Fonction utilitaire pour gérer les erreurs d'API
export const handleWalletApiError = (error: unknown) => {
  // Vérifier si c'est une erreur de limite de wallets
  if (error && typeof error === 'object' && 'code' in error && error.code === 'WALLET_LIMIT_EXCEEDED') {
    return walletAddMessages.validation.walletLimitExceeded();
  }
  
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const response = error.response as { status?: number };
    switch (response.status) {
      case 400:
        // Vérifier si c'est une erreur de limite de wallets dans la réponse
        if (error && typeof error === 'object' && 'code' in error && error.code === 'WALLET_LIMIT_EXCEEDED') {
          return walletAddMessages.validation.walletLimitExceeded();
        }
        return walletAddMessages.error.invalidAddress();
      case 401:
        return toast.error("Session expired. Please reconnect.");
      case 403:
        return walletDeleteMessages.error.noPermission();
      case 404:
        return walletDeleteMessages.error.notFound();
      case 409:
        return walletAddMessages.error.alreadyExists();
      case 500:
        return walletAddMessages.error.serverError();
      default:
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error.message as string) 
          : 'Unknown error';
        return walletAddMessages.error.generic(errorMessage);
    }
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code as string;
    if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') {
      return walletAddMessages.error.networkError();
    }
  }
  
  const errorMessage = error && typeof error === 'object' && 'message' in error 
    ? (error.message as string) 
    : 'Unknown error';
  return walletAddMessages.error.generic(errorMessage);
};