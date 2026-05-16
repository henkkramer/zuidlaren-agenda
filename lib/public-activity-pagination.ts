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
