# Revue sécurité & rate limiting — intégration Hyperfolio (frontend)

**Date :** 2026-09-23 · **Branche :** `feat/hyperfolio` (base `a440c95`) · **Pendant back :** `LiquidTerminal_Back/docs/HYPERFOLIO_SECURITY_REVIEW.md` (budgets, circuit breaker, SSE proxy)

**Périmètre :** `src/services/market/tracker/hyperfolio/*` (api, store SSE, hooks),
`src/services/market/yields/*`, les composants `src/components/market/tracker/evm/*`, `src/components/market/yields/*`,
`TopYieldsModule`, `ProjectYieldsModule` et `useAddressBalance`.

---

## 1. Ce qui était déjà conforme

| Point | Constat |
|---|---|
| Aucun secret côté navigateur | Tous les appels passent par le proxy backend `/hyperfolio/*`, y compris le flux SSE (`buildPositionsStreamUrl` pointe sur le back). La clé n'existe que côté serveur. |
| Couche API | `withErrorHandling` + helpers `get` centralisés ; adresse encodée avec `encodeURIComponent` dans chaque chemin. |
| Cadence d'appels | Composition : polling de 60 s, aligné sur le TTL du cache back (au plus 1 appel upstream par minute et par wallet). Positions, transactions, NFTs et points : pas de polling. History : rafraîchissement quotidien. `maxRetries: 1` partout. |
| Saisie libre | Recherches (transactions et yields) debouncées à 400 ms, donc une seule requête par frappe stabilisée. Les filtres APY/TVL passent par le même debounce. |
| SSE | Une seule connexion par wallet, quel que soit le nombre de panneaux (store zustand avec compteur de références). Fermeture sur `complete`. Sur `onerror`, la source est fermée : pas de reconnexion automatique en boucle d'`EventSource`, bascule unique sur la route JSON. |
| Erreurs | `classifyHyperfolioError` lit le code du back (`HYPERFOLIO_RATE_LIMITED`, `SSE_CONNECTION_LIMIT`, `NOT_CONFIGURED`, `BAD_INPUT`). La notice « throttling » laisse les données en cache visibles et propose un retry manuel, sans retry automatique. |
| Images | `next/image` en `unoptimized` pour les logos et NFTs d'hôtes arbitraires : l'optimiseur Next n'est pas exposé à des hôtes inconnus (pas de SSRF/coût via `/_next/image`). |
| Track List | Net worth multi-wallets laissé volontairement en backlog, faute d'endpoint batché (sinon N wallets × 3 appels dépasseraient la limite upstream). |

---

## 2. Problèmes trouvés et corrigés

### F1 — XSS possible via des liens venant de l'upstream (élevé)
`DefiProtocol.url` (onglet DeFi positions) et `YieldOpportunity.protocol.website` (annuaire des
yields) étaient rendus tels quels dans un `href`. Hyperfolio agrège des métadonnées de protocoles
tiers : une valeur `javascript:…` compromise ou malveillante devenait un lien exécutable. React
ne bloque pas ces URLs en production, comme le rappelle `src/lib/safeUrl.ts`.

**Correctif :** nouveau helper `safeExternalHref()` dans `src/lib/safeUrl.ts`. Il n'accepte que les
URLs absolues http(s) et renvoie `null` sinon. Il est plus strict que `safeHref`, qui laisse passer
les chemins relatifs, lesquels pointeraient sinon vers notre propre origine. Il est appliqué dans
les normalizers (`normalizeProtocol`, `normalizeYield`). `DefiProtocol.url` devient `string | null`
et `DefiPositionsTab` affiche le nom sans lien quand l'URL est rejetée.

### F2 — URLs d'images non filtrées (faible)
Les logos de tokens et l'art des NFTs (`image_url`, `image`) passaient sans contrôle.
**Correctif :** `imageUrl()` dans `hyperfolio/api.ts` n'accepte que `http(s)://` et `data:image/`.
`resolveHyperfolioLogo` refuse aussi les URLs protocol-relative (`//hôte`), qui auraient été
concaténées à l'hôte des assets Hyperfolio.

### F3 — Hash de transaction interpolé brut dans une URL externe (faible)
`hyperEvmTxUrl(hash)` construisait `https://hyperevmscan.io/tx/${hash}` avec un hash venant de
l'upstream. **Correctif :** `encodeURIComponent(hash)`, ce qui empêche un chemin arbitraire sur l'explorateur.

### F4 — Bug : positions DeFi bloquées en « chargement » après un démontage en cours de flux (moyen, fonctionnel)
Scénario : le wallet est ouvert, le flux SSE démarre, puis l'utilisateur change d'onglet ou de page
avant l'événement `complete`. La connexion est fermée mais le statut reste `streaming`. Au remontage,
`subscribe()` n'ouvre un flux que depuis `idle` : aucune connexion ne repart et `isLoading` reste
vrai indéfiniment (spinner infini, jusqu'à un clic sur refresh).
**Correctif (`positions.store.ts`) :** quand le dernier abonné se désabonne pendant un flux inachevé,
le wallet repasse en `idle`, et le remontage relance le flux. Les données déjà complètes restent
en store pour un remontage instantané.

---

## 3. Impact des correctifs back sur le front

- Nouveaux 429 possibles : budget par IP (30 appels upstream/min, cache-miss seulement) et budget
  global. Ils portent le même code `HYPERFOLIO_RATE_LIMITED` et `Retry-After: 10`, et
  `classifyHyperfolioError` les classe déjà en `rate-limited`. Aucun changement n'est nécessaire.
- Timeout du flux (90 s) : le proxy envoie maintenant `{type:'error', fatal:true}`. Le store le gère
  déjà et bascule sur `/positions` JSON.
- Les messages d'erreur du back sont désormais génériques. Le front affiche ses propres textes
  selon le `kind`, donc l'UI ne change pas.

---

## 4. Points résiduels (non corrigés)

1. **Fuite d'IP vers des hôtes tiers.** Les images de NFTs et de tokens sont chargées directement
   par le navigateur depuis des hôtes arbitraires (la CSP `img-src https:` l'autorise). C'est
   standard pour un portefeuille, mais un hôte d'image voit l'IP du visiteur. L'alternative serait
   un proxy d'images côté back, avec son coût.
2. **CSP en report-only** (préexistant, voir `next.config`). Ce correctif ne change rien à ce point.
3. **Retour sur la route JSON après un 429 du flux.** Si le flux est refusé (plafond de 3 flux par
   IP), le store retente une fois via `/positions` JSON. C'est borné : cette route est soumise au
   même budget par IP et au cooldown.

---

## 5. Vérifications

- `npx tsc --noEmit` : OK
- `eslint` sur `services/market/tracker/hyperfolio`, `services/market/yields`, `lib/safeUrl.ts`,
  `components/market/tracker/evm`, `components/market/yields` : OK
- Pas de `visual-check` : le seul changement de rendu est le fallback `<span>` quand
  `protocol.url` est rejetée, sans impact sur la mise en page.
