# Erreurs ESLint - Plan de Correction

## 📊 Résumé
- **Total d'erreurs** : ~200 erreurs
- **Fichiers concernés** : ~50 fichiers
- **Priorité** : Corriger par catégorie pour éviter les régressions

---

## 🔧 Erreurs de Syntaxe (CRITIQUE - À corriger en premier)

### 1. Erreur de parsing dans `src/services/auth/user/api.ts`
```
./src/services/auth/user/api.ts:15:37  Error: Parsing error: ',' expected.
```
**Action** : Vérifier la syntaxe de la fonction `_fetchAdminUsers`

---

## 🚫 Variables non utilisées (FACILE - À corriger en priorité)

### 1. Variables assignées mais jamais utilisées
- ✅ `src/app/market/perp/[token]/page.tsx:38` - `params` - **CORRIGÉ**
- ✅ `src/components/Header.tsx:29` - `displayTitle` - **CORRIGÉ**
- ✅ `src/components/dashboard/chart/ChartDisplay.tsx:94` - `isAuctionTabActive` - **CORRIGÉ**
- ✅ `src/components/dashboard/chart/ChartDisplay.tsx:95` - `isPastAuctionTabActive` - **CORRIGÉ**
- ✅ `src/components/dashboard/tokens/TokensHeader.tsx:19` - `title` - **CORRIGÉ**
- ✅ `src/components/education/EducationModal.tsx:4` - `DialogHeader`, `DialogTitle` - **CORRIGÉ**
- ✅ `src/components/education/ResourceCard.tsx:38` - `previewError` - **CORRIGÉ**
  - ✅ `src/components/explorer/StatsCard.tsx:2` - `Coins` - **CORRIGÉ**
  - ✅ `src/components/explorer/StatsGrid.tsx:5` - `ExplorerStatsCardProps` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/StakingTable.tsx:52` - `delegatorSummaryLoading` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/StakingTable.tsx:53` - `delegatorSummaryError` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/StakingTable.tsx:62` - `historyTotal` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/TransactionList.tsx:8` - `formatNumberValue`, `calculateValue`, `HIP2_ADDRESS` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/TransactionList.tsx:26` - `spotLoading` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/TransactionList.tsx:193` - `index` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/VaultDepositList.tsx:1` - `useMemo` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/VaultDepositList.tsx:17` - `vaults` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/cards/OverviewCard.tsx:9` - `getIcon` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/cards/PnLCard.tsx:3` - `Percent`, `DollarSign` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/orders/OrderTableContent.tsx:26` - `address` - **CORRIGÉ**
  - ✅ `src/components/explorer/address/orders/OrderTableContent.tsx:29` - `format` - **CORRIGÉ**
  - ✅ `src/components/explorer/block/BlockHeader.tsx:6` - `format` - **CORRIGÉ**
  - ✅ `src/components/explorer/block/TransactionList.tsx:3` - `useCallback`, `useMemo` - **CORRIGÉ**
  - ✅ `src/components/explorer/block/TransactionList.tsx:7` - `format` - **CORRIGÉ**
  - ✅ `src/components/explorer/transaction/TransactionFormatter.tsx:1` - `FormattedTransactionField` - **CORRIGÉ**
  - ✅ `src/components/explorer/transaction/TransactionFormatter.tsx:2` - `format` - **CORRIGÉ**
  - ✅ `src/components/explorer/vaultValidatorSum/TabButtons.tsx:1` - `Button` - **CORRIGÉ**
  - ✅ `src/components/explorer/vaultValidatorSum/TableContent.tsx:4` - `Button` - **CORRIGÉ**
  - ✅ `src/components/explorer/vaultValidatorSum/ValidatorsVaults.tsx:132` - `isLoading` - **CORRIGÉ**
  - ✅ `src/components/explorer/vaultValidatorSum/ValidatorsVaults.tsx:133` - `error` - **CORRIGÉ**
  - ✅ `src/components/explorer/vaultValidatorSum/ValidatorsVaults.tsx:153` - `headerInfo` - **CORRIGÉ**
  - ✅ `src/components/market/common/TokensSection.tsx:4` - `Card` - **CORRIGÉ**
  - ✅ `src/components/market/common/TrendingTokensCard.tsx:183` - `index` - **CORRIGÉ**
  - ✅ `src/components/market/spot/auction/AuctionChart.tsx:96` - `formatValue` - **CORRIGÉ**
  - ✅ `src/components/market/spot/auction/AuctionChart.tsx:105` - `formatOptions` - **CORRIGÉ**
  - ✅ `src/components/market/spot/auction/AuctionTable.tsx:69` - `locale` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectBulkActions.tsx:3` - `useMemo` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectBulkActions.tsx:28` - `showBulkActions` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectBulkActions.tsx:49` - `error` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectModal.tsx:134` - `error` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectModal.tsx:148` - `error` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectsGrid.tsx:125` - `error` - **CORRIGÉ**
  - ✅ `src/components/project/ProjectsGrid.tsx:147` - `error` - **CORRIGÉ**
  - ✅ `src/components/user/UserManagement.tsx:32` - `isDeleting` - **CORRIGÉ**
  - ✅ `src/components/user/UserManagement.tsx:65` - `error` - **CORRIGÉ**
  - ✅ `src/components/user/UserManagement.tsx:78` - `error` - **CORRIGÉ**
  - ✅ `src/components/user/UserManagement.tsx:117` - `error` - **CORRIGÉ**
  - ✅ `src/components/validator/StakersTable.tsx:2` - `ExternalLink`, `Loader2` - **CORRIGÉ**
  - ✅ `src/components/validator/ValidatorTable.tsx:17` - `stats` - **CORRIGÉ**
  - ✅ `src/components/validator/ValidatorTable.tsx:45` - `subTab` - **CORRIGÉ**
  - ✅ `src/components/validator/chart/StakingLineChart.tsx:17` - `height` - **CORRIGÉ**
  - ✅ `src/components/validator/chart/StakingLineChart.tsx:27` - `label` - **CORRIGÉ**
  - ✅ `src/components/validator/chart/UnstakingScheduleChart.tsx:39` - `label` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultChart.tsx:8` - `useChartPeriod`, `useChartData` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultChart.tsx:34` - `format` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultChartDisplay.tsx:92` - `format` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultChartDisplay.tsx:126` - `label` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultSection.tsx:9` - `formatNumber` - **CORRIGÉ**
  - ✅ `src/components/vault/VaultSection.tsx:15` - `totalTvl` - **CORRIGÉ**
  - ✅ `src/components/wallets/AddWalletDialog.tsx:4` - `AlertCircle` - **CORRIGÉ**
  - ✅ `src/components/wallets/AddWalletDialog.tsx:24` - `privyUser` - **CORRIGÉ**
  - ✅ `src/components/wallets/AddWalletDialog.tsx:72` - `errorMessage` - **CORRIGÉ**
  - ✅ `src/components/wallets/DeleteWalletDialog.tsx:27` - `privyUser` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:12` - `walletLoadMessages` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:37` - `isLoading` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:38` - `error` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:43` - `storeLoading` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:140` - `error` - **CORRIGÉ**
  - ✅ `src/components/wallets/WalletTabs.tsx:159` - `error` - **CORRIGÉ**
  - ✅ `src/components/wallets/assets/TableHeader.tsx:29` - `sortDirection` - **CORRIGÉ**
  - ✅ `src/components/wallets/assets/TableRow.tsx:62` - `formatPercent` - **CORRIGÉ**
  - ✅ `src/components/wallets/fills/WalletRecentFillsSection.tsx:30` - `refetch` - **CORRIGÉ**
  - ✅ `src/components/wallets/stats/performance/DistributionSection.tsx:167` - `index` - **CORRIGÉ**
- ✅ `src/lib/numberFormatting.ts:178` - `prefix` - **CORRIGÉ**
- ✅ `src/lib/numberFormatting.ts:218` - `locale` - **CORRIGÉ**
- ✅ `src/lib/numberFormatting.ts:313` - `prefix` - **CORRIGÉ**
- ✅ `src/lib/numberFormatting.ts:222` - `finalMinimumFractionDigits` - **CORRIGÉ**
- ✅ `src/services/explorer/address/index.ts:37` - `formatNumberValue` - **CORRIGÉ**
- ✅ `src/services/explorer/address/index.ts:38` - `calculateValue` - **CORRIGÉ**
- ✅ `src/services/explorer/address/hooks/useTransactions.ts:22` - `formatNumberValue` - **CORRIGÉ**
- ✅ `src/services/explorer/address/hooks/useTransactions.ts:29` - `calculateValue` - **CORRIGÉ**
- ✅ `src/services/explorer/address/formatters.ts:204` - commentaire formatNumberValue - **CORRIGÉ**
- ✅ `src/services/explorer/address/formatters.ts:63` - commentaire calculateValue - **CORRIGÉ**
- `src/services/education/api.ts:18` - `params`
- `src/services/education/api.ts:57` - `filters`
- `src/services/education/linkPreview/api.ts:1` - `put`, `del`
- `src/services/education/linkPreview/api.ts:4` - `LinkPreview`
- `src/services/education/linkPreview/hooks/hooks.ts:9` - `LinkPreviewResponse`
- ✅ `src/services/education/linkPreview/hooks/hooks.ts:60` - `err` - **CORRIGÉ**
- ✅ `src/services/education/linkPreview/hooks/hooks.ts:76` - `err` - **CORRIGÉ**
- ✅ `src/services/education/readList/hooks/hooks.ts:9` - `ReadListCreateInput` - **CORRIGÉ**
- ✅ `src/services/education/readList/hooks/hooks.ts:68` - `error` - **CORRIGÉ**
- ✅ `src/services/education/readList/hooks/hooks.ts:78` - `createComplexMutationHook` - **CORRIGÉ**
- ✅ `src/services/education/readList/hooks/hooks.ts:264` - `currentState`
- ✅ `src/services/explorer/address/utils.ts:1` - `NonFundingLedgerUpdate`, `FormattedUserTransaction` - **CORRIGÉ**
- ✅ `src/services/market/auction/hooks/useAuctionChart.ts:5` - `AuctionChartData` - **CORRIGÉ**
- ✅ `src/services/market/auction/hooks/useAuctionTiming.ts:1` - `useCallback` - **CORRIGÉ**
- ✅ `src/services/market/order/hooks/useHypeBuyPressure.ts:101` - `excludedOrders` - **CORRIGÉ**
- ✅ `src/services/vault/api.ts:7` - `VaultSummary` - **CORRIGÉ**
- ✅ `src/components/common/charts/hooks/useChartData.ts:14` - `period` - **CORRIGÉ**
- ✅ `src/components/common/charts/hooks/useChartFormat.ts:17` - `currency` - **CORRIGÉ**
- ✅ `src/components/education/readList/ReadListContent.tsx:1` - `Filter` - **CORRIGÉ**
- ✅ `src/components/education/readList/ReadListContent.tsx:61` - `previewsLoading` - **CORRIGÉ**

---

## 🚫 Types `any` (MOYEN - À corriger par groupe)

### 1. Types `any` dans les composants
- ✅ `src/components/Sidebar.tsx:21` - `IconComponent?: any` - **CORRIGÉ**
- ✅ `src/components/common/charts/base/Chart.tsx:46,50` - `any` - **CORRIGÉ**
- ✅ `src/components/common/charts/hooks/useChartData.ts:9` - `any` - **CORRIGÉ**
- ✅ `src/components/common/charts/types/chart.ts:7,27,41-44,57` - `any` - **CORRIGÉ**
- ✅ `src/components/dashboard/chart/ChartDisplay.tsx:108,109,160` - `any` - **CORRIGÉ**
- ✅ `src/components/dashboard/twap/TwapTable.tsx:34,61,73,85,143,158,188,201` - `any` - **CORRIGÉ**
- ✅ `src/components/dashboard/vaultValidator/DataTablesContent.tsx:86,95,110,131,158,178,193` - `any` - **CORRIGÉ**
- ✅ `src/components/education/ResourcesSection.tsx:104,105,108` - `any` - **CORRIGÉ**
- ✅ `src/components/education/readList/ReadList.tsx:46` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/address/orders/OrderTableContent.tsx:12` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/address/orders/UserTwapTable.tsx:55,67,79,116,158,174,188,197` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/address/staking/StakingTableContent.tsx:44,49,54,58,88,154,232` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/block/TransactionList.tsx:17` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/transaction/TransactionFormatter.tsx:72,74,138,176,178,196,230,250,331,335,347` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/vaultValidatorSum/DataTable.tsx:4` - `any` - **CORRIGÉ**
- ✅ `src/components/explorer/vaultValidatorSum/TableContent.tsx:51,60,86,136,202,249` - `any` - **CORRIGÉ**
- ✅ `src/components/market/common/GlobalStatsCard.tsx:83,116,134,167,182` - `any` - **CORRIGÉ**
- ✅ `src/components/market/common/TokenTable.tsx:73,115,163` - `any` - **CORRIGÉ**
- ✅ `src/components/market/common/TrendingTokensCard.tsx:56,62,183,221` - `any` - **CORRIGÉ**
- ✅ `src/components/market/spot/auction/AuctionChart.tsx:21,101,102,119` - `any` - **CORRIGÉ**
- ✅ `src/components/market/spot/auction/AuctionTable.tsx:82,97,98` - `any` - **CORRIGÉ**
- ✅ `src/components/validator/chart/HoldersDistributionChart.tsx:35` - `any` - **CORRIGÉ**
- ✅ `src/components/validator/chart/StakingLineChart.tsx:27` - `any` - **CORRIGÉ**
- ✅ `src/components/validator/chart/UnstakingScheduleChart.tsx:39,135` - `any` - **CORRIGÉ**
- ✅ `src/components/vault/VaultChart.tsx:83` - `any` - **CORRIGÉ**
- ✅ `src/components/vault/VaultChartDisplay.tsx:126` - `any` - **CORRIGÉ**
- ✅ `src/components/wallets/AddWalletDialog.tsx:54` - `any` - **CORRIGÉ**
- ✅ `src/components/wallets/DeleteWalletDialog.tsx:43` - `any` - **CORRIGÉ**
- ✅ `src/components/wallets/WalletTabs.tsx:165` - `any` - **CORRIGÉ**
- ✅ `src/components/wallets/stats/performance/DistributionSection.tsx:114` - `any` - **CORRIGÉ**
- ✅ `src/components/wallets/stats/performance/PerformanceSection.tsx:96` - `any` - **CORRIGÉ**
- ✅ `src/components/user/UserManagement.tsx:29` - `any` - **CORRIGÉ**

### 2. Types `any` dans les services
- ✅ `src/hooks/useDataFetching.ts:6` - `any` - **CORRIGÉ**
- ✅ `src/services/api/axios-config.ts:291,294,297,304,307` - `any` - **CORRIGÉ**
- ✅ `src/services/api/error-handler.ts:10,17,41,110` - `any` - **CORRIGÉ**
- ✅ `src/services/api/types.ts:9` - `any` - **CORRIGÉ**
- ✅ `src/services/auth/user/hooks/useAdminUsers.ts:11` - `any` - **CORRIGÉ**
- ✅ `src/services/dashboard/types.ts:26,35` - `any` - **CORRIGÉ**
- ✅ `src/services/education/readList/hooks/hooks.ts:15,62` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/address/api.ts:101` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/address/formatters.ts:8,70,119,167` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/address/hooks/useTransactions.ts:22` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/address/types.ts:148` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/address/utils.ts:5,79,85` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/hooks/useDeploys.ts:9,32` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/types.ts:139` - `any` - **CORRIGÉ**
- ✅ `src/services/explorer/websocket.service.ts:17,63,71,74,82,128,136,139` - `any` - **CORRIGÉ**
- ✅ `src/services/market/fees/api.ts:11,50,54,63` - `any` - **CORRIGÉ**
- ✅ `src/services/market/hype/websocket.service.ts:74,81,89,92` - `any` - **CORRIGÉ**
- ✅ `src/services/market/order/hooks/useHypeBuyPressure.ts:15,50` - `any` - **CORRIGÉ**
- ✅ `src/services/validator/hooks/delegator/useDelegatorHistory.ts:57` - `any` - **CORRIGÉ**
- ✅ `src/services/validator/hooks/delegator/useDelegatorRewards.ts:51` - `any` - **CORRIGÉ**
- ✅ `src/services/validator/hooks/delegator/useDelegatorSummary.ts:36` - `any` - **CORRIGÉ**
- ✅ `src/services/validator/hooks/validator/useValidatorDelegations.ts:32` - `any` - **CORRIGÉ**
- ✅ `src/services/validator/utils.ts:10,29` - `any` - **CORRIGÉ**
- ✅ `src/services/vault/hooks/useVaultDeposits.ts:12,30` - `any` - **CORRIGÉ**
- ✅ `src/services/vault/types.ts:81` - `any` - **CORRIGÉ**
- ✅ `src/services/wallets/api.ts:26,84` - `any` - **CORRIGÉ**
- ✅ `src/services/wallets/hooks/useWalletsBalances.ts:67` - `any` - **CORRIGÉ**
- ✅ `src/store/use-readlists.ts:51,75,79,81` - `any` - **CORRIGÉ**
- ✅ `src/store/use-wallets.ts:17,68,88,92,94` - `any` - **CORRIGÉ**
- ✅ `src/lib/wallet-toast-messages.ts:111` - `any` - **CORRIGÉ**
- ✅ `src/components/types/dashboard.types.ts:14,15` - `any` - **CORRIGÉ**

