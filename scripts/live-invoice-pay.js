/* Pay one invoice through Stripe Checkout (sandbox, 4242 card) and refund it from the office.
   Run: INVOICE=<id> KEY=<token> MSYS_NO_PATHCONV=1 node scripts/live-invoice-pay.js */
const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
const { createHash } = require("crypto");
const BASE = process.env.BASE || "https://carol.epicdevsolutions.com";
const HOST = new URL(BASE).hostname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const clickText = (page, re) => page.evaluate((src) => { const r = new RegExp(src, "i"); const b = [...document.querySelectorAll("button")].find((x) => r.test(x.textContent || "") && x.offsetParent !== null); if (!b) return false; b.click(); return true; }, re.source);

(async () => {
  const id = process.env.INVOICE, k = process.env.KEY;
  if (!id || !k) throw new Error("INVOICE and KEY are required");
  const b = await puppeteer.launch({ headless: true, protocolTimeout: 240000, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });

  // buyer: invoice page → Pay → Stripe
  const p = await b.newPage();
  await p.setUserAgent(UA);
  await p.setViewport({ width: 1280, height: 1400 });
  await p.goto(`${BASE}/invoice/${id}?k=${k}`, { waitUntil: "networkidle2", timeout: 90000 });
  const nav = p.waitForNavigation({ waitUntil: "networkidle2", timeout: 90000 }).catch(() => {});
  log("pay button:", await clickText(p, /Pay \$[\d,]+ by card/));
  await nav;
  await sleep(4000);
  log("on stripe:", p.url().slice(0, 60));
  const radio = await p.waitForSelector("#payment-method-accordion-item-title-card", { timeout: 120000 });
  const box = await radio.boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await p.waitForSelector("#cardNumber", { timeout: 60000 });
  await sleep(500);
  const link = await p.$("#enableStripePass");
  if (link) { const lb = await link.boundingBox(); if (lb && (await p.evaluate(() => document.querySelector("#enableStripePass").checked))) await p.mouse.click(lb.x + lb.width / 2, lb.y + lb.height / 2); }
  const type = async (sel, v) => { const el = await p.$(sel); if (!el) return; await el.click({ clickCount: 3 }); await el.type(v, { delay: 20 }); };
  await type("#cardNumber", "4242424242424242");
  await type("#cardExpiry", "1234");
  await type("#cardCvc", "123");
  await type("#billingName", "Jordan Gundy");
  await type("#billingPostalCode", "33462");
  await sleep(500);
  await p.click(".SubmitButton, button[type=submit]");
  await p.waitForFunction((h) => location.hostname === h, { timeout: 120000 }, HOST);
  await sleep(3000);
  log("back on:", p.url().replace(/k=[^&]+/, "k=…"));
  log("buyer sees:", (await p.evaluate(() => document.body.innerText)).match(/Thank you, payment received|Paid[^\n]{0,40}/)?.[0]);

  // office: status, then refund to card
  const o = await b.newPage();
  await o.setCookie({ name: "cc_studio", value: createHash("sha256").update("carol-studio-office|carol|jordan123").digest("hex"), domain: HOST, path: "/", secure: true });
  await o.setViewport({ width: 1440, height: 1000 });
  await o.goto(`${BASE}/office/invoices/${id}`, { waitUntil: "networkidle2" });
  await sleep(800);
  log("office status:", (await o.evaluate(() => document.body.innerText)).match(/Paid ✓|\bPaid\b|Sent|Refunded/)?.[0]);
  log("refund button:", await clickText(o, /Refund \$[\d,]+ to their card/));
  await sleep(600);
  log("confirm:", await clickText(o, /Yes, refund it/));
  await sleep(9000);
  log("office now:", (await o.evaluate(() => document.body.innerText)).match(/Refunded[^\n]*/)?.[0] || "NOT REFUNDED");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
