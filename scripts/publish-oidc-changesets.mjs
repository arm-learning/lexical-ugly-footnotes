import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

function shInherit(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", encoding: "utf8", ...opts });
}

function log(msg) {
  process.stdout.write(msg + "\n");
}

const root = process.cwd();
const tarDir = path.join(root, ".tarballs");
fs.rmSync(tarDir, { recursive: true, force: true });
fs.mkdirSync(tarDir, { recursive: true });

// publish only this package (adjust later if you add more publishables)
const PACKAGE = "lexical-ugly-footnotes";

// Find workspace package path
const listRaw = sh("pnpm -r list --depth -1 --json --silent");
const pkgs = JSON.parse(listRaw);
const pkg = pkgs.find((p) => p?.name === PACKAGE);

if (!pkg?.path) {
  throw new Error(`Could not find workspace path for ${PACKAGE}`);
}

const pkgJsonPath = path.join(pkg.path, "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

if (pkgJson.private === true) {
  log(`- Skipping ${PACKAGE} (private:true)`);
  process.exit(0);
}

const name = pkgJson.name;
const version = pkgJson.version;

// If already on npm, exit cleanly
try {
  sh(`npm view ${name}@${version} version`);
  log(`- Skipping ${name}@${version} (already published)`);
  process.exit(0);
} catch {
  // not published yet - continue
}

log(`- Packing ${name}@${version} with pnpm…`);
sh(`pnpm -C ${JSON.stringify(pkg.path)} pack --pack-destination ${JSON.stringify(tarDir)}`);

// Find the tarball we just created (most recent .tgz in tarDir)
const tgzFiles = fs
  .readdirSync(tarDir)
  .filter((f) => f.endsWith(".tgz"))
  .map((f) => ({ f, mtime: fs.statSync(path.join(tarDir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

if (tgzFiles.length === 0) {
  throw new Error(`No .tgz files found in ${tarDir} after packing`);
}

const tgzName = tgzFiles[0].f;
const tgzPath = path.join(tarDir, tgzName);

log(`  Publishing ${tgzName} via npm (OIDC)…`);
shInherit(`npm publish ${JSON.stringify(tgzPath)} --access public --provenance`);

log("Done.");
