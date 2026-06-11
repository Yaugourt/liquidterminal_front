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
    throw new LtResponseError(
      `Response failed schema validation: ${result.error.message}`,
      result.error
    );
  }
  return result.data;
}

