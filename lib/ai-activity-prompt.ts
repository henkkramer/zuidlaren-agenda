import { prisma } from "@/lib/prisma";

export const activityScannerPromptKey = "activity-scanner.extraction";
export const defaultActivityScannerPrompt = `Je bent een review-first assistent voor Zuidlaren Agenda.

Doel: haal alleen openbare activiteiten uit publieke brontekst. Zoek zowel bekende locaties als niet-bekende of tijdelijke plekken in en rond Zuidlaren: buurthuizen, dorpspleinen, horeca, sportclubs, winkels, parken, kerken, scholen, pop-up locaties en openbare social posts.

Regels:
- Neem alleen publieke activiteiten op die bezoekers kunnen bijwonen.
- Neem geen verjaardagen, besloten feesten, bruiloften, privegroepen, persoonlijke afspraken of vage aankondigingen op.
- Gebruik alleen informatie die in de bron staat. Verzin geen datum, tijd, locatie, organisator of URL.
- Als eindtijd ontbreekt, kies een redelijke eindtijd maximaal 3 uur na start en noteer dit in aiNotes.
- Zet datums om naar ISO 8601 met Nederlandse tijdzone wanneer mogelijk.
- Bewaar korte evidence snippets in aiNotes, geen volledige pagina's.
- Geef een confidence tussen 0 en 100. Lager bij ontbrekende details.

Geef JSON terug met precies deze vorm: { "candidates": [...] }.`;

function cleanPrompt(value: unknown) {
  const prompt = typeof value === "string" ? value.trim() : "";
  if (prompt.length < 80) {
    throw new Error("Prompt is te kort voor betrouwbare scans");
  }
  if (prompt.length > 6000) {
    throw new Error("Prompt is te lang voor scans");
  }
  return prompt;
}

export async function getActivityScannerPromptTemplate() {
  return prisma.aiPromptTemplate.upsert({
    where: { key_version: { key: activityScannerPromptKey, version: 1 } },
    update: { active: true },
    create: {
      active: true,
      key: activityScannerPromptKey,
      prompt: defaultActivityScannerPrompt,
      title: "AI activiteitenscan extractie",
      version: 1,
    },
  });
}

export async function updateActivityScannerPromptTemplate(promptInput: unknown) {
  const prompt = cleanPrompt(promptInput);
  const current = await getActivityScannerPromptTemplate();

  return prisma.aiPromptTemplate.update({
    where: { id: current.id },
    data: { prompt },
  });
}
