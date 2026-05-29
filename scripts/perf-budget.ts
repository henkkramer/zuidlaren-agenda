import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

type AppBuildManifest = {
  pages: Record<string, string[]>;
};

const root = process.cwd();
const manifestPath = join(root, ".next/app-build-manifest.json");

const routeBudgets = [
  { key: "/page", label: "/", gzipKb: 120 },
  { key: "/account/page", label: "/account", gzipKb: 140 },
  { key: "/business/[businessId]/page", label: "/business/[businessId]", gzipKb: 130 },
];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function fileSize(asset: string) {
  const path = join(root, ".next", asset);
  assert(existsSync(path), "Missing build asset: " + asset);
  const source = readFileSync(path);
  return {
    raw: statSync(path).size,
    gzip: gzipSync(source).length,
  };
}

assert(existsSync(manifestPath), "Run npm run build before npm run perf:budget");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as AppBuildManifest;

for (const budget of routeBudgets) {
  const assets = manifest.pages[budget.key]?.filter((asset) => asset.endsWith(".js")) ?? [];
  assert(assets.length > 0, "No JavaScript assets found for " + budget.label);

  const totals = assets.reduce(
    (sum, asset) => {
      const size = fileSize(asset);
      return { raw: sum.raw + size.raw, gzip: sum.gzip + size.gzip };
    },
    { raw: 0, gzip: 0 },
  );
  const gzipKb = totals.gzip / 1024;
  const rawKb = totals.raw / 1024;
  console.info(
    budget.label + ": " + gzipKb.toFixed(1) + " KiB gzip (" + rawKb.toFixed(1) + " KiB raw) across " + assets.length + " JS assets",
  );
  assert(gzipKb <= budget.gzipKb, budget.label + " JS budget exceeded: " + gzipKb.toFixed(1) + " KiB > " + budget.gzipKb + " KiB");
}

console.info("Performance bundle budgets passed");
