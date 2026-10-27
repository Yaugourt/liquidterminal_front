/** A partner offer, as the backend serves it (GET /perks or /perks/public). */
export interface Perk {
  id: string;
  partner: string;
  partnerUrl: string;
  title: string;
  description: string;
  /** `members`: link and code are only sent to a signed-in user. */
  access: "public" | "members";
  /** Absent on a members offer for a visitor. */
  cta?: { label: string; href: string };
  code?: string;
  /** Last day, YYYY-MM-DD (UTC). */
  expires?: string;
  /** True when this answer left out the link and code. */
  locked: boolean;
}

export interface PerksResponse {
  success: boolean;
  data: Perk[];
}
