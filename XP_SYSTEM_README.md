# 🎮 Système XP/Niveau - Documentation Frontend

## Vue d'ensemble

Le système XP permet de gamifier l'expérience utilisateur sur Liquid Terminal. Les utilisateurs gagnent des points d'expérience (XP) en effectuant diverses actions sur la plateforme, montent en niveau et peuvent se comparer via un leaderboard.

## Architecture

```
src/
├── services/xp/
│   ├── api.ts              # Appels API vers le backend
│   ├── types.ts            # Types TypeScript (XpStats, XpTransaction, etc.)
│   ├── context.tsx         # Context React global pour l'état XP
│   ├── index.ts            # Exports centralisés
│   └── hooks/
│       ├── useXp.ts        # Hook principal pour les stats XP
│       └── useXpLeaderboard.ts  # Hook pour le leaderboard
│
├── components/xp/
│   ├── XpBadge.tsx         # Badge niveau/XP (compact ou full)
│   ├── XpLeaderboard.tsx   # Classement des utilisateurs
│   ├── XpHistoryList.tsx   # Historique des transactions XP
│   ├── XpNotification.tsx  # Provider + toasts de notification
│   └── index.ts            # Exports centralisés
```

## Composants

### `<XpBadge />`

Badge affichant le niveau, la progression et le streak de connexion.

```tsx
// Version compacte (sidebar)
<XpBadge compact showStreak />

// Version complète (page profil)
<XpBadge showStreak className="w-full" />
```

**Props:**
- `compact?: boolean` - Mode compact pour sidebar/header
- `showStreak?: boolean` - Afficher le streak de connexion
- `onClick?: () => void` - Callback personnalisé au clic
- `className?: string` - Classes CSS additionnelles

### `<XpLeaderboard />`

Classement des meilleurs joueurs avec pagination.

```tsx
<XpLeaderboard limit={20} showCurrentUser />
```

**Props:**
- `limit?: number` - Nombre d'entrées par page (défaut: 10)
- `showCurrentUser?: boolean` - Afficher la position de l'utilisateur courant
- `className?: string` - Classes CSS additionnelles

### `<XpHistoryList />`

Historique des transactions XP avec icônes et dates relatives.

```tsx
<XpHistoryList maxItems={10} />
```

**Props:**
- `transactions?: XpTransaction[]` - Transactions externes (optionnel)
- `maxItems?: number` - Limiter le nombre d'éléments affichés
- `className?: string` - Classes CSS additionnelles

### `<XpNotificationProvider />`

Provider qui gère les notifications automatiques pour:
- Daily login bonus
- Level up
- XP gains (via `showXpGainToast`)

```tsx
// Dans Providers.tsx
<XpProvider>
  <XpNotificationProvider>
    {children}
  </XpNotificationProvider>
</XpProvider>
```

## Hooks

### `useXp()`

Hook principal pour accéder aux stats XP.

```tsx
const {
  stats,           // XpStats | null
  history,         // XpTransaction[]
  isLoading,       // boolean
  isLoadingHistory,// boolean
  error,           // Error | null
  refetch,         // () => Promise<void>
  refetchHistory,  // (page?: number) => Promise<void>
  lastLoginResult, // DailyLoginData | null
  historyPagination,
} = useXp();
```

### `useXpLeaderboard(initialLimit)`

Hook pour le leaderboard avec pagination.

```tsx
const {
  leaderboard,     // LeaderboardEntry[]
  userRank,        // number | null
  total,           // number
  isLoading,       // boolean
  error,           // Error | null
  refetch,         // (params?) => Promise<void>
  loadMore,        // () => Promise<void>
  hasMore,         // boolean
  currentPage,     // number
} = useXpLeaderboard(20);
```

## Actions qui donnent de l'XP

