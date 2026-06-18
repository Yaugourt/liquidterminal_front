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
