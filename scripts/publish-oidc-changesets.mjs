const PACKAGE = "lexical-ugly-footnotes";

// find workspace path once
const listRaw = sh("pnpm -r list --depth -1 --json --silent");
const pkgs = JSON.parse(listRaw);
const pkg = pkgs.find((p) => p.name === PACKAGE);
if (!pkg?.path) throw new Error(`Could not find workspace path for ${PACKAGE}`);

const pkgJsonPath = path.join(pkg.path, "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
if (pkgJson.private) {
  log(`- Skipping ${PACKAGE} (private:true)`);
  process.exit(0);
}

const name = pkgJson.name;
const version = pkgJson.version;

// if already published, do nothing
try {
  sh(`npm view ${name}@${version} version`);
  log(`- Skipping ${name}@${version} (already published)`);
  process.exit(0);
} catch {}

// pack + publish
log(`- Packing ${name}@${version} with pnpm…`);
const packOut = sh(
  `pnpm -C ${JSON.stringify(pkg.path)} pack --pack-destination ${JSON.stringify(tarDir)}`
);
const tgzName = packOut.split("\n").pop().trim();
const tgzPath = path.join(tarDir, tgzName);

log(`  Publishing ${tgzName} via npm (OIDC)…`);
shInherit(`npm publish ${JSON.stringify(tgzPath)} --access public --provenance`);
log("Done.");
