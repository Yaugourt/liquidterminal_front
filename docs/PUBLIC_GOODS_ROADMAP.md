# 🎯 Public Goods - Roadmap & Suivi

## 📋 Vue d'ensemble

Système de soumission et review de projets open-source pour l'écosystème HyperLiquid.

**Statut global :** 🚧 En développement  
**Dernière mise à jour :** 16 Octobre 2025

---

## 🏗️ Architecture

```
Frontend (React/Next.js)
├── Services Layer (API calls + Types)
├── Hooks Layer (Business logic)
├── Components Layer (UI)
└── Pages Layer (Routes)

Backend (Node.js/Express/Prisma)
├── Database Schema (Prisma)
├── Routes API (8 endpoints)
├── Middlewares (JWT, Auth, Upload)
└── Validation (Zod/Joi)
```

---

## 📊 Progression Globale

- [x] Analyse & Spec complète
- [x] Mockups UI existants (PublicGoodsCard, pages)
- [x] **Phase 1 : UI Components (9/10 tâches)** → 90% ✅
- [ ] **Phase 2 : API Integration (0/5 tâches)** → 0%
- [ ] **Phase 3 : Polish & Testing (0/3 tâches)** → 0%

**Total : 9/18 tâches complétées (50%)**

_Note: EditModal (UI-2) est optionnel pour V1, sera fait après l'intégration API._

---

## 🎨 PHASE 1 : UI Components (UI First)

### ✅ Objectif
Créer tous les components visuels avec mockData pour valider les flows.

### 📝 Tâches

#### **UI-1 : SubmitProjectModal** ✅ COMPLETED
- [x] Structure multi-étapes (5 tabs)
  - [x] Tab 1: Projet (name, description, URLs, category, contacts)
  - [x] Tab 2: Impact HL (problemSolved, targetUsers, hlIntegration, devStatus)
  - [x] Tab 3: Team & Tech (lead dev, team size, experience, technologies)
  - [x] Tab 4: Support (types, budget, timeline)
  - [x] Tab 5: Preview
- [x] Upload images (logo, banner, screenshots)
- [x] Preview avant soumission
- [x] Validation temps réel
- [x] Auth check (redirect si pas connecté)
- [x] FormData construction

**Fichier :** ✅ `src/components/ecosystem/publicgoods/SubmitProjectModal.tsx`  
**Status :** Completed - 850+ lines, full featured

---

#### **UI-2 : EditProjectModal** ⏸️ DEFERRED TO V1.1
- [ ] Clone de SubmitProjectModal
- [ ] Pre-fill avec data existante
- [ ] Warning si status=APPROVED (reset to PENDING)
- [ ] PUT au lieu de POST

**Fichier :** `src/components/ecosystem/publicgoods/EditProjectModal.tsx`  
**Status :** Deferred - Not critical for V1, will be done after API integration

---

#### **UI-3 : ReviewModal** ✅ COMPLETED
- [x] Radio buttons (Approve/Reject)
- [x] Textarea pour review notes
- [x] Preview du projet
- [x] Bouton Submit
- [x] Role check (MODERATOR+)

**Fichier :** ✅ `src/components/ecosystem/publicgoods/ReviewModal.tsx`  
**Status :** Completed

---

#### **UI-4 : DeleteConfirmDialog** ✅ COMPLETED
- [x] Dialog de confirmation
- [x] Afficher nom du projet
- [x] Warning destructive action
- [x] Boutons Cancel/Confirm

**Fichier :** ✅ `src/components/ecosystem/publicgoods/DeleteConfirmDialog.tsx`  
**Status :** Completed

---

#### **UI-5 : Adapter PublicGoodsCard** ✅ COMPLETED
- [x] Ajouter dropdown menu actions
- [x] Bouton Edit (si owner)
- [x] Bouton Delete (si owner/admin)
- [x] Bouton Review (si moderator + pending)
- [x] Badge status visible
- [x] Permission checks intégrés

**Fichier :** ✅ `src/components/ecosystem/publicgoods/PublicGoodsCard.tsx`  
**Status :** Completed - Dropdown avec stop propagation

---

#### **UI-6 : Intégrer SubmitModal dans page liste** ✅ COMPLETED
- [x] Connecter bouton "Submit Project" au modal
- [x] Auth check (redirect to login si non connecté)
- [x] Callback onSuccess (refetch + toast)
- [x] State management (isOpen)

**Fichier :** ✅ `src/app/ecosystem/publicgoods/page.tsx`  
**Status :** Completed

---

#### **UI-7 : Adapter page détail** ✅ COMPLETED
- [x] Actions sidebar conditionnelles
  - [x] Edit button (owner) - toast for now
  - [x] Delete button (owner/admin)
  - [x] Review button (moderator + pending)
- [x] Intégrer ReviewModal
- [x] Intégrer DeleteDialog
- [x] Handlers pour chaque action
- [x] Permission checks

**Fichier :** ✅ `src/app/ecosystem/publicgoods/[id]/page.tsx`  
**Status :** Completed - EditModal deferred to V1.1

