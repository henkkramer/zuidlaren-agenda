import type { Prisma } from "@prisma/client";

export const activityRecordSelect = {
  slug: true,
  title: true,
  shortDescription: true,
  description: true,
  imageUrl: true,
  startAt: true,
  endAt: true,
  category: { select: { slug: true } },
  location: { select: { name: true, address: true } },
  typeTags: true,
  organizerName: true,
  sourceUrl: true,
  indoorOutdoor: true,
  expectedVisitors: true,
  sourceQuality: true,
  _count: {
    select: {
      attendances: {
        where: {
          status: "GOING",
          visibility: "PUBLIC",
        },
      },
    },
  },
} satisfies Prisma.ActivitySelect;

export const activityRecordWithMyAttendanceSelect = {
  ...activityRecordSelect,
  attendances: {
    select: { status: true, visibility: true },
    take: 1,
  },
} satisfies Prisma.ActivitySelect;

export const businessActivityListSelect = {
  id: true,
  status: true,
  ...activityRecordSelect,
} satisfies Prisma.ActivitySelect;

export const adminActivityListSelect = {
  id: true,
  title: true,
  organizerName: true,
  status: true,
  business: { select: { name: true } },
  category: { select: { id: true, slug: true, name: true } },
  location: { select: { id: true, slug: true, name: true, address: true } },
  slug: true,
  shortDescription: true,
  description: true,
  imageUrl: true,
  startAt: true,
  endAt: true,
  typeTags: true,
  indoorOutdoor: true,
  expectedVisitors: true,
  sourceQuality: true,
  sourceUrl: true,
  businessId: true,
  categoryId: true,
  locationId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ActivitySelect;
