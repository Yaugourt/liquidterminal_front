/**
 * The zod/mini functions the app uses, re-exported by name. Import as
 * `import * as z from "@/lib/zod-mini"`.
 *
 * Importing `zod/mini` itself (`{ z }` or `* as z`) hands Turbopack the
 * library's whole namespace object, which it can't tree-shake: every schema
 * type, `toJSONSchema` and ~40 locales shipped with the dashboard. Named
 * re-exports keep only what is listed here — add a function when a schema
 * needs it.
 */
export {
  array,
  boolean,
  catchall,
  enum,
  null,
  nullable,
  number,
  object,
  omit,
  optional,
  record,
  regex,
  string,
  union,
  unknown,
} from "zod/mini";
export type { ZodMiniType } from "zod/mini";
