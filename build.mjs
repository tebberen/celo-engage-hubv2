import { cpSync, mkdirSync, rmSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = resolve(__dirname, "dist");
const srcDir = resolve(__dirname, "src");
const basePath = "/celo-engage-hubv2/";

function cleanOutput() {
  rmSync(outdir, { recursive: true, force: true });
  mkdirSync(outdir, { recursive: true });
}

function copySource() {
  cpSync(srcDir, outdir, { recursive: true, force: true });
}

function logResult() {
  console.info(`[build] Static modules copied to ${outdir}`);
  console.info(`[build] Base path configured for GitHub Pages: ${basePath}`);
}

async function build() {
  cleanOutput();
  copySource();
  logResult();
}

build().catch((error) => {
  console.error("[build] Failed to prepare static bundle", error);
  process.exit(1);
});
