import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function shOut(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", ...opts }).trim();
}

const repoRoot = process.cwd();
const pkgDir = resolve(repoRoot, "packages/lexical-ugly-footnotes");

console.log("→ Building + packing lexical-ugly-footnotes…");
sh("pnpm clean", { cwd: pkgDir });
// Force rebuild without cache by running build commands directly
sh("pnpm build:components", { cwd: pkgDir });
sh("pnpm build:styles", { cwd: pkgDir });

// pnpm pack prints the tarball name on the last line
const packOut = shOut("pnpm pack --silent", { cwd: pkgDir });
const tarballName = packOut.split("\n").pop();
const tarballPath = resolve(pkgDir, tarballName);

console.log(`→ Tarball: ${tarballPath}`);

const testDir = mkdtempSync(join(tmpdir(), "test-publish-"));
try {
  console.log(`→ Creating temp project: ${testDir}`);
  writeFileSync(
    join(testDir, "package.json"),
    JSON.stringify({ name: "test-publish", private: true, type: "module" }, null, 2),
  );

  console.log("→ Installing tarball into temp project…");
  sh(`pnpm add "${tarballPath}"`, { cwd: testDir });

  console.log("→ Import test…");
  // Create a test file to get better error information
  const testFile = join(testDir, "test-import.mjs");
  writeFileSync(
    testFile,
    `try {
  const pkg = await import('lexical-ugly-footnotes');
  console.log('✓ Package imports successfully');
  console.log('Exports:', Object.keys(pkg).slice(0, 10).join(', '), '...');
} catch (e) {
  console.error('✗ Import failed:', e.message);
  if (e.stack) {
    console.error('Stack:', e.stack);
  }
  process.exit(1);
}
`,
  );
  sh(`node ${testFile}`, { cwd: testDir });

  console.log("✓ verify:package completed");
} finally {
  // Cleanup
  rmSync(testDir, { recursive: true, force: true });
  try {
    rmSync(tarballPath, { force: true });
  } catch {}
}
