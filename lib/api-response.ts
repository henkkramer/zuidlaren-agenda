export const publicApiCacheControl = "public, max-age=60, stale-while-revalidate=300";

export function publicApiHeaders(apiVersion: string) {
  return {
    "Cache-Control": publicApiCacheControl,
    "X-Zuidlaren-Api-Version": apiVersion,
  };
}
