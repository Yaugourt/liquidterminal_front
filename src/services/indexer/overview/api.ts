import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type { DailyVolumeEntry, OverviewStat24h } from "./types";

const OVERVIEW = "/indexer/overview";

const OVERVIEW_GET_OPTIONS = { retryOnError: false } as const;

function assertLtData<T>(body: unknown): T {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid API response");
  }
  const r = body as { success?: boolean; data?: unknown; error?: string };
  if (r.success === false) {
    throw new Error(typeof r.error === "string" ? r.error : "Request failed");
  }
  if (!("data" in r)) {
    throw new Error("Invalid API response");
  }
  return r.data as T;
}

export async function fetchDailyVolume10d(): Promise<DailyVolumeEntry[]> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${OVERVIEW}/daily-volume-10d`,
      undefined,
      OVERVIEW_GET_OPTIONS
    );
    return assertLtData<DailyVolumeEntry[]>(raw);
  }, "fetching overview daily volume 10d");
}

export async function fetchActiveTraders24h(): Promise<OverviewStat24h> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${OVERVIEW}/active-traders-24h`,
      undefined,
      OVERVIEW_GET_OPTIONS
    );
    return assertLtData<OverviewStat24h>(raw);
  }, "fetching active traders 24h");
}

export async function fetchTotalFills24h(): Promise<OverviewStat24h> {
  return withErrorHandling(async () => {
    const raw = await get<unknown>(
      `${OVERVIEW}/total-fills-24h`,
      undefined,
      OVERVIEW_GET_OPTIONS
    );
    return assertLtData<OverviewStat24h>(raw);
  }, "fetching total fills 24h");
}
