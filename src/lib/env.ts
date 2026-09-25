/**
 * Validation des variables d'environnement.
 * Échoue au démarrage si des variables critiques manquent.
 *
 * Validated by hand on purpose: this module is part of the client shell (API
 * base URL, Privy app id) and a zod schema here shipped the whole zod runtime
 * (~65 KB gzipped) to every page. The rules and messages mirror the former
 * zod schema exactly (`z.string().url()` = trim + WHATWG `new URL`, `.min(1)`,
 * optional fields, enum with a default).
 */

const ENVIRONMENTS = ["development", "staging", "production"] as const;

type Environment = (typeof ENVIRONMENTS)[number];

export interface Env {
  // API Backend
  NEXT_PUBLIC_API: string;

  // Privy Auth
  NEXT_PUBLIC_PRIVY_AUDIENCE: string;
  JWKS_URL?: string;

  /**
   * Financial Modeling Prep — powers the HIP-3 underlying/basis card.
   * Server-only: read exclusively by `/api/hip3/underlying`. Never rename it to
   * `NEXT_PUBLIC_*`, which would inline the key into the client bundle.
   * Optional: without it the card simply does not render.
   */
  FMP_API_KEY?: string;

  // Environment
  NEXT_PUBLIC_ENVIRONMENT: Environment;
}

type Issue = { path: keyof Env; message: string };

const typeError = (value: unknown): string =>
  `Invalid input: expected string, received ${value === null ? "null" : typeof value}`;

/** Required string that must parse as a URL; returns the trimmed value. */
const url = (issues: Issue[], path: keyof Env, value: unknown, message: string): string | undefined => {
  if (typeof value !== "string") {
    issues.push({ path, message: typeError(value) });
    return undefined;
  }
  const trimmed = value.trim();
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    issues.push({ path, message });
    return undefined;
  }
};

/** Required non-empty string (not trimmed). */
const nonEmpty = (issues: Issue[], path: keyof Env, value: unknown, message: string): string | undefined => {
  if (typeof value !== "string") {
    issues.push({ path, message: typeError(value) });
    return undefined;
  }
  if (value.length < 1) {
    issues.push({ path, message });
    return undefined;
  }
  return value;
};

/**
 * Parse et valide les variables d'environnement
 * Lance une erreur explicite si validation échoue
 */
const parseEnv = (): Env => {
  // Literal `process.env.X` reads: Next.js inlines NEXT_PUBLIC_* at build time
  // only for this exact form.
  const raw = {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
    NEXT_PUBLIC_PRIVY_AUDIENCE: process.env.NEXT_PUBLIC_PRIVY_AUDIENCE,
    JWKS_URL: process.env.JWKS_URL,
    FMP_API_KEY: process.env.FMP_API_KEY,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  };
  const issues: Issue[] = [];

  const api = url(issues, "NEXT_PUBLIC_API", raw.NEXT_PUBLIC_API, "NEXT_PUBLIC_API must be a valid URL");
  const audience = nonEmpty(
    issues,
    "NEXT_PUBLIC_PRIVY_AUDIENCE",
    raw.NEXT_PUBLIC_PRIVY_AUDIENCE,
    "NEXT_PUBLIC_PRIVY_AUDIENCE is required",
  );
  const jwksUrl =
    raw.JWKS_URL === undefined
      ? undefined
      : url(issues, "JWKS_URL", raw.JWKS_URL, "JWKS_URL must be a valid URL");
  const fmpApiKey =
    raw.FMP_API_KEY === undefined
      ? undefined
      : nonEmpty(issues, "FMP_API_KEY", raw.FMP_API_KEY, "Too small: expected string to have >=1 characters");

  let environment: Environment = "development";
  if (raw.NEXT_PUBLIC_ENVIRONMENT !== undefined) {
    const value = raw.NEXT_PUBLIC_ENVIRONMENT;
    if ((ENVIRONMENTS as readonly string[]).includes(value)) {
      environment = value as Environment;
    } else {
      issues.push({
        path: "NEXT_PUBLIC_ENVIRONMENT",
        message: `Invalid option: expected one of ${ENVIRONMENTS.map((e) => `"${e}"`).join("|")}`,
      });
    }
  }

  if (issues.length > 0 || api === undefined || audience === undefined) {
    // Format error messages
    const errors = issues.map((issue) => `  - ${issue.path}: ${issue.message}`);

    throw new Error(
      `❌ Invalid environment variables:\n${errors.join("\n")}\n\n` +
      `Please check your .env.local file or environment configuration.\n` +
      `Required variables: NEXT_PUBLIC_API, NEXT_PUBLIC_PRIVY_AUDIENCE`
    );
  }

  return {
    NEXT_PUBLIC_API: api,
    NEXT_PUBLIC_PRIVY_AUDIENCE: audience,
    JWKS_URL: jwksUrl,
    FMP_API_KEY: fmpApiKey,
    NEXT_PUBLIC_ENVIRONMENT: environment,
  };
};

/**
 * Variables d'environnement validées
 * Utiliser cet export plutôt que process.env directement
 */
export const env = parseEnv();
