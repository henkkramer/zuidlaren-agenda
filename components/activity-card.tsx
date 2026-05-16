import { Bookmark, MapPin } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import { ActivityDateBadge } from "@/components/activity-date-badge";
import { categoryLabels, type Activity, type ActivityCategory } from "@/lib/activity-types";
import { activityDateParts } from "@/lib/date-format";

function filterHref(key: "category" | "indoorOutdoor" | "type", value: string) {
  const params = new URLSearchParams({ [key]: value });
  return `/?${params.toString()}`;
}

function stopCardOpen(event: MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

function uniqueTags(activity: Activity) {
  const tags = [...activity.typeTags];

  if (activity.indoorOutdoor && !tags.includes(activity.indoorOutdoor)) {
    tags.unshift(activity.indoorOutdoor);
  }

  return [...new Set(tags)];
}

export function ActivityCard({
  activity,
  enableFilterLinks = false,
  onOpen,
}: {
  activity: Activity;
  enableFilterLinks?: boolean;
  onOpen: (activity: Activity) => void;
}) {
  const parts = activityDateParts(activity);
  const tags = uniqueTags(activity);

  function open() {
    onOpen(activity);
  }

  function openFromKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  }

  return (
    <article
      className="activity-card"
      style={{ backgroundImage: `url(${activity.imageUrl})` }}
      aria-label={`${parts.longDate}, ${parts.time}, ${activity.title}, ${activity.locationName}`}
      onClick={open}
      onKeyDown={openFromKeyboard}
      role="button"
      tabIndex={0}
    >
      <div className="activity-card-heading">
        <ActivityDateBadge activity={activity} />
        <h3>{activity.title}</h3>
      </div>
      <span className="bookmark-float" aria-hidden="true">
        <Bookmark size={21} />
      </span>
      <div className="activity-card-content">
        <div className="meta-line">
          <MapPin size={15} />
          {activity.locationName}
        </div>
        <div className="tag-row">
          {enableFilterLinks ? (
            <a className="tag tag-link" href={filterHref("category", activity.category)} onClick={stopCardOpen}>
              {categoryLabels[activity.category as ActivityCategory]}
            </a>
          ) : (
            <span className="tag">{categoryLabels[activity.category as ActivityCategory]}</span>
          )}
          {tags.map((tag) =>
            enableFilterLinks ? (
              <a className="tag tag-link" href={filterHref(tag === "Binnen" || tag === "Buiten" || tag === "Gemengd" ? "indoorOutdoor" : "type", tag)} key={tag} onClick={stopCardOpen}>
                {tag}
              </a>
            ) : (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ),
          )}
        </div>
        <p>{activity.shortDescription}</p>
      </div>
    </article>
  );
}
