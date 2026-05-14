import "dotenv/config";

import { buildReleaseCheckUrls } from "@/lib/release-checks";

type CheckResult = {
  ok: boolean;
  status: number;
  url: string;
};

async function checkUrl(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      url,
    };
  }
}

async function main() {
  const releaseBaseUrl = process.env.RELEASE_BASE_URL;

  if (!releaseBaseUrl) {
    throw new Error("RELEASE_BASE_URL is required");
  }

  const checks = buildReleaseCheckUrls(releaseBaseUrl);
  const results = await Promise.all(checks.map((check) => checkUrl(check.url)));
  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    console.info(`${result.ok ? "ok" : "fail"} ${result.status} ${result.url}`);
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} release check(s) failed`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
