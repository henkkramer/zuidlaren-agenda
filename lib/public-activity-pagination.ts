import type { Prisma } from "@prisma/client";

export type PublicActivityCursor = {
  slug: string;
  startAt: Date;
};

export function buildPublicActivityCursor(input: PublicActivityCursor) {
  return `${input.startAt.toISOString()}__${input.slug}`;
}

export function parsePublicActivityCursor(cursor: string | undefined): PublicActivityCursor | null {
  if (!cursor) return null;

  const separator = cursor.indexOf("__");
  if (separator <= 0) return null;

  const startAt = new Date(cursor.slice(0, separator));
  const slug = cursor.slice(separator + 2).trim();

  if (Number.isNaN(startAt.getTime()) || !slug) return null;

  return { slug, startAt };
}

export function buildPublicActivityCursorWhere(cursor: string | undefined): Prisma.ActivityWhereInput | null {
  const parsed = parsePublicActivityCursor(cursor);
  if (!parsed) return null;

  return {
    OR: [
      { startAt: { gt: parsed.startAt } },
      {
        AND: [{ startAt: parsed.startAt }, { slug: { gt: parsed.slug } }],
      },
    ],
  };
}

export type CursorPagination = {
  cursor?: string;
  limit: number;
};

export function parseCursorPagination(
  searchParams: URLSearchParams,
  options: { defaultLimit: number; maxLimit: number },
): CursorPagination {
  const parsedLimit = Number(searchParams.get("limit"));
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), options.maxLimit)
    : options.defaultLimit;
  const cursor = searchParams.get("cursor")?.trim() || undefined;

  return { cursor, limit };
}

export function prismaIdCursor(cursor: string | undefined) {
  return cursor ? { cursor: { id: decodeURIComponent(cursor) }, skip: 1 } : {};
}

export function pageResult<T extends { id: string }>(rows: T[], limit: number) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items.at(-1)?.id ?? null : null;

  return { hasMore, items, nextCursor };
}
