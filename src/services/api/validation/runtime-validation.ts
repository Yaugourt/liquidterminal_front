import { z, ZodType } from "zod";

/**
 * Backend envelope: `{ success, data, error?, message? }`.
 * `parseLtData(schema, body)` unwraps and validates `data`.
 * `parseLtEnvelope(body)` only unwraps — use it during incremental migration when no schema exists yet.
 */

const LtEnvelopeShape = z.object({
  success: z.boolean().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

class LtResponseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "LtResponseError";
  }
}

function unwrap(body: unknown): unknown {
  const parsed = LtEnvelopeShape.safeParse(body);
  if (!parsed.success) {
    throw new LtResponseError("Invalid API response envelope");
  }
  const env = parsed.data;
  if (env.success === false) {
    throw new LtResponseError(env.error ?? env.message ?? "Request failed");
  }
  if (!("data" in env) || env.data === undefined) {
    throw new LtResponseError("Invalid API response: missing data");
  }
  return env.data;
}

export function parseLtData<T>(schema: ZodType<T>, body: unknown): T {
  const data = unwrap(body);
  const result = schema.safeParse(data);
  if (!result.success) {
    // Keep the message human-readable: the full ZodError JSON ends up rendered
    // in UI error states, so summarize instead of dumping every issue.
    const issues = result.error.issues;
    const first = issues[0];
    const where = first && first.path.length > 0 ? ` at "${first.path.join(".")}"` : "";
    const detail = first ? `${first.message}${where}` : "invalid payload";
    const more = issues.length > 1 ? ` (+${issues.length - 1} more issues)` : "";
    throw new LtResponseError(
      `Unexpected API response shape: ${detail}${more}`,
      result.error
    );
  }
  return result.data;
}