| Action | XP | Description |
|--------|-----|-------------|
| `REGISTRATION` | 100 | Bonus de bienvenue |
| `DAILY_LOGIN` | 10 | Connexion quotidienne |
| `LOGIN_STREAK_7` | 50 | Bonus streak 7 jours |
| `LOGIN_STREAK_30` | 200 | Bonus streak 30 jours |
| `REFERRAL_SUCCESS` | 200 | Parrainage réussi |
| `CREATE_READLIST` | 15 | Création d'une readlist |
| `MARK_RESOURCE_READ` | 5 | Marquer une ressource comme lue |
| `COPY_PUBLIC_READLIST` | 10 | Copier une readlist publique |
| `CREATE_WALLETLIST` | 15 | Création d'une wallet list |
| `ADD_WALLET_TO_LIST` | 10 | Ajout d'un wallet à une liste |
| `SUBMIT_PUBLIC_GOOD` | 100 | Soumission d'un public good |
| `PUBLIC_GOOD_APPROVED` | 500 | Public good approuvé |

## Intégration dans les composants

### Afficher un toast XP après une action

```tsx
import { showXpGainToast } from "@/components/xp";

// Après une action réussie qui retourne xpGranted
const response = await addWallet(address, name);
if (response.xpGranted && response.xpGranted > 0) {
  showXpGainToast(response.xpGranted, "Wallet added");
}
```

La fonction `showXpGainToast` :
1. Affiche un toast avec l'XP gagné
2. Déclenche automatiquement un `refetch` des stats XP après 500ms

### Points d'intégration actuels

- **`AddWalletDialog.tsx`** - Ajout de wallet individuel
- **`AddWalletToListDialog.tsx`** - Ajout de wallet à une liste
- **`WalletTabs.tsx`** - Création de wallet list
- **`ReadList.tsx`** - Toggle read status

## Endpoints API

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/xp/stats` | GET | ✅ | Stats XP de l'utilisateur |
| `/xp/daily-login` | POST | ✅ | Enregistrer connexion quotidienne |
| `/xp/history` | GET | ✅ | Historique des transactions |
| `/xp/leaderboard` | GET | ❌ | Classement (userRank si auth) |

## Formule de niveau

Le backend utilise une progression quadratique :

```
XP requis pour niveau N = 100 × N²
```

| Niveau | XP Total Requis |
|--------|-----------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 400 |
| 5 | 2,500 |
| 10 | 10,000 |
| 20 | 40,000 |

## État global (Context)

Le `XpProvider` dans `Providers.tsx` gère :
- Chargement initial des stats à l'authentification
- Daily login automatique (1x par session)
- État partagé entre tous les composants

```tsx
// Providers.tsx
<PrivyProvider>
  <AuthProvider>
    <XpProvider>           {/* État XP global */}
      <XpNotificationProvider>  {/* Notifications */}
        {children}
      </XpNotificationProvider>
    </XpProvider>
  </AuthProvider>
</PrivyProvider>
```

## Stockage local

- `xp_daily_login_date` - Date du dernier daily login (évite les appels redondants)

## Tests manuels

1. **Daily Login**: Se déconnecter, supprimer `xp_daily_login_date` du localStorage, se reconnecter → Toast "+10 XP Daily login bonus"

2. **Wallet List**: Créer une nouvelle wallet list → Toast "+15 XP"

3. **Add Wallet**: Ajouter un wallet à une liste → Toast "+10 XP"

4. **Mark as Read**: Marquer une ressource wiki comme lue → Toast "+5 XP"

5. **Level Up**: Accumuler assez d'XP pour passer au niveau suivant → Toast "Level Up! 🎉"

## Points d'attention

### Performance
- Le `XpContext` centralise les appels API pour éviter les requêtes dupliquées
- Les stats sont rafraîchies automatiquement après chaque gain XP (debounce 500ms)

### UX
- États de chargement avec spinners
- Fallback sur stats par défaut (niveau 1, 0 XP) si pas de données
- Toasts non-bloquants en bas à droite

### Sécurité
- Toutes les routes XP (sauf leaderboard) nécessitent l'authentification
- L'XP est calculé et attribué côté backend uniquement
- Le frontend ne fait qu'afficher et notifier

## Améliorations futures possibles

- [ ] Animations de gain XP plus élaborées
- [ ] Badges/achievements débloquables
- [ ] Notifications push pour les milestones
- [ ] Graphique d'évolution de l'XP dans le temps
- [ ] Système de récompenses à certains niveaux

