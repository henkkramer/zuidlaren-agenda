import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBusinessActivityPayload } from "@/lib/business-activity-input";
import { buildActivityWhere, parseActivityFilters, toQueryString } from "@/lib/public-activity-query";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

test("business activity payload trims fields and rejects invalid date order", () => {
  const parsed = parseBusinessActivityPayload(
    {
      title: "  Dorpsconcert  ",
      shortDescription: "Muziek in het dorp",
      description: "Een avond met lokale muziek.",
      locationName: "Brink",
      startAt: "2026-06-01T18:00:00.000Z",
      endAt: "2026-06-01T20:00:00.000Z",
      sourceUrl: "https://example.nl",
      typeTags: "Muziek, Gratis",
    },
    "Culturele Vereniging",
  );

  assert.equal(parsed.title, "Dorpsconcert");
  assert.deepEqual(parsed.typeTags, ["Muziek", "Gratis"]);
  assert.equal(parsed.slug, "dorpsconcert-2026-06-01");

  assert.throws(
    () =>
      parseBusinessActivityPayload(
        {
          title: "Fout",
          shortDescription: "Korte tekst",
          description: "Beschrijving",
          locationName: "Brink",
          startAt: "2026-06-01T20:00:00.000Z",
          endAt: "2026-06-01T18:00:00.000Z",
        },
        "Organisatie",
      ),
    /Startdatum moet voor einddatum liggen/,
  );
});

test("activity filters clamp limit and build stable query state", () => {
  const filters = parseActivityFilters({
    family: "1",
    limit: "500",
    period: "week",
    price: "free",
    q: " muziek ",
    type: ["Concert", "Theater"],
  });

  assert.equal(filters.limit, 96);
  assert.equal(filters.family, true);
  assert.equal(filters.type, "Concert");
  assert.equal(filters.q, "muziek");

  const where = buildActivityWhere(filters);
  assert.ok(Array.isArray(where.AND));
  assert.equal(toQueryString(filters, { limit: 24 }), "family=1&period=week&price=free&q=muziek&type=Concert");
});

test("rate limit blocks after configured allowance", () => {
  const key = `test:${Date.now()}:${Math.random()}`;

  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).limited, false);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).limited, false);

  const limited = checkRateLimit({ key, limit: 2, windowMs: 60_000 });
  assert.equal(limited.limited, true);

  const response = rateLimitResponse(limited.resetAt);
  assert.equal(response.init.status, 429);
  assert.equal(response.body.error, "Te veel aanvragen. Probeer het later opnieuw.");
});
