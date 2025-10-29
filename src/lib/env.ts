import { z } from "zod";

/**
 * Schema de validation des variables d'environnement
 * Échoue au démarrage si des variables critiques manquent
 */
const envSchema = z.object({
  // API Backend
  NEXT_PUBLIC_API: z.string().url("NEXT_PUBLIC_API must be a valid URL"),

  // Privy Auth
  NEXT_PUBLIC_PRIVY_AUDIENCE: z.string().min(1, "NEXT_PUBLIC_PRIVY_AUDIENCE is required"),
  JWKS_URL: z.string().url("JWKS_URL must be a valid URL").optional(),

  // Environment
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),
});

/**
 * Parse et valide les variables d'environnement
 * Lance une erreur explicite si validation échoue
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
    NEXT_PUBLIC_PRIVY_AUDIENCE: process.env.NEXT_PUBLIC_PRIVY_AUDIENCE,
    JWKS_URL: process.env.JWKS_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  });

  if (!parsed.success) {
    // Format error messages
    const errors = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
    );
    
    throw new Error(
      `❌ Invalid environment variables:\n${errors.join("\n")}\n\n` +
      `Please check your .env.local file or environment configuration.\n` +
      `Required variables: NEXT_PUBLIC_API, NEXT_PUBLIC_PRIVY_AUDIENCE`
    );
  }

  return parsed.data;
};

/**
 * Variables d'environnement validées
 * Utiliser cet export plutôt que process.env directement
 */
export const env = parseEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

