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
