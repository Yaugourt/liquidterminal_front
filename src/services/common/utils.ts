/**
 * Builds URLSearchParams from a simple object.
 * Handles:
 * - filtering out undefined/null values
 * - arrays (repeated keys)
 * - booleans/numbers (converted to strings)
 */
export const buildQueryParams = (params: Record<string, unknown>): URLSearchParams => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach((v) => queryParams.append(key, v.toString()));
            } else {
                queryParams.append(key, value.toString());
            }
        }
    });

    return queryParams;
};

/**
 * Extract a readable string from any thrown value.
 * Handles Error instances, strings, and {message} shapes without trusting `error.message` blindly.
 */
export const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === "string") return m;
    }
    return "Unknown error";
};

/**
 * Strip `undefined`/`null`/`""` entries — useful before passing params to `useDataFetching`'s
 * fetchFn and to keep dependency keys stable.
 */
export const cleanParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
    const out: Partial<T> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        (out as Record<string, unknown>)[key] = value;
    }
    return out;
};

/**
 * Deterministic JSON stringify (sorts object keys) — safer dependency key for hooks
 * than raw `JSON.stringify` which depends on insertion order.
 */
export const stableKey = (value: unknown): string => {
    return JSON.stringify(value, (_k, v) => {
        if (v && typeof v === "object" && !Array.isArray(v)) {
            const sorted: Record<string, unknown> = {};
            for (const k of Object.keys(v as Record<string, unknown>).sort()) {
                sorted[k] = (v as Record<string, unknown>)[k];
            }
            return sorted;
        }
        return v;
    });
};
