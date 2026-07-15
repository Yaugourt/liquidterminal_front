import { z } from "zod";

const BuildersTimeframeSchema = z.enum(["1h", "24h", "7d", "30d"]);

const BuilderListRowSchema = z.object({
  address: z.string(),
  // 748/1037 rows in /builders/list ship name:null (unnamed builders) and a
  // few ship referrerStage:null; rendering falls back to a truncated address.
  name: z.string().nullable(),
  referredBy: z.string().nullable(),
  referrerStage: z.string().nullable(),
});

const BuilderStatsMetricsSchema = z.object({
  fillCount: z.number(),
  totalVolume: z.number(),
  totalFees: z.number(),
  totalBuilderFees: z.number(),
  uniqueBuilders: z.number().optional(),
  uniqueUsers: z.number(),
  uniqueCoins: z.number(),
});

const BuilderStatsVariationsSchema = z.object({
  fillCountPct: z.number().nullable().optional(),
  totalVolumePct: z.number().nullable().optional(),
  totalFeesPct: z.number().nullable().optional(),
  totalBuilderFeesPct: z.number().nullable().optional(),
  uniqueBuildersPct: z.number().nullable().optional(),
  uniqueUsersPct: z.number().nullable().optional(),
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
const BuilderCoinBreakdownRowSchema = z
  .object({
    coin: z.string().optional(),
    fillCount: z.number().optional(),
    totalVolume: z.number().optional(),
    totalFees: z.number().optional(),
    totalBuilderFees: z.number().optional(),
    uniqueUsers: z.number().optional(),
  })
  .catchall(z.unknown());

export const BuilderDetailStatsPayloadSchema = z.object({
  builder: z.string(),
  builderName: z.string().nullable(),
  timeframe: BuildersTimeframeSchema,
  current: BuilderStatsMetricsSchema.omit({ uniqueBuilders: true }),
  previous: BuilderStatsMetricsSchema.omit({ uniqueBuilders: true }),
  variations: BuilderStatsVariationsSchema,
  coinBreakdown: z.array(BuilderCoinBreakdownRowSchema),
});

const BuilderUserRowSchema = z
  .object({
    user: z.string().optional(),
    address: z.string().optional(),
    totalBuilderFees: z.number().optional(),
    builderFees: z.number().optional(),
    volume: z.number().optional(),
  })
  .catchall(z.unknown());

export const BuilderUsersPayloadSchema = z.object({
  timeframe: BuildersTimeframeSchema,
  builder: z.string(),
  users: z.array(BuilderUserRowSchema),
});

export const BuilderListRowsArraySchema = z.array(BuilderListRowSchema);
