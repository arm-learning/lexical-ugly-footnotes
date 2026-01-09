#!/usr/bin/env node

import { existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the store package directory (one level up from packages/store/scripts)
// packages/store/scripts -> packages/store
const storePackageDir = resolve(__dirname, "..");

// The fileStore now always stores files in packages/store/.store
const storePath = join(storePackageDir, ".store");

console.log("Cleaning fileStore (editor state)...\n");
console.log(`Looking for: ${storePath}\n`);

if (existsSync(storePath)) {
  try {
    rmSync(storePath, { recursive: true, force: true });
    console.log(`✓ Removed: ${storePath}`);
    console.log("\n✓ All editor state has been wiped.");
  } catch (e) {
    console.error(`✗ Error removing ${storePath}:`, e.message);
    process.exit(1);
  }
} else {
  console.log("No .store directory found - editor state is already clean.");
}
