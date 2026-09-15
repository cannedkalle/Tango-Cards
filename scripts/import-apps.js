const fs = require("fs");
const path = require("path");

const portalRoot = path.resolve(__dirname, "..");
const defaultWorkspaceRoot = path.resolve(portalRoot, "..", "Kids Play Portal Apps");
const workspaceRoot = path.resolve(process.env.PLAY_APPS_WORKSPACE || defaultWorkspaceRoot);
const manifestPath = path.join(workspaceRoot, "app-manifest.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function copyDirectory(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function validateRelease(app) {
  if (!app.release) return null;

  const source = path.resolve(workspaceRoot, app.release.sourceDir);
  const destination = path.resolve(portalRoot, app.release.portalPublicDir);

  if (!destination.startsWith(path.join(portalRoot, "public", "apps") + path.sep)) {
    throw new Error(`${app.id} release destination must stay inside public/apps.`);
  }

  if (!fs.existsSync(source)) {
    throw new Error(`${app.id} release source does not exist: ${source}`);
  }

  return { source, destination };
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Apps manifest not found: ${manifestPath}`);
  }

  const manifest = readJson(manifestPath);
  const releasableApps = manifest.apps
    .map((app) => ({ app, release: validateRelease(app) }))
    .filter(({ release }) => Boolean(release));

  for (const { app, release } of releasableApps) {
    copyDirectory(release.source, release.destination);
    fs.writeFileSync(
      path.join(release.destination, ".generated-from-apps-workspace"),
      [
        `app=${app.id}`,
        `source=${path.relative(workspaceRoot, release.source)}`,
        `workspace=${workspaceRoot}`,
        "",
      ].join("\n"),
    );
    console.log(`Imported ${app.id} -> ${path.relative(portalRoot, release.destination)}`);
  }

  if (releasableApps.length === 0) {
    console.log("No releasable app exports found.");
  }
}

main();
