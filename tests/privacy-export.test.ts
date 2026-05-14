import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPrivacyExport } from "@/lib/privacy-export";

const date = new Date("2026-05-14T10:00:00.000Z");

test("privacy export contains user-owned fields without auth internals", () => {
  const exported = buildPrivacyExport({
    id: "user-1",
    email: "tester@example.nl",
    displayName: "Tester",
    locale: "nl-NL",
    deletionRequestedAt: null,
    createdAt: date,
    updatedAt: date,
    notificationPreferences: {
      activityReminders: true,
      weeklyDigest: false,
      businessUpdates: false,
      categorySlugs: ["markt"],
      locationSlugs: ["centrum"],
    },
    attendances: [
      {
        status: "GOING",
        visibility: "PRIVATE",
        createdAt: date,
        updatedAt: date,
        activity: {
          slug: "braderie-zuidlaren",
          title: "Braderie Zuidlaren",
          startAt: date,
          endAt: date,
          organizerName: "Organisatie",
          category: { name: "Markt", slug: "markt" },
          location: { name: "Centrum", slug: "centrum" },
        },
      },
    ],
    businessMemberships: [
      {
        role: "OWNER",
        active: true,
        canPublishActivities: true,
        createdAt: date,
        updatedAt: date,
        business: { name: "Testbedrijf", slug: "testbedrijf", status: "APPROVED" },
      },
    ],
  });

  assert.equal(exported.profile.email, "tester@example.nl");
  assert.equal(exported.attendances[0].visibility, "private");
  assert.equal(exported.businessMemberships[0].role, "owner");
  assert.equal("sessions" in exported, false);
  assert.equal("accounts" in exported, false);
});
