/* Real Stripe (sandbox) payments against the LIVE site:
   1. buy a piece on the website through Stripe Checkout with the 4242 test card
   2. refund part of it from the office (goes back through Stripe)
   3. create an invoice, open the buyer link, pay it through Stripe, refund it
   4. put the test-bought piece back on sale
   Run: MSYS_NO_PATHCONV=1 node scripts/live-stripe-test.js */
const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
const { createHash } = require("crypto");
const BASE = process.env.BASE || "https://carol.epicdevsolutions.com";
const HOST = new URL(BASE).hostname;
const ME = { email: "jgundyt@gmail.com", phone: "561-324-9522" };
const PIECE = process.env.PIECE || "aphrodite-s-love";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function setVal(page, el, value) {
  await el.evaluate((node, v) => {
    const proto = node.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : node.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(node, v);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
const clickText = (page, re) => page.evaluate((src) => { const r = new RegExp(src, "i"); const b = [...document.querySelectorAll("button")].find((x) => r.test(x.textContent || "") && x.offsetParent !== null); if (!b) return false; b.click(); return true; }, re.source);

/** Fill Stripe's hosted Checkout with the 4242 test card and pay. Resolves with the URL Stripe returned to. */
async function payOnStripe(page) {
  await page.waitForSelector("#cardNumber, input[name=cardNumber]", { timeout: 60000 });
  await sleep(800);
  const type = async (sel, v) => { const el = await page.$(sel); if (!el) return false; await el.click({ clickCount: 3 }); await el.type(v, { delay: 20 }); return true; };
  await type("#cardNumber", "4242424242424242");
  await type("#cardExpiry", "1234");
  await type("#cardCvc", "123");
  if (await page.$("#billingName")) await type("#billingName", "Jordan Gundy");
  if (await page.$("#billingPostalCode")) await type("#billingPostalCode", "33462");
  const country = await page.$("#billingCountry");
  if (country) await page.select("#billingCountry", "US").catch(() => {});
  if (await page.$("#billingPostalCode")) await type("#billingPostalCode", "33462");
  await sleep(500);
  await page.click(".SubmitButton, button[type=submit]");
  await page.waitForFunction((h) => location.hostname === h, { timeout: 90000 }, HOST);
  await sleep(2500);
  return page.url();
}

(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const token = createHash("sha256").update("carol-studio-office|carol|jordan123").digest("hex");

  // ── 1. website purchase through Stripe ──
  const buy = await fetch(`${BASE}/api/checkout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Jordan Gundy", email: ME.email, phone: ME.phone, address: "210 Ocean Boulevard, Apt 4B", city: "Manalapan", state: "FL", zip: "33462", delivery: "White-glove delivery and installation", message: "Stripe test purchase.", items: [{ slug: PIECE, qty: 1 }] }) }).then((r) => r.json());
  log("checkout session:", buy.ok ? buy.url.slice(0, 60) + "…" : JSON.stringify(buy));
  if (!buy.ok) throw new Error("no session");
  const buyer = await b.newPage();
  await buyer.setViewport({ width: 1280, height: 900 });
  await buyer.goto(buy.url, { waitUntil: "networkidle2" });
  const back = await payOnStripe(buyer);
  log("returned to:", back);
  const thanks = await buyer.evaluate(() => document.body.innerText);
  const ref = (thanks.match(/Order (CC-[A-Z0-9]+)/) || [])[1];
  log("thank-you page:", /Thank you, Jordan/.test(thanks) ? "OK" : "MISSING", "| order", ref);

  // office
  const p = await b.newPage();
  await p.setCookie({ name: "cc_studio", value: token, domain: HOST, path: "/", secure: HOST !== "localhost" });
  await p.setViewport({ width: 1440, height: 1000 });
  await p.goto(`${BASE}/office/orders?f=paid`, { waitUntil: "networkidle2" });
  const orderHref = await p.evaluate((ref) => { const a = [...document.querySelectorAll("a")].find((a) => /\/office\/orders\/ord_/.test(a.getAttribute("href") || "") && (a.textContent || "").includes(ref)); return a ? a.getAttribute("href") : null; }, ref);
  log("order in office:", orderHref);
  if (!orderHref) throw new Error("order not found in office");
  await p.goto(`${BASE}${orderHref}`, { waitUntil: "networkidle2" });
  await sleep(500);
  const pieceState = await p.evaluate(() => (document.body.innerText.match(/Marked sold|For sale online|Off the website/) || [""])[0]);
  log("piece on order page:", pieceState, "| payment:", await p.evaluate(() => (document.body.innerText.match(/Card \([^)]*\)/) || [""])[0]));

  // ── 2. partial refund from the office ($500) ──
  log("refund button:", await clickText(p, /Refund this order/));
  await sleep(500);
  const amt = await p.$("div.o-money input.o-in");
  await setVal(p, amt, "500");
  const noteEl = await p.$('input.o-in[placeholder^="Changed their mind"]');
  if (noteEl) await setVal(p, noteEl, "Test partial refund");
  log("refund confirm:", await clickText(p, /Refund \$500 to their card/));
  await sleep(8000);
  log("order shows refunded:", await p.evaluate(() => (document.body.innerText.match(/Refunded \$[\d,]+ on [^\n]+/) || ["NOT REFUNDED"])[0]));

  // ── 3. invoice → buyer pays on Stripe → refund ──
  await p.goto(`${BASE}/office/invoices/new`, { waitUntil: "networkidle2" });
  await sleep(500);
  const ins = await p.$$("input.o-in");
  await setVal(p, ins[0], "Jordan Gundy");
  await setVal(p, ins[1], ME.email);
  await setVal(p, ins[2], ME.phone);
  await setVal(p, ins[3], "White-glove delivery and installation, Manalapan");
  await setVal(p, ins[4], "450");
  await sleep(300);
  log("invoice save and send:", await clickText(p, /Save and send/));
  await p.waitForFunction(() => /\/office\/invoices\/inv_/.test(location.pathname), { timeout: 60000 });
  await sleep(1200);
  const invUrl = p.url().split("?")[0];
  const buyerLink = await p.evaluate(() => { const a = [...document.querySelectorAll("a")].find((a) => /\/invoice\/.*\?k=/.test(a.href)); return a ? a.href : (document.querySelector("aside p.break-all")?.textContent || null); });
  log("invoice:", invUrl, "| buyer link:", buyerLink);
  const link = buyerLink.startsWith("http") ? buyerLink : BASE + buyerLink.slice(buyerLink.indexOf("/invoice/"));
  await buyer.goto(link, { waitUntil: "networkidle2" });
  await sleep(500);
  log("pay button:", await clickText(buyer, /Pay \$[\d,]+ by card/));
  await buyer.waitForFunction(() => /checkout\.stripe\.com/.test(location.hostname), { timeout: 60000 });
  const back2 = await payOnStripe(buyer);
  log("returned to:", back2.replace(/k=[^&]+/, "k=…"));
  log("invoice page says:", (await buyer.evaluate(() => document.body.innerText)).match(/Thank you, payment received|Paid[^\n]*/)?.[0]);
  await p.goto(invUrl, { waitUntil: "networkidle2" });
  await sleep(500);
  log("office invoice status:", await p.evaluate(() => (document.body.innerText.match(/\bPaid\b|Sent|Refunded/) || [""])[0]));
  log("invoice refund:", await clickText(p, /Refund \$[\d,]+ to their card/));
  await sleep(500);
  log("invoice refund confirm:", await clickText(p, /Yes, refund it/));
  await sleep(8000);
  log("office invoice now:", await p.evaluate(() => (document.body.innerText.match(/Refunded[^\n]*/) || ["NOT REFUNDED"])[0]));

  // ── 4. put the piece back on sale ──
  await p.goto(`${BASE}${orderHref}`, { waitUntil: "networkidle2" });
  await sleep(500);
  log("put back for sale:", await clickText(p, /Put it back for sale/));
  await sleep(4000);
  log("piece back on sale:", await p.evaluate(() => /For sale online/.test(document.body.innerText)));
  await b.close();
  log("done");
})().catch((e) => { console.error(e); process.exit(1); });
