import { get } from "../api/axios-config";
import { withErrorHandling } from "../api/error-handler";
import type { Perk, PerksResponse } from "./types";

/** Every running offer; members offers come without link or code. */
export const fetchPublicPerks = async (): Promise<Perk[]> =>
  withErrorHandling(async () => (await get<PerksResponse>("/perks/public")).data ?? [], "fetching perks");

/**
 * Every running offer with links and codes (signed in). Never cached
 * client-side: the answer belongs to the signed-in session.
 */
export const fetchMemberPerks = async (): Promise<Perk[]> =>
  withErrorHandling(
    async () => (await get<PerksResponse>("/perks", undefined, { useCache: false, awaitAuth: true })).data ?? [],
    "fetching member perks"
  );
