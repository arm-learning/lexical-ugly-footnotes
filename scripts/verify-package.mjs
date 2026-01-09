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
sh("pnpm build", { cwd: pkgDir });

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
  sh(
    `node --input-type=module -e "import('lexical-ugly-footnotes').then(() => console.log('✓ Package imports successfully')).catch(e => { console.error('✗ Import failed:', e); process.exit(1); })"`,
    { cwd: testDir },
  );

  console.log("✓ verify:package completed");
} finally {
  // Cleanup
  rmSync(testDir, { recursive: true, force: true });
  try {
    rmSync(tarballPath, { force: true });
  } catch {}
}
