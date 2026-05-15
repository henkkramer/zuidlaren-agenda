export type ProfileInput = {
  deletionRequested: boolean;
  displayName: string;
  locale: "nl-NL" | "en-US";
};

export function parseProfileInput(payload: Record<string, unknown>): ProfileInput {
  const displayName = typeof payload.displayName === "string" ? payload.displayName.trim() : "";

  if (displayName.length < 2 || displayName.length > 80) {
    throw new Error("Naam moet 2 tot 80 tekens zijn");
  }

  return {
    deletionRequested: payload.deletionRequested === true,
    displayName,
    locale: payload.locale === "en-US" ? "en-US" : "nl-NL",
  };
}
