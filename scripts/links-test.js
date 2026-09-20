/* Short links + Stripe hand-off, headless:
   1. signed-out /o/<id> → /login?next=… → sign in → lands on the order
   2. create an invoice, open it on a phone and a desktop, save screenshots
   Run: MSYS_NO_PATHCONV=1 node scripts/links-test.js   (dev server on :3540) */
const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:3540";
const OUT = path.join(__dirname, "..", "shots", "office");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox", "--hide-scrollbars"] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // an order to link to
  const r = await fetch(`${BASE}/api/lead`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formType: "order", name: "Link Test", email: "b@example.com", phone: "5615550142", order: { items: [{ slug: "x", name: "Sunlit Study", qty: 1, price: 4800, image: "/x.jpg", dims: "36 x 48 in" }], subtotal: 4800, address: "1 Ocean Blvd", city: "Palm Beach", state: "FL", zip: "33480", payment: "Card", delivery: "Ship to me" } }) }).then((r) => r.json());
  console.log("lead:", JSON.stringify(r));

  // 1. signed out → login with next
  await p.goto(`${BASE}/o/${r.orderId}`, { waitUntil: "networkidle2" });
  console.log("signed-out short link landed on:", p.url());
  await p.type('input[name="user"]', "carol");
  await p.type('input[name="password"]', "jordan123");
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2" }), p.evaluate(() => document.querySelector("form button[type=submit], form button").click())]);
  await sleep(500);
  console.log("after sign-in:", p.url(), p.url().endsWith(`/office/orders/${r.orderId}`) ? "OK" : "WRONG");
  await p.screenshot({ path: path.join(OUT, "m-order-from-link.png") });

  // 2. invoice: create from this order, then view as the buyer
  await p.goto(`${BASE}/office/invoices/new?order=${r.orderId}`, { waitUntil: "networkidle2" });
  await sleep(400);
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}), p.evaluate(() => [...document.querySelectorAll("button")].find((b) => /save and send/i.test(b.textContent)).click())]);
  await sleep(1200);
  console.log("invoice office url:", p.url());
  let buyerLink = await p.evaluate(() => { const a = [...document.querySelectorAll("a")].find((a) => /\/invoice\/.*\?k=/.test(a.href)); return a ? a.href : null; });
  if (buyerLink) buyerLink = buyerLink.replace(/^https?:\/\/[^/]+/, BASE);
  console.log("buyer link:", buyerLink);
  if (buyerLink) {
    await p.goto(buyerLink, { waitUntil: "networkidle2" });
    await sleep(500);
    await p.screenshot({ path: path.join(OUT, "m-invoice-buyer.png"), fullPage: true });
    const d = await b.newPage();
    await d.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await d.goto(buyerLink, { waitUntil: "networkidle2" });
    await sleep(500);
    await d.screenshot({ path: path.join(OUT, "d-invoice-buyer.png"), fullPage: true });
    const short = buyerLink.replace(/\/invoice\/([^?]+)\?.*/, "/i/$1");
    const s = await fetch(short, { redirect: "manual" });
    console.log("short link", short, "→", s.status, s.headers.get("location"));
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
