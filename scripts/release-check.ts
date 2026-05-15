import "dotenv/config";

import { buildReleaseCheckUrls, releaseHealthWarnings } from "@/lib/release-checks";

type CheckResult = {
  ok: boolean;
  status: number;
  url: string;
  warnings: string[];
};

async function checkUrl(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    const payload = (await response.json().catch(() => null)) as unknown;

    return {
      ok: response.ok,
      status: response.status,
      url,
      warnings: releaseHealthWarnings(payload),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      url,
      warnings: [],
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
  const warnings = results.filter((result) => result.warnings.length > 0);

  for (const result of results) {
    const warningText = result.warnings.length > 0 ? ` warnings=${result.warnings.join(",")}` : "";
    console.info(`${result.ok ? "ok" : "fail"} ${result.status} ${result.url}${warningText}`);
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} release check(s) failed`);
  }

  if (warnings.length > 0) {
    throw new Error(`${warnings.length} release check(s) returned warnings`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
