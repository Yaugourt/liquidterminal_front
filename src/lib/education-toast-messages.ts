import { toast } from "sonner";

// Messages pour les read lists
export const readListMessages = {
  success: {
    addedToList: (listName: string) => 
      toast.success(`Added to "${listName}" successfully!`),
    
    removedFromList: () => 
      toast.success(`Removed from list successfully!`),
    
    listCreated: (listName: string) => 
      toast.success(`Read list "${listName}" created successfully!`),
    
    
    listUpdated: (listName: string) => 
      toast.success(`Read list "${listName}" updated successfully!`),
    
    itemMarkedAsRead: () => 
      toast.success(`Marked as read!`),
    
    itemMarkedAsUnread: () => 
      toast.success(`Marked as unread!`),
  },
  
  error: {
    addToList: (listName: string) => 
      toast.error(`Failed to add to "${listName}". Please try again.`),
    
    removeFromList: (listName: string) => 
      toast.error(`Failed to remove from "${listName}". Please try again.`),
    
    createList: () => 
      toast.error("Failed to create read list. Please try again."),
    
    deleteList: () => 
      toast.error("Failed to delete read list. Please try again."),
    
    updateList: () => 
      toast.error("Failed to update read list. Please try again."),
    
    toggleReadStatus: () => 
      toast.error("Failed to update read status. Please try again."),
    
    networkError: () => 
      toast.error("Connection error. Check your internet connection.", {
        action: { label: "Retry", onClick: () => window.location.reload() }
      }),
    
    serverError: () => 
      toast.error("Server error. Please try again later."),
    
    generic: (message?: string) => 
      toast.error(message || "An error occurred. Please try again.", {
        action: { label: "Retry", onClick: () => window.location.reload() }
      })
  },
  
  validation: {
    listNameRequired: () => 
      toast.error("Please enter a name for your read list."),
    
    listNameTooLong: () => 
      toast.error("Read list name is too long. Maximum 50 characters."),
    
    descriptionTooLong: () => 
      toast.error("Description is too long. Maximum 200 characters."),
    
    noListsAvailable: () => 
      toast.warning("No read lists available. Create one first!"),
  }
};

// Fonction utilitaire pour gérer les erreurs d'API des read lists
export const handleReadListApiError = (error: unknown, operation: string) => {
  if (error && typeof error === 'object' && 'response' in error && error.response) {
    const response = error.response as { status?: number };
    switch (response.status) {
      case 400:
        return readListMessages.error.generic("Invalid data provided");
      case 401:
        return toast.error("Session expired. Please reconnect.");
      case 403:
        return readListMessages.error.generic("Access denied");
      case 404:
        return readListMessages.error.generic("Resource not found");
      case 409:
        return readListMessages.error.generic("A read list with this name already exists");
      case 500:
        return readListMessages.error.serverError();
      default:
        return readListMessages.error.generic();
    }
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code as string;
    if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') {
      return readListMessages.error.networkError();
    }
  }
  
  const errorMessage = error && typeof error === 'object' && 'message' in error 
    ? (error.message as string) 
    : `Failed to ${operation}`;
  return readListMessages.error.generic(errorMessage);
}; 