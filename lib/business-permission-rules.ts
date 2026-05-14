export type BusinessPermission = "view" | "manageMembers" | "publishActivities";

type BusinessPermissionInput = {
  businessStatus: string;
  canPublishActivities: boolean;
  membershipActive: boolean;
  role: string;
};

export type BusinessPermissionDenial = {
  ok: false;
  error: string;
  status: 403;
};

export type BusinessPermissionGrant = {
  ok: true;
};

export function evaluateBusinessPermission(
  input: BusinessPermissionInput,
  permission: BusinessPermission = "view",
): BusinessPermissionDenial | BusinessPermissionGrant {
  if (!input.membershipActive) {
    return { ok: false, status: 403, error: "Geen toegang tot dit bedrijf" };
  }

  if (permission === "manageMembers" && input.role !== "OWNER") {
    return { ok: false, status: 403, error: "Alleen eigenaren kunnen medewerkers beheren" };
  }

  if (permission === "publishActivities") {
    const canPublish = input.role === "OWNER" || input.canPublishActivities;

    if (!canPublish) {
      return { ok: false, status: 403, error: "Geen publicatierecht" };
    }

    if (input.businessStatus !== "APPROVED") {
      return { ok: false, status: 403, error: "Bedrijf moet eerst zijn goedgekeurd" };
    }
  }

  return { ok: true };
}
