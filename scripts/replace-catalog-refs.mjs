import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

// Read the catalog from pnpm-workspace.yaml
const workspaceYaml = readFileSync(resolve(repoRoot, "pnpm-workspace.yaml"), "utf8");
const catalog = {};

// Parse the catalog section
let inCatalog = false;
for (const line of workspaceYaml.split("\n")) {
  if (line.trim() === "catalog:") {
    inCatalog = true;
    continue;
  }
  if (inCatalog) {
    if (line.trim() === "" || !line.match(/^\s/)) {
      break; // End of catalog section
    }
    const match = line.match(/^\s+"?([^"]+)"?:\s*"(.+)"/);
    if (match) {
      const [, key, value] = match;
      catalog[key] = value;
    } else {
      // Try without quotes
      const match2 = line.match(/^\s+([^:]+):\s*(.+)/);
      if (match2) {
        const [, key, value] = match2;
        catalog[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

// Read package.json
const pkgPath = resolve(repoRoot, "packages/lexical-ugly-footnotes/package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

// Replace catalog: references
function replaceCatalogRefs(obj) {
  if (typeof obj !== "object" || obj === null) return;
  
  for (const key in obj) {
    if (obj[key] === "catalog:") {
      if (catalog[key]) {
        obj[key] = catalog[key];
        console.log(`  ✓ Replaced ${key}: catalog: → ${catalog[key]}`);
      } else {
        console.warn(`  ⚠ Warning: No catalog entry for ${key}`);
      }
    } else if (typeof obj[key] === "object") {
      replaceCatalogRefs(obj[key]);
    }
  }
}

console.log("→ Replacing catalog references in package.json...");
replaceCatalogRefs(pkg);

// Write back
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("✓ Done");
