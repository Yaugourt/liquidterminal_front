import { toast } from "sonner";
import { commonMessages, handleApiError } from "./shared";

// Messages pour les read lists
export const readListMessages = {
  success: {
    addedToList: (listName: string) => 
      toast.success(`Added to "${listName}" successfully!`),
    
    removedFromList: (listName?: string) => 
      toast.success(`Removed from ${listName ? `"${listName}"` : 'list'} successfully!`),
    
    listCreated: (listName: string) => 
      toast.success(`Read list "${listName}" created successfully!`),
    
    listUpdated: (listName: string) => 
      toast.success(`Read list "${listName}" updated successfully!`),
    
    itemMarkedAsRead: () => 
      toast.success(`Marked as read!`),
    
    itemMarkedAsUnread: () => 
      toast.success(`Marked as unread!`),
    
    listDeleted: () => 
      toast.success(`Read list deleted successfully!`),
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
    
    networkError: commonMessages.networkError,
    serverError: commonMessages.serverError,
    generic: commonMessages.generic
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

// Fonction spécifique pour les read lists (pour la compatibilité)
export const handleReadListApiError = (error: unknown) => {
  return handleApiError(error, 'readList');
};
