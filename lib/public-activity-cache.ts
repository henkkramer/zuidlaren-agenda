import { revalidateTag } from "next/cache";

export const publicActivityFeedCacheTag = "activity-feed";
export const publicFilterOptionsCacheTag = "filter-options";

export function revalidatePublicActivityCaches(options: { filterOptions?: boolean } = {}) {
  revalidateTag(publicActivityFeedCacheTag);

  if (options.filterOptions) {
    revalidateTag(publicFilterOptionsCacheTag);
  }
}