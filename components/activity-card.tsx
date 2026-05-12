import { Bookmark, MapPin } from "lucide-react";
import { ActivityDateBadge } from "@/components/activity-date-badge";
import { categoryLabels, type Activity } from "@/lib/activity-types";
import { activityDateParts } from "@/lib/date-format";

export function ActivityCard({ activity, onOpen }: { activity: Activity; onOpen: (activity: Activity) => void }) {
  const parts = activityDateParts(activity);

  return (
    <button
      className="activity-card"
      style={{ backgroundImage: `url(${activity.imageUrl})` }}
      onClick={() => onOpen(activity)}
      aria-label={`${parts.longDate}, ${parts.time}, ${activity.title}, ${activity.locationName}`}
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
          <span className="tag">{categoryLabels[activity.category]}</span>
          {activity.typeTags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <p>{activity.shortDescription}</p>
      </div>
    </button>
  );
}
