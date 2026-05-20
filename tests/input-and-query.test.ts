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
  assert.equal(toQueryString(filters, { limit: 50 }), "family=1&period=week&price=free&q=muziek&type=Concert");
});

test("activity filters include my attendance only for authenticated users", () => {
  const filters = parseActivityFilters({ going: "1" });

  assert.equal(filters.going, true);
  assert.equal(toQueryString(filters, { limit: 50 }), "going=1");

  const anonymousWhere = buildActivityWhere(filters);
  assert.ok(Array.isArray(anonymousWhere.AND));
  assert.deepEqual(anonymousWhere.AND.at(-1), { id: "__no_authenticated_user__" });

  const userWhere = buildActivityWhere(filters, "user-1");
  assert.ok(Array.isArray(userWhere.AND));
  assert.deepEqual(userWhere.AND.at(-1), {
    attendances: { some: { userId: "user-1", status: "GOING" } },
  });
});

test("activity filters default to upcoming events and allow explicit past date ranges", () => {
  const defaultWhere = buildActivityWhere(parseActivityFilters({}));
  assert.ok(Array.isArray(defaultWhere.AND));
  const defaultDateClause = defaultWhere.AND.find((clause) => "startAt" in clause) as { startAt: { gte?: Date; lt?: Date } } | undefined;
  assert.ok(defaultDateClause?.startAt.gte);
  assert.equal(defaultDateClause.startAt.lt, undefined);

  const pastWhere = buildActivityWhere(parseActivityFilters({ end: "2026-01-10" }));
  assert.ok(Array.isArray(pastWhere.AND));
  const pastDateClause = pastWhere.AND.find((clause) => "startAt" in clause) as { startAt: { gte?: Date; lt?: Date } } | undefined;
  assert.equal(pastDateClause?.startAt.gte, undefined);
  assert.equal(pastDateClause?.startAt.lt?.getFullYear(), 2026);
  assert.equal(pastDateClause?.startAt.lt?.getMonth(), 0);
  assert.equal(pastDateClause?.startAt.lt?.getDate(), 11);

  const futureEndWhere = buildActivityWhere(parseActivityFilters({ end: "2999-01-10" }));
  assert.ok(Array.isArray(futureEndWhere.AND));
  const futureEndDateClause = futureEndWhere.AND.find((clause) => "startAt" in clause) as { startAt: { gte?: Date; lt?: Date } } | undefined;
  assert.ok(futureEndDateClause?.startAt.gte);
  assert.equal(futureEndDateClause?.startAt.lt?.getFullYear(), 2999);
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
