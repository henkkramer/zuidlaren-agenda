import Image from "next/image";
import { Bookmark, MapPin } from "lucide-react";
import { ActivityDateBadge } from "@/components/activity-date-badge";
import { categoryLabels, type Activity, type ActivityCategory } from "@/lib/activity-types";
import { activityDateParts } from "@/lib/date-format";

function filterHref(key: "category" | "indoorOutdoor" | "type", value: string) {
  const params = new URLSearchParams({ [key]: value });
  return "/?" + params.toString();
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
  priority = false,
}: {
  activity: Activity;
  enableFilterLinks?: boolean;
  onOpen?: (activity: Activity) => void;
  priority?: boolean;
}) {
  const parts = activityDateParts(activity);
  const tags = uniqueTags(activity);
  const detailHref = "/activity/" + encodeURIComponent(activity.id);

  return (
    <article
      className="activity-card"
      aria-label={parts.longDate + ", " + parts.time + ", " + activity.title + ", " + activity.locationName}
    >
      <Image
        alt=""
        className="activity-card-image"
        fill
        priority={priority}
        sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 430px"
        src={activity.imageUrl}
      />
      {onOpen ? (
        <button className="activity-card-open" type="button" onClick={() => onOpen(activity)} aria-label={activity.title + " bekijken"} />
      ) : (
        <a className="activity-card-open" href={detailHref} aria-label={activity.title + " bekijken"} />
      )}
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
            <a className="tag tag-link" href={filterHref("category", activity.category)}>
              {categoryLabels[activity.category as ActivityCategory]}
            </a>
          ) : (
            <span className="tag">{categoryLabels[activity.category as ActivityCategory]}</span>
          )}
          {tags.map((tag) =>
            enableFilterLinks ? (
              <a className="tag tag-link" href={filterHref(tag === "Binnen" || tag === "Buiten" || tag === "Gemengd" ? "indoorOutdoor" : "type", tag)} key={tag}>
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
