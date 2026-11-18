/**
 * Regenerates the static hero image (public/hero/scene-fallback.webp) from the live 3D scene.
 * It is shown while the 3D scene loads, on low-end phones and with "reduce motion".
 *
 * Usage (with the site running, e.g. `npm run build && npm start`):
 *   node automation/capture-hero.mjs [baseUrl] [chromePath]
 * Defaults: http://localhost:3000 and the standard Chrome path for this OS.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3000";
const chrome = process.argv[3] ?? ({
  win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
}[process.platform] ?? "google-chrome");

if (!existsSync(chrome) && process.platform !== "linux") throw new Error(`Chrome not found at ${chrome}`);

const raw = join(tmpdir(), `hero-capture-${Date.now()}.png`);
execFileSync(chrome, [
  "--headless=new", "--hide-scrollbars",
  "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
  "--default-background-color=00000000",
  "--force-device-scale-factor=2",
  "--virtual-time-budget=8000",
  "--window-size=640,534",
  `--screenshot=${raw}`,
  `${base}/scene-capture`,
], { stdio: "ignore" });

mkdirSync("public/hero", { recursive: true });
const info = await sharp(raw).trim({ threshold: 0 }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile("public/hero/scene-fallback.webp");
rmSync(raw, { force: true });
console.log(`Saved public/hero/scene-fallback.webp (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
