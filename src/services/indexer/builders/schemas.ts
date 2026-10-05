import * as z from "@/lib/zod-mini";

const BuildersTimeframeSchema = z.enum(["1h", "24h", "7d", "30d"]);

const BuilderListRowSchema = z.object({
  address: z.string(),
  // 748/1037 rows in /builders/list ship name:null (unnamed builders) and a
  // few ship referrerStage:null; rendering falls back to a truncated address.
  name: z.nullable(z.string()),
  referredBy: z.nullable(z.string()),
  referrerStage: z.nullable(z.string()),
});

const BuilderStatsMetricsSchema = z.object({
  fillCount: z.number(),
  totalVolume: z.number(),
  totalFees: z.number(),
  totalBuilderFees: z.number(),
  uniqueBuilders: z.optional(z.number()),
  uniqueUsers: z.number(),
  uniqueCoins: z.number(),
});

const BuilderStatsVariationsSchema = z.object({
  fillCountPct: z.optional(z.nullable(z.number())),
  totalVolumePct: z.optional(z.nullable(z.number())),
  totalFeesPct: z.optional(z.nullable(z.number())),
  totalBuilderFeesPct: z.optional(z.nullable(z.number())),
  uniqueBuildersPct: z.optional(z.nullable(z.number())),
  uniqueUsersPct: z.optional(z.nullable(z.number())),
});

export const BuildersGlobalStatsPayloadSchema = z.object({
  timeframe: BuildersTimeframeSchema,
  current: BuilderStatsMetricsSchema,
  previous: BuilderStatsMetricsSchema,
  variations: BuilderStatsVariationsSchema,
});

const BuildersTimeframeBlock = z.object({
  current: BuilderStatsMetricsSchema,
  previous: BuilderStatsMetricsSchema,
  variations: BuilderStatsVariationsSchema,
});

export const BuildersAllTimeframesPayloadSchema = z.object({
  "1h": BuildersTimeframeBlock,
  "24h": BuildersTimeframeBlock,
  "7d": BuildersTimeframeBlock,
  "30d": BuildersTimeframeBlock,
});

const BuilderTopRowSchema = z.object({
  builder: z.string(),
  builderName: z.union([z.string(), z.null(), z.record(z.string(), z.unknown())]),
  fillCount: z.number(),
  totalVolume: z.number(),
  totalFees: z.number(),
  totalBuilderFees: z.number(),
  uniqueUsers: z.number(),
  uniqueCoins: z.number(),
});

export const BuildersTopPayloadSchema = z.object({
  timeframe: BuildersTimeframeSchema,
  sort: z.string(),
  builders: z.array(BuilderTopRowSchema),
});

// Upstream-evolving shape: keep additional keys with catchall.
const BuilderCoinBreakdownRowSchema = z.catchall(
  z.object({
    coin: z.optional(z.string()),
    fillCount: z.optional(z.number()),
    totalVolume: z.optional(z.number()),
    totalFees: z.optional(z.number()),
    totalBuilderFees: z.optional(z.number()),
    uniqueUsers: z.optional(z.number()),
  }),
  z.unknown()
);

export const BuilderDetailStatsPayloadSchema = z.object({
  builder: z.string(),
  builderName: z.nullable(z.string()),
  timeframe: BuildersTimeframeSchema,
  current: z.omit(BuilderStatsMetricsSchema, { uniqueBuilders: true }),
  previous: z.omit(BuilderStatsMetricsSchema, { uniqueBuilders: true }),
  variations: BuilderStatsVariationsSchema,
  coinBreakdown: z.array(BuilderCoinBreakdownRowSchema),
});

const BuilderUserRowSchema = z.catchall(
  z.object({
    user: z.optional(z.string()),
    address: z.optional(z.string()),
    totalBuilderFees: z.optional(z.number()),
    builderFees: z.optional(z.number()),
    volume: z.optional(z.number()),
  }),
  z.unknown()
);

export const BuilderUsersPayloadSchema = z.object({
  timeframe: BuildersTimeframeSchema,
  builder: z.string(),
  users: z.array(BuilderUserRowSchema),
});

export const BuilderListRowsArraySchema = z.array(BuilderListRowSchema);
