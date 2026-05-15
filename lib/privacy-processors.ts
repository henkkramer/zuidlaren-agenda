export type PrivacyProcessor = {
  name: string;
  purpose: string;
  mvpStatus: "active" | "prepared";
};

export const privacyProcessors: PrivacyProcessor[] = [
  {
    name: "Hosting en database",
    purpose: "Apphosting, databaseopslag, back-ups en runtime logging.",
    mvpStatus: "active",
  },
  {
    name: "E-mail",
    purpose: "Loginlinks, accountberichten en opt-in notificaties.",
    mvpStatus: "active",
  },
  {
    name: "AI-hulp",
    purpose: "Review-only hulp bij activiteitsteksten voor zakelijke gebruikers.",
    mvpStatus: "active",
  },
  {
    name: "Analytics",
    purpose: "Geaggregeerde productstatistieken zonder advertentieprofielen.",
    mvpStatus: "active",
  },
  {
    name: "Mollie",
    purpose: "Voorbereide betaalprovider voor latere live betalingen.",
    mvpStatus: "prepared",
  },
];
