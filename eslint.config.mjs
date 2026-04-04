import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** Vendored agent tooling (gstack, etc.): not app source; linting it breaks CI and is upstream-owned. */
const VENDOR_AGENT_PATHS = [".agents/**", ".cursor/**"];

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
