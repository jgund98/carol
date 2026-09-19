/* Studio Office end-to-end: sign in, add a piece through the real photo → crop →
   upload → save flow, confirm it is live on the shop, then screenshot the
   office at phone and desktop sizes. Borrows puppeteer from gus-renny.
   Run: MSYS_NO_PATHCONV=1 node scripts/office-test.js   (dev server on :3540) */
const { createRequire } = require("module");
const req = createRequire("C:/Users/Lucky/gus-renny/package.json");
const puppeteer = req("puppeteer");
const fs = require("fs");
const path = require("path");
const { createHash } = require("crypto");

const BASE = process.env.BASE || "http://localhost:3540";
const OUT = path.join(__dirname, "..", "shots", "office");
const PHOTO = path.join(__dirname, "..", "public", "art", "golden-gardenia.jpg");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe",
    args: ["--no-sandbox", "--hide-scrollbars"],
  });
  const token = createHash("sha256").update("carol-studio-office|studio").digest("hex");
  const page = await browser.newPage();
  await page.setCookie({ name: "cc_studio", value: token, domain: "localhost", path: "/" });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // ── add a piece ──
  await page.goto(`${BASE}/office/artwork/new`, { waitUntil: "networkidle2" });
  const inputs = await page.$$('input[type="file"]');
  const chooser = inputs[inputs.length - 1]; // "Choose from your photos"
  await chooser.uploadFile(PHOTO);
  await page.waitForSelector(".o-crop-box", { timeout: 20000 });
  await sleep(600);
  await page.screenshot({ path: path.join(OUT, "m-crop.png") });

  // drag the top-left handle in a little, as Carol would
  const handle = (await page.$$(".o-crop-handle"))[0];
  const hb = await handle.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 24, hb.y + hb.height / 2 + 24, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, "m-crop-dragged.png") });

  const looks = await page.$$("button");
  for (const b of looks) {
    const t = await b.evaluate((el) => el.textContent);
    if (/Looks right/.test(t)) {
      await b.click();
      break;
    }
  }
  await page.waitForFunction(() => document.body.innerText.includes("New photo ready"), { timeout: 60000 });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, "m-photo-ready.png") });

  // title, price, size, medium, collection
  const boxes = await page.$$("input.o-in");
  await boxes[0].type("Test Piece Golden Hour");
  await boxes[1].type("6500");
  await boxes[2].type("30");
  await boxes[3].type("24");
  await page.select("select.o-in", "Acrylic on Canvas");
  const chips = await page.$$("label.o-choice");
  for (const c of chips) {
    const t = await c.evaluate((el) => el.textContent);
    if (/Blue Series/.test(t)) {
      await c.click();
      break;
    }
  }
  await sleep(300);
  const desc = await page.$eval("input.o-in[placeholder='48 x 36 in. Acrylic on Canvas'], input.o-in", () => null).catch(() => null);
  void desc;
  await page.screenshot({ path: path.join(OUT, "m-editor-filled.png") });

  const saveBtn = (await page.$$("button")).filter(async () => true);
  for (const b of saveBtn) {
    const t = await b.evaluate((el) => el.textContent);
    const vis = await b.evaluate((el) => el.offsetParent !== null);
    if (/Save and put it in the shop/.test(t) && vis) {
      await b.click();
      break;
    }
  }
  await page.waitForFunction(() => location.pathname.startsWith("/office/artwork/test-piece"), { timeout: 30000 });
  await sleep(800);
  await page.screenshot({ path: path.join(OUT, "m-saved.png") });
  const slug = await page.evaluate(() => location.pathname.split("/").pop());
  console.log("saved slug:", slug);

  // ── live on the shop? ──
  const shop = await browser.newPage();
  await shop.setViewport({ width: 1440, height: 900 });
  await shop.goto(`${BASE}/shop/${slug}`, { waitUntil: "networkidle2" });
  const text = await shop.evaluate(() => document.body.innerText);
  console.log("shop page has title:", text.includes("Test Piece Golden Hour"), "price:", text.includes("$6,500"), "dims:", text.includes("30 × 24 in."));
  await shop.screenshot({ path: path.join(OUT, "d-shop-new-piece.png") });
  await shop.goto(`${BASE}/shop`, { waitUntil: "networkidle2" });
  const first = await shop.evaluate(() => document.querySelector("main .grid a .display")?.textContent);
  console.log("first card in shop:", first);

  // ── desktop office ──
  const d = await browser.newPage();
  await d.setCookie({ name: "cc_studio", value: token, domain: "localhost", path: "/" });
  await d.setViewport({ width: 1440, height: 900 });
  for (const p of ["home", "inbox", "orders", "artwork", `artwork/${slug}`, "collections", "guide", "settings"]) {
    await d.goto(`${BASE}/office/${p}`, { waitUntil: "networkidle2" });
    await sleep(700);
    await d.screenshot({ path: path.join(OUT, `d-${p.replace(/\//g, "_")}.png`) });
    const overflow = await d.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) console.log("HORIZONTAL OVERFLOW (desktop):", p);
  }
  for (const p of ["home", "inbox", "orders", "artwork", "collections"]) {
    await page.goto(`${BASE}/office/${p}`, { waitUntil: "networkidle2" });
    await sleep(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) console.log("HORIZONTAL OVERFLOW (phone):", p);
  }
  await page.goto(`${BASE}/office/collections`, { waitUntil: "networkidle2" });
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, "m-collections.png") });

  // ── tidy up: drop the test piece and its uploaded photos ──
  await browser.close();
  const dp = path.join(__dirname, "..", ".data", "studio.json");
  const data = JSON.parse(fs.readFileSync(dp, "utf8"));
  const w = data.work[slug]?.data;
  delete data.work[slug];
  fs.writeFileSync(dp, JSON.stringify(data));
  for (const u of [w?.image, w?.imageSm]) if (u && u.startsWith("/uploads/")) fs.rmSync(path.join(__dirname, "..", "public", u), { force: true });
  console.log("test piece removed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
