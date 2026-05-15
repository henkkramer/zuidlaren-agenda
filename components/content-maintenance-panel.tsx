import { contentMaintenanceQueue } from "@/lib/content-maintenance-queue";

export function ContentMaintenancePanel() {
  return (
    <div className="admin-table">
      {contentMaintenanceQueue.map((item) => (
        <div className="admin-row" key={item.title}>
          <span>
            <strong>{item.title}</strong>
            <small>{item.action}</small>
            <small>{item.source}</small>
          </span>
          <span className="status-pill">{item.priority === "high" ? "hoog" : "middel"}</span>
        </div>
      ))}
    </div>
  );
}
