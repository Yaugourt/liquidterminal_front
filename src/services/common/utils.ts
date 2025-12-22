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
