export type AuditActionCoverage = {
  action: string;
  source: string;
  purpose: string;
};

export const sensitiveAuditActions: AuditActionCoverage[] = [
  {
    action: "operator.admin.ensure",
    source: "scripts/ensure-admin.ts",
    purpose: "First admin creation or promotion.",
  },
  {
    action: "business.member.upsert",
    source: "app/api/businesses/[businessId]/members/route.ts",
    purpose: "Business owner adds or reactivates a member.",
  },
  {
    action: "business.member.update",
    source: "app/api/businesses/[businessId]/members/[memberId]/route.ts",
    purpose: "Business owner changes member role or permissions.",
  },
  {
    action: "business.member.deactivate",
    source: "app/api/businesses/[businessId]/members/[memberId]/route.ts",
    purpose: "Business owner removes member access.",
  },
  {
    action: "business.activity.create",
    source: "app/api/businesses/[businessId]/activities/route.ts",
    purpose: "Business user creates a draft activity.",
  },
  {
    action: "business.activity.update",
    source: "app/api/businesses/[businessId]/activities/[activityId]/route.ts",
    purpose: "Business user edits an activity.",
  },
  {
    action: "business.activity.publish",
    source: "app/api/businesses/[businessId]/activities/[activityId]/publish/route.ts",
    purpose: "Business user publishes an activity.",
  },
  {
    action: "business.activity.unpublish",
    source: "app/api/businesses/[businessId]/activities/[activityId]/unpublish/route.ts",
    purpose: "Business user unpublishes an activity.",
  },
  {
    action: "notification_campaign.request",
    source: "lib/notification-audit.ts",
    purpose: "Business user requests a notification campaign.",
  },
  {
    action: "notification_campaign.approve",
    source: "app/api/admin/notification-campaigns/[campaignId]/approve/route.ts",
    purpose: "Admin approves a notification campaign.",
  },
  {
    action: "admin.business.status.update",
    source: "app/api/admin/businesses/[businessId]/route.ts",
    purpose: "Admin approves, suspends, or resets a business.",
  },
  {
    action: "admin.activity.status.update",
    source: "app/api/admin/activities/[activityId]/route.ts",
    purpose: "Admin moderates an activity status.",
  },
  {
    action: "admin.user.update",
    source: "app/api/admin/users/[userId]/route.ts",
    purpose: "Admin disables users or changes admin rights.",
  },
  {
    action: "admin.report.update",
    source: "app/api/admin/reports/[reportId]/route.ts",
    purpose: "Admin reviews or dismisses a report.",
  },
  {
    action: "admin.category.create",
    source: "app/api/admin/categories/route.ts",
    purpose: "Admin creates an activity category.",
  },
  {
    action: "admin.category.update",
    source: "app/api/admin/categories/[categoryId]/route.ts",
    purpose: "Admin updates an activity category.",
  },
  {
    action: "admin.feature_flag.update",
    source: "app/api/admin/feature-flags/route.ts",
    purpose: "Admin changes feature availability.",
  },
];
