export type ContentMaintenanceItem = {
  action: string;
  priority: "high" | "medium";
  source: string;
  title: string;
};

export const contentMaintenanceQueue: ContentMaintenanceItem[] = [
  {
    action: "Controleer het definitieve horeca- en muziekprogramma zodra SEZ en horeca publiceren.",
    priority: "high",
    source: "zuidlaren_activiteiten_mei_december_2026.md",
    title: "Zuidlaardermarktweek detailprogramma",
  },
  {
    action: "Monitor datum en programma; pas publiceren als de 2026-editie hard bevestigd is.",
    priority: "high",
    source: "zuidlaren_gemiste_events_addendum_2026.md",
    title: "Zuidlaarder Muzieknacht",
  },
  {
    action: "Verifieer afgeleide eerste-donderdag-datums bij Grand Cafe voordat ze als hard event live gaan.",
    priority: "medium",
    source: "zuidlaren_gemiste_events_addendum_2026.md",
    title: "Open Muziek Podium",
  },
  {
    action: "Wekelijkse check van Naar Zuidlaren, Grand Cafe, Boschhuis, De Vliegh, SEZ, Sprookjeshof en De Wachter.",
    priority: "medium",
    source: "zuidlaren_activiteiten_mei_december_2026.md",
    title: "Kortcyclische horeca- en cultuuragenda",
  },
];
