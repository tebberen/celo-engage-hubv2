import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = resolve(__dirname, "dist");
const srcDir = resolve(__dirname, "src");

function cleanOutput() {
  rmSync(outdir, { recursive: true, force: true });
  mkdirSync(outdir, { recursive: true });
}

async function buildAndCopy() {
  cleanOutput();

  console.info("[build] Bundling...");
  // Bundle main.js and miniapp.js
  // Output directly to outdir (dist/) so they become dist/main.js and dist/miniapp.js
  await esbuild.build({
    entryPoints: {
      main: resolve(srcDir, "main.js"),
      miniapp: resolve(srcDir, "miniapp.js"),
    },
    bundle: true,
    outdir: outdir,
    format: "esm",
    target: ["es2020"],
    sourcemap: true,
  });

  console.info("[build] Copying assets...");

  // Copy asset directories
  const dirsToCopy = ["assets", "src/styles", "src/data"];
  dirsToCopy.forEach(d => {
    const source = resolve(__dirname, d);
    const dest = resolve(outdir, d);
    cpSync(source, dest, { recursive: true, force: true });
  });

  // Copy HTML files and fix script references
  const htmlFiles = ["index.html", "miniapp.html", "miniapp-clean.html"];
  htmlFiles.forEach(file => {
    try {
      let content = readFileSync(resolve(__dirname, file), "utf-8");
      // Fix paths: ./dist/miniapp.js -> ./miniapp.js
      content = content.replace(/src="\.\/dist\//g, 'src="./');
      // If index.html refers to src/main.js, we might need to fix that too.
      // Usually dev setup: <script src="./src/main.js">
      // Prod setup: <script src="./main.js">
      content = content.replace(/src="\.\/src\/main\.js"/g, 'src="./main.js"');
      writeFileSync(resolve(outdir, file), content);
    } catch (e) {
      console.warn(`[build] Warning: Could not process ${file}:`, e.message);
    }
  });

  // Copy config files
  const otherFiles = ["miniapp.config.json", "manifest.json", "src/lang.json"];
  otherFiles.forEach(file => {
      const source = resolve(__dirname, file);
      const dest = resolve(outdir, file);
      cpSync(source, dest, { recursive: true, force: true });
  });

  console.info("[build] Complete.");
}

buildAndCopy().catch((error) => {
  console.error("[build] Failed:", error);
  process.exit(1);
});