---

## ⚠️ Erreurs React (MOYEN - À corriger par groupe)

### 1. Composants sans display name
- `src/components/dashboard/twap/TwapTabButtons.tsx:5`
- `src/components/dashboard/twap/TwapTable.tsx:24,61,73,85,143,158,188,201`
- `src/components/dashboard/vaultValidator/DataTable.tsx:37`
- `src/components/dashboard/vaultValidator/DataTablesContent.tsx:19,86,95,110,131,158,178,193`
- `src/components/dashboard/vaultValidator/TabButtons.tsx:6`
- `src/components/explorer/address/cards/AddressCards.tsx:19`
- `src/components/explorer/address/cards/InfoCard.tsx:14`
- `src/components/explorer/address/cards/OverviewCard.tsx:7`
- `src/components/explorer/address/cards/PnLCard.tsx:46`
- `src/components/explorer/address/orders/UserTwapTable.tsx:18,55,67,79,116,158,174,188,197`

### 2. Hooks appelés conditionnellement
- `src/components/market/common/GlobalStatsCard.tsx:19,23`
- `src/components/market/common/TokenTable.tsx:174,182`
- `src/components/market/common/TrendingTokensCard.tsx:36,42`

### 3. Hooks avec dépendances manquantes
- `src/components/common/charts/hooks/useChartFormat.ts:36`
- `src/components/dashboard/twap/TwapTabButtons.tsx:10`
- `src/components/dashboard/vaultValidator/DataTablesContent.tsx:95,178,204`
- `src/components/dashboard/vaultValidator/DataTablesContent.tsx:204`
- `src/components/education/readList/ReadList.tsx:53`
- `src/components/explorer/recentBlockTx/RecentDataTable.tsx:50`
- `src/components/market/auction/hooks/useAuctionTiming.ts:154`
- `src/components/market/common/TokenTable.tsx:182`
- `src/components/wallets/WalletTabs.tsx:96`
- `src/hooks/useDataFetching.ts:112,137`
- `src/hooks/useSortableData.ts:23`
- `src/services/auth/user/hooks/useAdminUpdateUser.ts:28`
- `src/services/auth/user/hooks/useAdminUsers.ts:30`

