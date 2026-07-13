/** Kinds a global-search result can be; drives grouping, icon and analytics. */
export type SearchResultKind =
  | "page"
  | "spot-token"
  | "perp-market"
  | "validator"
  | "vault"
  | "project"
  | "wiki"
  | "address"
  | "transaction"
  | "block";

export interface SearchResult {
  /** Stable id, unique across the whole index (kind-prefixed). */
  id: string;
  kind: SearchResultKind;
  label: string;
  /** Secondary line: address, category, description... */
  sublabel?: string;
  href: string;
  /** Opens in a new tab (wiki resources point at their source). */
  external?: boolean;
}

/** One searchable corpus, loaded lazily when the palette opens. */
export interface SearchSource {
  kind: SearchResultKind;
  results: SearchResult[];
}
