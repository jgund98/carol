/* Invoice flow, headless: start an invoice from the demo order, save it, open the
   office view, open the buyer link, mark it paid, confirm the order followed.
   Run: MSYS_NO_PATHCONV=1 node scripts/invoice-test.js   (dev server on :3540) */
const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:3540";
const OUT = path.join(__dirname, "..", "shots", "office");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox", "--hide-scrollbars"] });
  const token = createHash("sha256").update("carol-studio-office|carol|jordan123").digest("hex");
  const p = await b.newPage();
  await p.setCookie({ name: "cc_studio", value: token, domain: "localhost", path: "/" });
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  await p.goto(`${BASE}/office/invoices/new?order=demo_ord_1`, { waitUntil: "networkidle2" });
  await sleep(600);
  await p.screenshot({ path: path.join(OUT, "m-invoice-new.png") });
  const prefilled = await p.evaluate(() => [...document.querySelectorAll("input.o-in")].map((i) => i.value).filter(Boolean));
  console.log("prefilled:", prefilled.join(" | "));
  for (const btn of await p.$$("button")) {
    const t = await btn.evaluate((el) => el.textContent);
    const vis = await btn.evaluate((el) => el.offsetParent !== null);
    if (/Save and continue/.test(t) && vis) {
      await btn.click();
      break;
    }
  }
  await p.waitForFunction(() => /\/office\/invoices\/inv_/.test(location.pathname), { timeout: 30000 });
  await sleep(800);
  await p.screenshot({ path: path.join(OUT, "m-invoice-view.png") });
  const prodUrl = await p.evaluate(() => document.querySelector("aside p.break-all")?.textContent || "");
  const url = BASE + prodUrl.slice(prodUrl.indexOf("/invoice/"));
  console.log("buyer link:", url);

  // the buyer's view (no cookie)
  const q = await b.newPage();
  await q.setViewport({ width: 1440, height: 900 });
  await q.goto(url, { waitUntil: "networkidle2" });
  await sleep(600);
  const txt = await q.evaluate(() => document.body.innerText);
  console.log("public page shows:", /Invoice/.test(txt) && /INV-\d{4}/.test(txt) && /\$16,500/.test(txt) ? "invoice + number + total" : "MISSING: " + txt.slice(0, 200));
  await q.screenshot({ path: path.join(OUT, "d2-invoice-public.png") });
  const bad = await q.goto(url.replace(/k=.*/, "k=nope"), { waitUntil: "networkidle2" });
  console.log("wrong token ->", bad.status());

  // mark paid from the office
  await p.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Mark as paid/.test(x.textContent || "")); b && b.click(); });
  await sleep(2500);
  const paidTxt = await p.evaluate(() => document.body.innerText);
  console.log("office shows paid:", /Paid/.test(paidTxt));
  await p.goto(`${BASE}/office/orders/demo_ord_1`, { waitUntil: "networkidle2" });
  const ordTxt = await p.evaluate(() => document.body.innerText);
  const st = JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".data", "studio.json"), "utf8")).order.demo_ord_1.data.status;
  console.log("order status after invoice paid:", st, "| page mentions Paid:", /Paid/.test(ordTxt));
  await p.goto(`${BASE}/office/invoices`, { waitUntil: "networkidle2" });
  await sleep(500);
  await p.screenshot({ path: path.join(OUT, "m-invoices.png") });
  await b.close();

  // tidy: put the demo order back to New and drop the test invoice locally
  const dp = path.join(__dirname, "..", ".data", "studio.json");
  const d = JSON.parse(fs.readFileSync(dp, "utf8"));
  for (const k of Object.keys(d.invoice)) delete d.invoice[k];
  if (d.order.demo_ord_1) Object.assign(d.order.demo_ord_1.data, { status: "new", paidAt: null });
  fs.writeFileSync(dp, JSON.stringify(d));
  console.log("tidy ok");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
