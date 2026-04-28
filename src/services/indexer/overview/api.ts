import { get } from "@/services/api/axios-config";
import { withErrorHandling } from "@/services/api/error-handler";
import type { DailyVolumeEntry } from "./types";

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
