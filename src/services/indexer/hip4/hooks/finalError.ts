/**
 * True when a `useDataFetching` error is final. While a retry is scheduled the
 * hook reports "Retry attempt N of M: …" and keeps fetching in the background,
 * so a page that treats that error as final would flash its error state.
 */
export function isFinalError(error: Error | null): boolean {
  return error != null && !error.message.startsWith("Retry attempt ");
}
