/**
 * True when a `useDataFetching` error is final. The hook now publishes an
 * error only once its retries are exhausted (and only when it has no data to
 * show); the prefix check stays as a guard for any "Retry attempt N of M: …"
 * error, which would mean a retry is still pending.
 */
export function isFinalError(error: Error | null): boolean {
  return error != null && !error.message.startsWith("Retry attempt ");
}
