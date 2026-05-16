import "dotenv/config";

import { buildReleaseCheckUrls, type ReleaseCheckEndpoint, releaseHealthWarnings } from "@/lib/release-checks";

type CheckResult = {
  contentType: string;
  label: string;
  ok: boolean;
  status: number;
  url: string;
  warnings: string[];
};

async function checkUrl(check: ReleaseCheckEndpoint & { url: string }): Promise<CheckResult> {
  try {
    const response = await fetch(check.url, {
      headers: {
        Accept: check.accept,
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload = (await response.json().catch(() => null)) as unknown;

    return {
      contentType,
      label: check.label,
      ok: response.ok,
      status: response.status,
      url: check.url,
      warnings: releaseHealthWarnings(payload),
    };
  } catch {
    return {
      contentType: "",
      label: check.label,
      ok: false,
      status: 0,
      url: check.url,
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
  const results = await Promise.all(checks.map((check) => checkUrl(check)));
  const failures = results.filter((result) => !result.ok);
  const warnings = results.filter((result) => result.warnings.length > 0);

  for (const result of results) {
    const warningText = result.warnings.length > 0 ? ` warnings=${result.warnings.join(",")}` : "";
    const contentTypeText = result.contentType ? ` content-type=${result.contentType}` : "";
    console.info(`${result.ok ? "ok" : "fail"} ${result.status} ${result.label} ${result.url}${contentTypeText}${warningText}`);
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
