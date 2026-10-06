// Screenshot tool.  npm run shots [-- --label x] [/page] [--mobile|--desktop] [--sections]
// Needs the dev server running. Each run saves into a NEW numbered folder in screenshots/.
import { chromium } from "playwright";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.SHOTS_URL || "http://localhost:5173";
const OUT_DIR = path.resolve("screenshots");

// The card is one page; the back side and each design trial are URL variants of it.
const TRIAL_IDS = ["glow", "floodlight", "riso", "analyst", "on-air", "classic"];
const PAGES = [
  { name: "card-front", path: "/" },
  { name: "card-back", path: "/?face=back" },
  ...TRIAL_IDS.flatMap((id) => [
    { name: `trial-${id}-front`, path: `/?trial=${id}` },
    { name: `trial-${id}-back`, path: `/?trial=${id}&face=back` },
  ]),
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

const args = process.argv.slice(2);
let label = "";
let sections = false;
const onlyPaths = [];
const onlyViewports = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--label") label = args[++i] || "";
  else if (a === "--sections") sections = true;
  else if (a === "--mobile") onlyViewports.push("mobile");
  else if (a === "--desktop") onlyViewports.push("desktop");
  else if (a.startsWith("/")) onlyPaths.push(a);
}
const pages = onlyPaths.length
  ? onlyPaths.map((p) => PAGES.find((x) => x.path === p) ?? { name: p.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "page", path: p })
  : PAGES;
const viewports = onlyViewports.length ? onlyViewports : Object.keys(VIEWPORTS);

try {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch {
  console.error(`\n✖ Can't reach ${BASE_URL}. Start the dev server first (npm run dev).\n`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const existing = (await readdir(OUT_DIR)).map((n) => parseInt(n, 10)).filter(Number.isFinite);
const next = String((existing.length ? Math.max(...existing) : 0) + 1).padStart(3, "0");
const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const runDir = path.join(OUT_DIR, safeLabel ? `${next}-${safeLabel}` : next);
await mkdir(runDir, { recursive: true });

// software WebGL so the shader texture renders in headless Chrome
const browser = await chromium.launch({
  executablePath: process.env.SHOTS_CHROMIUM || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const saved = [];
for (const vpName of viewports) {
  const context = await browser.newContext({ viewport: VIEWPORTS[vpName], ...VIEWPORTS[vpName] });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(BASE_URL + p.path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900); // let the shader draw a few frames
    const base = path.join(runDir, `${p.name}-${vpName}`);
    await page.screenshot({ path: `${base}.png` });
    await page.screenshot({ path: `${base}-full.png`, fullPage: true });
    saved.push(`${base}.png`, `${base}-full.png`);
    if (sections) {
      let n = 0;
      // the card itself (this page has no <section> blocks to split)
      for (const block of await page.locator("[data-shot]").all()) {
        const box = await block.boundingBox();
        if (!box || box.height < 40 || !(await block.isVisible())) continue;
        const file = `${base}-s${String(++n).padStart(2, "0")}.png`;
        await block.screenshot({ path: file });
        saved.push(file);
      }
    }
  }
  await context.close();
}
await browser.close();
console.log(`\n✔ Saved ${saved.length} screenshots to ${path.relative(process.cwd(), runDir)}${path.sep}`);
for (const f of saved) console.log("  " + path.relative(process.cwd(), f));
