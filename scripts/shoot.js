/* Headless screenshot rig for the polish loop. Borrows puppeteer from gus-renny. */
const { createRequire } = require("module");
const req = createRequire("C:/Users/Lucky/gus-renny/package.json");
const puppeteer = req("puppeteer");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "shots");
const BASE = process.env.BASE || "http://localhost:3541";
const PAGES = (process.env.PAGES || "/,/collections,/collections/white-series,/shop,/shop/celestial-moonlight,/studio,/commissions,/about,/contact,/exhibitions,/press,/surfboards,/books,/cart").split(",");
const VIEWS = {
  d: { width: 1440, height: 900 },
  xl: { width: 1920, height: 1080 },
  t: { width: 768, height: 1024, isMobile: true, hasTouch: true },
  m: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  s: { width: 360, height: 740, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
const WANT = (process.env.VIEWS || "d,m").split(",");
const FULL = process.env.FULL === "1";

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe",
    args: ["--autoplay-policy=no-user-gesture-required", "--no-sandbox", "--hide-scrollbars"],
  });
  for (const tag of WANT) {
    const vp = VIEWS[tag];
    const page = await browser.newPage();
    await page.setViewport(vp);
    for (const p of PAGES) {
      const name = p === "/" ? "home" : p.replace(/^\//, "").replace(/\//g, "_");
      try {
        await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 60000 });
      } catch (e) {
        console.log("timeout", p);
      }
      await new Promise((r) => setTimeout(r, 1400));
      await page.screenshot({ path: path.join(OUT, `${tag}-${name}-top.png`) });
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) console.log("HORIZONTAL OVERFLOW:", tag, p);
      if (FULL) {
        // Stitch viewport shots into one tall image (fullPage capture breaks svh heroes).
        const parts = [];
        const step = vp.height;
        for (let y = 0, i = 0; y < total; y += step, i++) {
          const yy = Math.min(y, Math.max(0, total - vp.height));
          await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), yy);
          await new Promise((r) => setTimeout(r, i === 0 ? 400 : 900));
          const f = path.join(OUT, `_${tag}-${name}-${String(i).padStart(2, "0")}.png`);
          await page.screenshot({ path: f });
          parts.push(f);
          if (yy < y) break;
        }
        const { execSync } = require("child_process");
        const inputs = parts.map((f) => `-i "${f}"`).join(" ");
        const chain = parts.map((_, i) => `[${i}]`).join("") + `vstack=${parts.length}`;
        const out = path.join(OUT, `${tag}-${name}-full.png`);
        if (parts.length > 1) execSync(`ffmpeg -v error -y ${inputs} -filter_complex "${chain}" -frames:v 1 -update 1 "${out}"`);
        else fs.copyFileSync(parts[0], out);
        for (const f of parts) fs.unlinkSync(f);
      } else {
        const stops = (process.env.STOPS || "0.28,0.55,0.8").split(",").map(Number);
        for (const s of stops) {
          const y = Math.round((total - vp.height) * s);
          await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
          await new Promise((r) => setTimeout(r, 1100));
          await page.screenshot({ path: path.join(OUT, `${tag}-${name}-${Math.round(s * 100)}.png`) });
        }
      }
    }
    await page.close();
  }
  await browser.close();
  console.log("shots:", fs.readdirSync(OUT).length);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
