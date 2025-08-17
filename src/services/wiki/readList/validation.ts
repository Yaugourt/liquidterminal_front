import type { ReadListCreateInput, ReadListItemCreateInput } from './types';

/**
 * Valide les données pour créer une ReadList
 * @param data Données à valider
 * @returns Array d'erreurs (vide si tout est valide)
 */
export const validateReadList = (data: ReadListCreateInput): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (data.name && data.name.length > 255) {
    errors.push('Le nom ne doit pas dépasser 255 caractères');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('La description ne doit pas dépasser 500 caractères');
  }
  
  return errors;
};

/**
 * Valide les données pour créer un ReadListItem
 * @param data Données à valider
 * @returns Array d'erreurs (vide si tout est valide)
 */
export const validateReadListItem = (data: ReadListItemCreateInput): string[] => {
  const errors: string[] = [];
  
  if (!data.resourceId || data.resourceId <= 0) {
    errors.push('ID de ressource invalide');
  }
  
  if (data.notes && data.notes.length > 1000) {
    errors.push('Les notes ne doivent pas dépasser 1000 caractères');
  }
  
  if (data.order !== undefined && data.order < 0) {
    errors.push('L\'ordre doit être positif');
  }
  
  return errors;
}; 