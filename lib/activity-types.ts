export type ActivityCategory = "cultuur" | "muziek" | "sport" | "markt" | "kinderen" | "eten_drinken" | "natuur";

export type Activity = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  startDateTime: string;
  endDateTime: string;
  locationName: string;
  address?: string;
  category: ActivityCategory;
  typeTags: string[];
  organizerName: string;
  sourceUrl: string;
  indoorOutdoor?: "Binnen" | "Buiten" | "Gemengd";
  expectedVisitors?: string;
  sourceQuality?: string;
};

export const categoryLabels: Record<ActivityCategory, string> = {
  cultuur: "Cultuur",
  muziek: "Muziek",
  sport: "Sport",
  markt: "Markt",
  kinderen: "Kinderen",
  eten_drinken: "Eten & drinken",
  natuur: "Natuur"
};
