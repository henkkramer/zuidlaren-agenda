export const mobileApiVersion = "2026-05-14";

export type MobileEndpointContract = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  auth: "public" | "session";
  purpose: string;
};

export type CalendarEndpointContract = {
  method: "GET";
  path: string;
  auth: "public" | "session";
  cache: "public, max-age=60, stale-while-revalidate=300" | "private, no-store";
  contentType: "text/calendar; charset=utf-8";
  conditionalRequests: "If-None-Match returns 304 Not Modified when ETag matches";
  rateLimit: "429 with Retry-After";
};

export const calendarEndpointContracts: CalendarEndpointContract[] = [
  {
    method: "GET",
    path: "/api/public/calendar",
    auth: "public",
    cache: "public, max-age=60, stale-while-revalidate=300",
    contentType: "text/calendar; charset=utf-8",
    conditionalRequests: "If-None-Match returns 304 Not Modified when ETag matches",
    rateLimit: "429 with Retry-After",
  },
  {
    method: "GET",
    path: "/api/public/activities/{activityId}/calendar",
    auth: "public",
    cache: "public, max-age=60, stale-while-revalidate=300",
    contentType: "text/calendar; charset=utf-8",
    conditionalRequests: "If-None-Match returns 304 Not Modified when ETag matches",
    rateLimit: "429 with Retry-After",
  },
  {
    method: "GET",
    path: "/api/me/agenda/calendar",
    auth: "session",
    cache: "private, no-store",
    contentType: "text/calendar; charset=utf-8",
    conditionalRequests: "If-None-Match returns 304 Not Modified when ETag matches",
    rateLimit: "429 with Retry-After",
  },
];

export const mobileEndpointContracts: MobileEndpointContract[] = [
  {
    method: "GET",
    path: "/api/mobile/capabilities",
    auth: "public",
    purpose: "Discover supported API version, auth direction, and native push readiness.",
  },
  {
    method: "GET",
    path: "/api/public/activities",
    auth: "public",
    purpose: "List published activities with the same filters used by the web agenda and cursor pagination for mobile clients.",
  },
  {
    method: "GET",
    path: "/api/public/calendar",
    auth: "public",
    purpose: "Subscribe to published public agenda items as an iCalendar feed.",
  },
  {
    method: "GET",
    path: "/api/public/activities/{activityId}/calendar",
    auth: "public",
    purpose: "Download a single published activity as an iCalendar event.",
  },
  {
    method: "GET",
    path: "/api/public/activities/{activityId}",
    auth: "public",
    purpose: "Read one published activity by slug.",
  },
  {
    method: "GET",
    path: "/api/me",
    auth: "session",
    purpose: "Read the current account profile.",
  },
  {
    method: "GET",
    path: "/api/me/agenda",
    auth: "session",
    purpose: "Read the signed-in user's private agenda.",
  },
  {
    method: "GET",
    path: "/api/me/agenda/calendar",
    auth: "session",
    purpose: "Export the signed-in user's saved agenda as an iCalendar feed.",
  },
  {
    method: "PATCH",
    path: "/api/me/notification-preferences",
    auth: "session",
    purpose: "Update notification opt-ins and filter preferences.",
  },
  {
    method: "POST",
    path: "/api/activities/{activityId}/attendance",
    auth: "session",
    purpose: "Create or replace attendance for the signed-in user.",
  },
  {
    method: "PATCH",
    path: "/api/activities/{activityId}/attendance",
    auth: "session",
    purpose: "Update attendance status or visibility for the signed-in user.",
  },
  {
    method: "DELETE",
    path: "/api/activities/{activityId}/attendance",
    auth: "session",
    purpose: "Remove attendance for the signed-in user.",
  },
];

export function buildMobileCapabilities() {
  return {
    apiVersion: mobileApiVersion,
    locale: "nl-NL",
    auth: {
      currentStrategy: "next-auth database session cookie",
      mobileLaunchDirection: "add Apple/Google OAuth and token exchange before native app launch",
      supportsBearerTokens: false,
      plannedOAuthProviders: ["apple", "google"],
    },
    push: {
      currentStrategy: "email/web notification preferences only",
      nativeLaunchDirection: "register APNS and FCM device tokens after OAuth/token strategy is ready",
      plannedProviders: ["apns", "fcm"],
      deviceTokenRegistration: "planned",
    },
    endpoints: mobileEndpointContracts,
    calendarExports: calendarEndpointContracts,
  };
}
