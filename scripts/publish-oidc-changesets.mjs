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

// 1) Ask Changesets what would be published from THIS commit state
log("→ Computing release plan via changesets…");
const outFile = path.join(".tarballs", "changeset-status.json");
shInherit(`pnpm exec -- changeset status --output ${JSON.stringify(outFile)}`);

const statusJson = fs.readFileSync(path.join(root, outFile), "utf8");
const plan = JSON.parse(statusJson);

if (!Array.isArray(plan) || plan.length === 0) {
  log("No packages to publish (changesets plan empty).");
  process.exit(0);
}

log(`Changesets plans to publish ${plan.length} package(s).`);

// Build name -> path map once
const listRaw = sh("pnpm -r list --depth -1 --json --silent");
const pkgs = JSON.parse(listRaw);
const pathByName = new Map(pkgs.map((p) => [p.name, p.path]));

// 2) Publish each planned package
for (const item of plan) {
  const name = item.name;
  const newVersion = item.newVersion;

  const pkgPath = pathByName.get(name);
  if (!pkgPath) throw new Error(`Could not find workspace path for ${name}`);

  const pkgJsonPath = path.join(pkgPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  if (pkgJson.private === true) {
    log(`- Skipping ${name} (private:true)`);
    continue;
  }

  if (pkgJson.version !== newVersion) {
    throw new Error(
      `${name} version mismatch. package.json=${pkgJson.version} changesets=${newVersion}`,
    );
  }

  let exists = false;
  try {
    sh(`npm view ${name}@${newVersion} version`);
    exists = true;
  } catch {
    exists = false;
  }
  if (exists) {
    log(`- Skipping ${name}@${newVersion} (already published)`);
    continue;
  }

  log(`- Packing ${name}@${newVersion} with pnpm…`);
  const packOut = sh(
    `pnpm -C ${JSON.stringify(pkgPath)} pack --pack-destination ${JSON.stringify(tarDir)}`,
  );
  const tgzName = packOut.split("\n").pop().trim();
  const tgzPath = path.join(tarDir, tgzName);

  if (!fs.existsSync(tgzPath)) {
    throw new Error(`Expected tarball not found: ${tgzPath}`);
  }

  log(`  Publishing ${tgzName} via npm (OIDC)…`);
  shInherit(`npm whoami`);
  shInherit(`npm publish ${JSON.stringify(tgzPath)} --access public --provenance`);
}

log("Done.");
