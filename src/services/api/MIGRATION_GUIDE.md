# Guide de Migration - API Sécurisée

Ce guide explique comment migrer vos fichiers API pour utiliser la nouvelle configuration sécurisée.

## 🔄 Étapes de Migration

### 1. Remplacer axios/fetch par apiClient

**Avant :**
```typescript
import axios from 'axios';
import { API_URLS } from '../api/base';

const response = await axios.post(`${API_URLS.LOCAL_BACKEND}/endpoint`, data, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Après :**
```typescript
import { apiClient } from '../api/axios-config';

const response = await apiClient.post('/endpoint', data);
// Token ajouté automatiquement !
```

### 2. Ajouter la validation des données

**Avant :**
```typescript
export const addWallet = async (address: string, name?: string) => {
  const response = await axios.post('/wallet', { address, name });
  return response.data;
};
```

**Après :**
```typescript
import { validateInput, SecuritySchemas } from '../api/security-middleware';
import { z } from 'zod';

const AddWalletSchema = z.object({
  address: SecuritySchemas.address,
  name: SecuritySchemas.name.optional(),
});

export const addWallet = async (address: string, name?: string) => {
  const validated = validateInput(AddWalletSchema)({ address, name });
  const response = await apiClient.post('/wallet', validated);
  return response.data;
};
```

### 3. Simplifier la gestion d'erreurs

**Avant :**
```typescript
try {
  // ...
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw { message: 'Unauthorized' };
    }
    // Plus de conditions...
  }
  throw error;
}
```

**Après :**
```typescript
try {
  // ...
} catch (error: any) {
  // Les erreurs sont déjà formatées
  if (error.success === false) {
    throw error;
  }
  throw {
    success: false,
    message: error.message || 'Une erreur est survenue',
    code: 'ERROR_CODE'
  };
}
```

## 📋 Checklist de Migration

Pour chaque fichier API :

- [ ] Remplacer `import axios` par `import { apiClient }`
- [ ] Supprimer l'ajout manuel du token Bearer
- [ ] Ajouter les schémas de validation Zod
- [ ] Utiliser `validateInput()` sur les paramètres
- [ ] Simplifier la gestion d'erreurs
- [ ] Tester que tout fonctionne

## 🛡️ Schémas de Sécurité Disponibles

```typescript
SecuritySchemas.address      // Adresse Ethereum/Hyperliquid
SecuritySchemas.name         // Nom sécurisé (anti-XSS)
SecuritySchemas.privyUserId  // ID utilisateur Privy
SecuritySchemas.amount       // Montant numérique
SecuritySchemas.pagination   // Paramètres de pagination
```

## 💡 Exemple Complet

```typescript
import { apiClient } from '../api/axios-config';
import { validateInput, SecuritySchemas } from '../api/security-middleware';
import { z } from 'zod';

// Définir le schéma
const TransferSchema = z.object({
  from: SecuritySchemas.address,
  to: SecuritySchemas.address,
  amount: SecuritySchemas.amount,
  memo: z.string().max(200).optional(),
});

// Fonction API
export const transferFunds = async (params: z.infer<typeof TransferSchema>) => {
  try {
    // Validation automatique
    const validated = validateInput(TransferSchema)(params);
    
    // Requête (token ajouté automatiquement)
    const response = await apiClient.post('/transfer', validated);
    
    return response.data;
  } catch (error: any) {
    if (error.success === false) throw error;
    
    throw {
      success: false,
      message: error.message || 'Transfer failed',
      code: 'TRANSFER_ERROR'
    };
  }
};
```

## ⚠️ Points d'Attention

1. **Ne pas oublier** d'ajouter `ApiClientProvider` dans les providers
2. **Toujours valider** les inputs utilisateur
3. **Utiliser** `hyperliquidClient` pour les appels directs à Hyperliquid
4. **Tester** après migration pour vérifier que tout fonctionne

## 🚀 Avantages

- ✅ Token automatiquement ajouté
- ✅ Retry automatique sur 401
- ✅ Protection XSS/Injection
- ✅ Erreurs formatées
- ✅ Rate limiting intégré
- ✅ Logs en développement 