---

## 🚫 Erreurs de préférence (FACILE)

### 1. `let` au lieu de `const`
- ✅ `src/components/dashboard/chart/ChartDisplay.tsx:162` - **CORRIGÉ**
- `src/components/dashboard/twap/TwapSection.tsx:50`
- `src/components/market/spot/auction/AuctionChart.tsx:121`
- `src/lib/numberFormatting.ts:225`
- ✅ `src/store/use-wallets.ts:218` - **CORRIGÉ**

### 2. Commentaires TypeScript
- `src/services/api/axios-config.ts:45` - Utiliser `@ts-expect-error` au lieu de `@ts-ignore`

---

## 🚫 Erreurs d'échappement (FACILE)

### 1. Caractères non échappés
- `src/components/dashboard/chart/FeesChartDemo.tsx:19` - Apostrophes et guillemets
- `src/components/wallets/AddWalletDialog.tsx:87` - Apostrophe

---

## 🚫 Erreurs d'images (FACILE)

### 1. Balises `<img>` au lieu de `<Image>`
- `src/components/education/ResourceCard.tsx:110`
- `src/components/education/readList/ReadListItemCard.tsx:51`
- `src/components/project/ProjectModal.tsx:258`
- `src/components/wallets/assets/TableRow.tsx:32,94`

---

## 📋 Plan d'action recommandé

### Phase 1 : Erreurs critiques (1-2h)
1. ✅ Corriger l'erreur de parsing dans `src/services/auth/user/api.ts`
2. ✅ Tester que l'app fonctionne

### Phase 2 : Variables non utilisées (2-3h)
1. Supprimer toutes les variables non utilisées
2. Tester après chaque fichier

### Phase 3 : Erreurs React (3-4h)
1. Ajouter les display names manquants
2. Corriger les hooks conditionnels
3. Corriger les dépendances manquantes

### Phase 4 : Types `any` (4-6h)
1. Commencer par les composants les plus simples
2. Définir des types appropriés
3. Tester après chaque modification

### Phase 5 : Erreurs mineures (1-2h)
1. Corriger les `let` → `const`
2. Échapper les caractères
3. Remplacer `<img>` par `<Image>`

---

## 🎯 Objectif
- **Réduire les erreurs de 200 à 0**
- **Maintenir la fonctionnalité**
- **Améliorer la qualité du code**
- **Faciliter la maintenance future** 