import { NextResponse } from "next/server";
import { publicApiHeaders } from "@/lib/api-response";
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
    return NextResponse.json({ apiVersion: mobileApiVersion, error: "Activiteit niet gevonden" }, { headers: publicApiHeaders(mobileApiVersion), status: 404 });
  }

  return NextResponse.json(
    {
      apiVersion: mobileApiVersion,
      data: {
        activity,
      },
    },
    { headers: publicApiHeaders(mobileApiVersion) },
  );
}
