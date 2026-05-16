import type { Prisma } from "@prisma/client";

export type ActivityFilterState = {
  category?: string;
  cursor?: string;
  end?: string;
  family?: boolean;
  indoorOutdoor?: string;
  limit: number;
  location?: string;
  organizer?: string;
  period?: "today" | "tomorrow" | "weekend" | "week";
  price?: "free" | "paid";
  q?: string;
  start?: string;
  type?: string;
};

export type ActivityFilterOptions = {
  categories: Array<{ label: string; value: string }>;
  indoorOutdoor: string[];
  locations: string[];
  organizers: string[];
  types: string[];
};

const defaultLimit = 24;
const maxLimit = 96;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: string | string[] | undefined) {
  const raw = readParam(value)?.trim();
  return raw || undefined;
}

function parseDate(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function weekendRange(now: Date) {
  const today = startOfDay(now);
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  const saturday = addDays(today, daysUntilSaturday);
  return { from: saturday, to: addDays(saturday, 2) };
}

function periodRange(period: ActivityFilterState["period"]) {
  const today = startOfDay(new Date());

  if (period === "today") return { from: today, to: addDays(today, 1) };
  if (period === "tomorrow") return { from: addDays(today, 1), to: addDays(today, 2) };
  if (period === "weekend") return weekendRange(today);
  if (period === "week") return { from: today, to: addDays(today, 7) };

  return {};
}

export function parseActivityFilters(searchParams: Record<string, string | string[] | undefined>): ActivityFilterState {
  const period = clean(searchParams.period);
  const price = clean(searchParams.price);
  const requestedLimit = Number.parseInt(clean(searchParams.limit) ?? `${defaultLimit}`, 10);

  return {
    category: clean(searchParams.category),
    cursor: clean(searchParams.cursor),
    end: clean(searchParams.end),
    family: clean(searchParams.family) === "1",
    indoorOutdoor: clean(searchParams.indoorOutdoor),
    limit: Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), maxLimit) : defaultLimit,
    location: clean(searchParams.location),
    organizer: clean(searchParams.organizer),
    period: period === "today" || period === "tomorrow" || period === "weekend" || period === "week" ? period : undefined,
    price: price === "free" || price === "paid" ? price : undefined,
    q: clean(searchParams.q),
    start: clean(searchParams.start),
    type: clean(searchParams.type),
  };
}

export function buildActivityWhere(filters: ActivityFilterState): Prisma.ActivityWhereInput {
  const and: Prisma.ActivityWhereInput[] = [{ status: "PUBLISHED" }];
  const customStart = parseDate(filters.start);
  const customEnd = parseDate(filters.end);
  const today = startOfDay(new Date());
  const hasCustomDateFilter = Boolean(filters.start || filters.end);
  const range: { from?: Date; to?: Date } = !hasCustomDateFilter && filters.period ? periodRange(filters.period) : {};
  const explicitPastDate = Boolean((customStart && customStart < today) || (!customStart && customEnd && customEnd < today));
  const defaultFrom = !filters.period && !explicitPastDate ? today : undefined;

  const from = customStart ?? range.from ?? defaultFrom;
  const to = customEnd ? addDays(customEnd, 1) : range.to;

  if (from || to) {
    and.push({
      startAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: to } : {}),
      },
    });
  }

  if (filters.category) and.push({ category: { slug: filters.category } });
  if (filters.location) and.push({ location: { name: filters.location } });
  if (filters.organizer) and.push({ organizerName: filters.organizer });
  if (filters.type) and.push({ typeTags: { has: filters.type } });
  if (filters.indoorOutdoor) and.push({ indoorOutdoor: filters.indoorOutdoor });
  if (filters.price === "free") and.push({ typeTags: { has: "Gratis" } });
  if (filters.price === "paid") and.push({ typeTags: { has: "Betaald" } });
  if (filters.family) {
    and.push({
      OR: [{ category: { slug: "kinderen" } }, { typeTags: { has: "Familie" } }, { typeTags: { has: "Kinderen" } }],
    });
  }

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { shortDescription: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { organizerName: { contains: filters.q, mode: "insensitive" } },
        { location: { name: { contains: filters.q, mode: "insensitive" } } },
        { typeTags: { has: filters.q } },
      ],
    });
  }

  return { AND: and };
}

export function toQueryString(filters: ActivityFilterState, overrides: Partial<Record<keyof ActivityFilterState, string | number | boolean | undefined>>) {
  const params = new URLSearchParams();
  const merged = { ...filters, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (key === "limit" && value === defaultLimit) continue;
    if (value === undefined || value === "" || value === false) continue;
    params.set(key, value === true ? "1" : String(value));
  }

  return params.toString();
}