---

#### **UI-8 : Page My Submissions** ✅ COMPLETED
- [x] Clone de page.tsx
- [x] Filtrer par submitterId (mockData pour l'instant)
- [x] Tabs par status (pending, approved, rejected)
- [x] Actions edit/delete sur chaque card
- [x] Empty state si aucune submission
- [x] Auth required check

**Fichier :** ✅ `src/app/ecosystem/publicgoods/my-submissions/page.tsx`  
**Status :** Completed - 290+ lines

---

#### **UI-9 : Page Pending Review (Admin)** ✅ COMPLETED
- [x] Protection role (MODERATOR+)
- [x] Liste projets status=PENDING
- [x] Bouton Review sur chaque card
- [x] Stats count en haut
- [x] Empty state si aucun pending
- [x] Review guidelines affichées

**Fichier :** ✅ `src/app/ecosystem/publicgoods/pending/page.tsx`  
**Status :** Completed - 200+ lines

---

#### **UI-10 : Helpers & Constants** ✅ COMPLETED
- [x] Validation functions (8 functions)
  - [x] validateGithubUrl
  - [x] validateEmail
  - [x] validateUrl
  - [x] validateArrayNotEmpty
  - [x] validateMinLength
  - [x] validateRequired
  - [x] validateImageFile
  - [x] validateScreenshots
- [x] Formatters (5 formatters)
  - [x] formatBudgetRange
  - [x] formatTimeline
  - [x] formatTeamSize
  - [x] formatExperienceLevel
  - [x] formatDevelopmentStatus
- [x] Constants (7 const arrays)
  - [x] CATEGORIES
  - [x] DEVELOPMENT_STATUSES
  - [x] TEAM_SIZES
  - [x] EXPERIENCE_LEVELS
  - [x] SUPPORT_TYPES
  - [x] BUDGET_RANGES
  - [x] TIMELINES
  - [x] PROJECT_STATUSES
- [x] Form helpers (buildFormData, validateForm)

**Fichier :** ✅ `src/lib/publicgoods-helpers.ts`  
**Status :** Completed - 450+ lines, full featured

---

## 🔌 PHASE 2 : API Integration

### ✅ Objectif
Connecter l'UI aux vraies APIs backend.

### 📝 Tâches

#### **API-1 : Types TypeScript**
- [ ] Interface PublicGood
- [ ] Enums (ProjectStatus, DevelopmentStatus, etc.)
- [ ] PublicGoodQueryParams
- [ ] Responses types (single, list, paginated)
- [ ] Input types (Create, Update, Review)
- [ ] Hook result types

**Fichier :** `src/services/ecosystem/publicgoods/types.ts`  
**Note :** Basé sur ce qui est utilisé dans l'UI  
**Estimé :** 1h

---

#### **API-2 : API Functions**
- [ ] fetchPublicGoods(params)
- [ ] fetchPublicGood(id)
- [ ] fetchMySubmissions(params)
- [ ] createPublicGood(formData)
- [ ] updatePublicGood(id, formData)
- [ ] deletePublicGood(id)
- [ ] reviewPublicGood(id, data)
- [ ] fetchPendingPublicGoods(params)

**Fichier :** `src/services/ecosystem/publicgoods/api.ts`  
**Pattern :** `withErrorHandling` + helpers (get, post, put, del)  
**Estimé :** 1-2h

---

#### **API-3 : Custom Hooks**
- [ ] usePublicGoods (liste paginée)
- [ ] usePublicGood (détail)
- [ ] useMyPublicGoods (mes submissions)
- [ ] useCreatePublicGood (avec FormData)
- [ ] useUpdatePublicGood
- [ ] useDeletePublicGood
- [ ] useReviewPublicGood
- [ ] index.ts exports

**Dossier :** `src/services/ecosystem/publicgoods/hooks/`  
**Pattern :** useDataFetching wrapper  
**Estimé :** 2-3h

---

#### **API-4 : Connecter UI aux Hooks**
- [ ] Page liste → usePublicGoods
- [ ] Page détail → usePublicGood
- [ ] My Submissions → useMyPublicGoods
- [ ] Pending → usePublicGoods({status: 'pending'})
- [ ] SubmitModal → useCreatePublicGood
- [ ] EditModal → useUpdatePublicGood
- [ ] ReviewModal → useReviewPublicGood
- [ ] DeleteDialog → useDeletePublicGood

**Estimé :** 2h

---

#### **API-5 : Remplacer mockData**
- [ ] Supprimer imports mockProjects
- [ ] Gérer loading states
- [ ] Gérer error states
- [ ] Empty states
- [ ] Retry mechanisms
- [ ] Optimistic updates si pertinent

**Estimé :** 1h

---

## ✨ PHASE 3 : Polish & Testing

### ✅ Objectif
Finitions UX et tests complets.

### 📝 Tâches

#### **POLISH-1 : Navigation Sidebar**
- [ ] Ajouter section "Public Goods"
- [ ] Link "All Projects"
- [ ] Link "My Submissions" (auth required)
- [ ] Link "Pending Review" (MODERATOR required)
- [ ] Icons et badges

**Fichier :** `src/components/Sidebar.tsx`  
**Estimé :** 30min

---

#### **POLISH-2 : Tests Flows Complets**
- [ ] Flow submission (user non connecté → login → submit)
- [ ] Flow submission (user connecté)
- [ ] Flow edit (owner)
- [ ] Flow edit (non-owner) → error
- [ ] Flow delete (owner)
- [ ] Flow delete (admin)
- [ ] Flow review (moderator)
- [ ] Flow review (non-moderator) → error
- [ ] Filtres et recherche
- [ ] Pagination
- [ ] Upload images

**Estimé :** 2h

---

#### **POLISH-3 : Toast Messages & Feedback**
- [ ] Submit success
- [ ] Submit error (avec détails)
- [ ] Update success
- [ ] Delete success
- [ ] Review success
- [ ] Upload error (taille, format)
- [ ] Auth required messages
- [ ] Permission denied messages

**Estimé :** 1h

---

## 📦 Backend (Parallèle)

### ✅ À faire côté backend
- [ ] Créer schema Prisma (PublicGood + enums)
- [ ] Migration database
- [ ] 8 routes API (GET, POST, PUT, DELETE, PATCH)
- [ ] Upload files (Multer ou équivalent)
- [ ] Validation inputs (Zod/Joi)
- [ ] Auth middlewares (JWT + roles)
- [ ] Tests API (Postman/Jest)

**Doc envoyée :** Spec complète backend dans le chat précédent

---

## 🎯 Ordre d'exécution recommandé

### Sprint 1 : Formulaire Core
1. UI-10 (Helpers) → Base pour validation
2. UI-1 (SubmitModal) → Feature principale
3. UI-6 (Intégration page liste) → Tester le submit

### Sprint 2 : Actions CRUD
4. UI-2 (EditModal)
5. UI-3 (ReviewModal)
6. UI-4 (DeleteDialog)
7. UI-5 (Adapter Card avec actions)
8. UI-7 (Page détail avec actions)

### Sprint 3 : Pages Admin/User
9. UI-8 (My Submissions)
10. UI-9 (Pending Review)

### Sprint 4 : API Integration
11. API-1 (Types)
12. API-2 (API functions)
13. API-3 (Hooks)
14. API-4 (Connecter UI)
15. API-5 (Remplacer mockData)

### Sprint 5 : Polish
16. POLISH-1 (Sidebar)
17. POLISH-2 (Tests)
18. POLISH-3 (Toast messages)

---

## 📝 Notes & Décisions

### Patterns à suivre
- **API calls** : `withErrorHandling` + helpers (get, post, put, del)
- **Hooks** : useDataFetching wrapper
- **Auth** : ProtectedAction component + hasRole helper
- **Upload** : FormData pour toutes les routes create/update
- **Validation** : Client-side + backend validation

### Dépendances externes
- Aucune nouvelle dépendance requise
- Tout utilisable avec la stack actuelle

### Questions ouvertes
- ✅ Upload fichiers : FormData via routes uniques
- ✅ Enums : Garder les enums Prisma côté backend
- ❌ Notifications : Pas pour V1
- ❌ Analytics : Pas pour V1

---

## 🐛 Bugs Connus
_Aucun pour l'instant_

---

## 🚀 Prochaines Features (V2)
- [ ] Système de support/vote par projet
- [ ] Share project (social links)
- [ ] Duplicate detection (même githubUrl)
- [ ] Export CSV (admin)
- [ ] Notifications email (review status)
- [ ] Analytics (views, clicks)
- [ ] Commentaires/feedback sur projets

---

## 📊 Métriques

**Code écrit :**
- Components : 5/6 (SubmitModal, ReviewModal, DeleteDialog, PublicGoodsCard adapted)
- Pages : 4/4 (Liste, Détail, My Submissions, Pending)
- Hooks : 0/8
- API functions : 0/8
- Types : 0/1
- Helpers : 1/1 ✅

**Lignes de code :** ~2500+ lines
**Temps estimé total :** 20-25h
**Temps passé :** ~6-7h (UI Phase)

---

## 🔗 Liens Utiles

- [Spec Backend complète](./README.md)
- [Guide API Implementation](./API_IMPLEMENTATION_GUIDE.md)
- [Mockups Figma](#) _(si existe)_
- [Ticket Jira/Linear](#) _(si existe)_

---

## ✅ Checklist Finale (Avant Merge)

- [ ] Tous les flows testés manuellement
- [ ] Loading states partout
- [ ] Error states gérés
- [ ] Empty states designs
- [ ] Toast messages cohérents
- [ ] Auth checks complets
- [ ] Role permissions respectées
- [ ] Mobile responsive
- [ ] Images optimisées
- [ ] Linter clean
- [ ] Types complets (no any)
- [ ] Console.log retirés
- [ ] Comments retirés ou utiles
- [ ] README mis à jour

---

**Maintenu par :** Frontend Team  
**Contact :** _#public-goods channel_


