import { build } from "esbuild";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = resolve(__dirname, "dist");

mkdirSync(outdir, { recursive: true });

async function bundle() {
  try {
    await build({
      entryPoints: ["src/main.js"],
      bundle: true,
      outfile: "dist/main.js",
      format: "esm",
      platform: "browser",
      target: "es2020",
      sourcemap: true,
      logLevel: "info",
    });
    console.info("[build] Bundle created at dist/main.js");
  } catch (error) {
    console.error("[build] Failed to create bundle", error);
    process.exit(1);
  }
}

bundle();
