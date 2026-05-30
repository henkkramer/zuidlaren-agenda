const maxFetchBytes = 256_000;
const fetchTimeoutMs = 8_000;

export type ActivitySourceFetchResult = {
  bytesFetched: number;
  contentType: string | null;
  error?: string;
  fetchedAt: Date;
  status: number | null;
  textSample: string;
};

function isAllowedPublicSourceUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return false;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function fetchActivityScanSource(baseUrl: string): Promise<ActivitySourceFetchResult> {
  const fetchedAt = new Date();

  if (!isAllowedPublicSourceUrl(baseUrl)) {
    return { bytesFetched: 0, contentType: null, error: "Bron-URL is niet toegestaan voor publieke scan", fetchedAt, status: null, textSample: "" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

  try {
    const response = await fetch(baseUrl, {
      headers: {
        accept: "text/html,application/rss+xml,application/xml,text/xml,text/calendar;q=0.9,text/plain;q=0.8",
        "user-agent": "ZuidlarenAgendaBot/0.1 (+https://zuidlaren.local)",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const reader = response.body?.getReader();
    let bytesFetched = 0;
    const chunks: Uint8Array[] = [];

    if (reader) {
      while (bytesFetched < maxFetchBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        bytesFetched += value.byteLength;
      }
      await reader.cancel().catch(() => undefined);
    }

    const sampleBytes = chunks.slice(0, 16);
    const textSample = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(sampleBytes).slice(0, 48_000));

    return {
      bytesFetched,
      contentType,
      error: response.ok ? undefined : `HTTP ${response.status}`,
      fetchedAt,
      status: response.status,
      textSample,
    };
  } catch (error) {
    return {
      bytesFetched: 0,
      contentType: null,
      error: error instanceof Error ? error.message : "Bron kon niet worden opgehaald",
      fetchedAt,
      status: null,
      textSample: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
