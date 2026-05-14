import { NextResponse } from "next/server";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityDetail } from "@/lib/public-activities";

type PublicActivityDetailContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(_request: Request, context: PublicActivityDetailContext) {
  const { activityId } = await context.params;
  const activity = await getPublicActivityDetail(activityId);

  if (!activity) {
    return NextResponse.json({ apiVersion: mobileApiVersion, error: "Activiteit niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({
    apiVersion: mobileApiVersion,
    data: {
      activity,
    },
  });
}
