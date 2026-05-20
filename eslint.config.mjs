import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

/** Vendored agent tooling (gstack, etc.): not app source; linting it breaks CI and is upstream-owned. */
const VENDOR_AGENT_PATHS = [".agents/**", ".cursor/**"];

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  /** React Compiler-oriented rules (eslint-plugin-react-hooks v7): off until the codebase is migrated incrementally. */
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/refs": "off",
    },
  },
  /**
   * Design system governance — Lot 0.
   *
   * These rules enforce the Liquid Terminal design system:
   *   - No hex colors in JS strings or Tailwind arbitrary classes — use tokens.
   *   - No native <input type="checkbox"> — use <Checkbox> from @/components/ui/checkbox.
   *   - No direct <Loader2> import in app code — use ChartSkeleton / LoadingState.
   *   - Imports from @/components/common/* must go through the barrel.
   *
   * Existing violations are kept on purpose to surface during Lots 1–2 refactor.
   * They will be fixed lot by lot; the rules prevent re-introduction.
   *
   * Token references:
   *   - Tailwind: brand-accent / brand-gold / brand-main / brand-secondary / brand-tertiary / brand-dark / brand-success / brand-error / brand-warning / brand-telegram (tailwind.config.ts)
   *   - Chart palette (SSOT for chart-only hex): src/components/common/charts/chartTheme.ts (chartPalette)
   *   - Dynamic-alpha animations: rgb(var(--brand-accent-rgb) / X) etc. (src/app/globals.css)
   */
  {
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "Pas de hex hardcodé. Utilise un token Tailwind (brand-accent, brand-gold, ...) ou chartTheme.ts (chartPalette) pour les charts.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/\\b(text|bg|border|fill|stroke|shadow|from|via|to|ring|outline|divide|placeholder|accent|caret|decoration)-\\[#[0-9a-fA-F]/]",
          message:
            "Pas de classe Tailwind arbitraire avec hex (ex: text-[#83E9FF]). Utilise un token (brand-accent, brand-gold, ...) ou rgb(var(--brand-*-rgb) / X) pour les opacités dynamiques.",
        },
        {
          selector:
            "JSXOpeningElement[name.name='input'] > JSXAttribute[name.name='type'][value.value='checkbox']",
          message:
            'Utilise <Checkbox> de @/components/ui/checkbox au lieu de <input type="checkbox">.',
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/common/*"],
              message:
                "Import depuis '@/components/common' (barrel), pas le fichier interne. Si l'export est manquant, ajoute-le au barrel.",
            },
            {
              group: ["@/components/ui/table"],
              message:
                "N'utilise pas le <Table> brut. Construis les tableaux avec <TypedDataTable> de '@/components/common' (colonnes typées, tri, pagination, états V4).",
            },
          ],
          paths: [
            {
              name: "lucide-react",
              importNames: ["Loader2"],
              message:
                "Utilise <ChartSkeleton>/<ChartLoading> (@/components/common) ou <LoadingState> (@/components/ui/loading-state) au lieu de <Loader2> direct.",
            },
          ],
        },
      ],
    },
  },
  /**
   * SSOT overrides — files where the banned patterns are intentional (canonical implementations).
   */
  {
    files: [
      "src/components/common/charts/chartTheme.ts",
      "src/components/common/charts/ChartSkeleton.tsx",
      "src/components/common/charts/ChartStates.tsx",
      "src/components/common/StatsCard.tsx",
      "src/components/ui/loading-state.tsx",
      "src/components/ui/inline-spinner.tsx",
      "src/components/ui/checkbox.tsx",
      "src/components/ui/sonner.tsx",
      "src/components/ui/table-states.tsx",
      // labs/charts/** are isolated showcases (see AGENTS.md); hex is permitted there.
      "src/components/labs/charts/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": "off",
      "no-restricted-imports": "off",
    },
  },
  /**
   * `@/components/ui/table` consumers exempts de la règle no-restricted-imports :
   *   - les primitives qui construisent TypedDataTable lui-même ;
   *   - les tables legacy non encore migrées (lignes mémoïsées temps réel,
   *     table de comparaison à matrice JSX) — à migrer/supprimer en cleanup.
   * Les autres règles (hex, etc.) restent actives sur ces fichiers.
   */
  {
    files: [
      "src/components/common/DataTable.tsx",
      "src/components/common/tables/SortableTableHead.tsx",
      "src/components/explorer/address/AddressTransactionList.tsx",
      "src/components/explorer/address/TransactionRow.tsx",
      "src/components/explorer/address/orders/UserTwapTable.tsx",
      "src/components/hip4/Hip4CompareTable.tsx",
      "src/components/market/tracker/assets/TableHeader.tsx",
      "src/components/market/tracker/assets/TableRow.tsx",
      "src/components/market/tracker/assets/TableLoadingState.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ...VENDOR_AGENT_PATHS,
    ],
  },
];

export default eslintConfig;
