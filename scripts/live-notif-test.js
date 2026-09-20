/* Fires every notification scenario against the LIVE site with Jordan as both
   Carol (alerts) and the buyer, so the texts and emails can be checked on a phone.
   Run: MSYS_NO_PATHCONV=1 node scripts/live-notif-test.js
   Needs: TESTING=true in lib/studio/notify.ts (test buyer = jgundyt@gmail.com). */
const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
const { createHash } = require("crypto");
const BASE = process.env.BASE || "https://carol.epicdevsolutions.com";
const HOST = new URL(BASE).hostname;
const ME = { email: "jgundyt@gmail.com", phone: "561-324-9522" };
const PIECE = process.env.PIECE || "alluring-light";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function lead(body) {
  const r = await fetch(`${BASE}/api/lead`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

// type into a React-controlled input so its onChange fires
async function setVal(page, el, value) {
  await el.evaluate((node, v) => {
    const proto = node.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : node.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(node, v);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
const clickText = (page, re) => page.evaluate((src) => { const r = new RegExp(src, "i"); const b = [...document.querySelectorAll("button")].find((x) => r.test(x.textContent || "") && x.offsetParent !== null); if (!b) return false; b.click(); return true; }, re.source);

(async () => {
  // ── 1. inquiries from the website (four kinds) ──
  log("contact:", JSON.stringify(await lead({ formType: "contact", name: "Margaret Ellison", email: ME.email, phone: ME.phone, message: "Hello Carol, I saw your work at the Boca museum show and would love to know whether you have anything in blues around 48 by 60 available this fall." })));
  await sleep(1500);
  log("inquiry:", JSON.stringify(await lead({ formType: "inquiry", subject: "New Artwork Inquiry · Alluring Light", name: "Daniel Whitmore", email: ME.email, phone: ME.phone, workSlug: PIECE, message: "Is Alluring Light still available, and could it be framed in white oak before shipping to Greenwich?", fields: { Artwork: "Alluring Light (60 × 48 in.) $14,000" } })));
  await sleep(1500);
  log("commission:", JSON.stringify(await lead({ formType: "commission", name: "Elaine Rosetti", email: ME.email, phone: ME.phone, message: "We are finishing a home in Jupiter Island and would like to talk about a triptych for the living room, roughly 12 feet wide.", fields: { Size: "About 12 ft wide, three panels", Budget: "$25,000 to $40,000", Timeline: "Before Thanksgiving" } })));
  await sleep(1500);
  log("visit:", JSON.stringify(await lead({ formType: "visit", name: "Thomas and Julia Bard", email: ME.email, phone: ME.phone, message: "Could we come by the studio next Thursday afternoon? We are in Delray for the week.", fields: { "Preferred date": "Thursday afternoon" } })));
  await sleep(1500);

  // ── 2. a purchase on the website (test buyer, recorded as paid) ──
  const buy = await fetch(`${BASE}/api/checkout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Jordan Gundy", email: ME.email, phone: ME.phone, address: "210 Ocean Boulevard, Apt 4B", city: "Manalapan", state: "FL", zip: "33462", delivery: "White-glove delivery and installation", message: "Please call before delivery, the building needs a certificate of insurance.", items: [{ slug: PIECE, qty: 1 }] }) }).then((r) => r.json());
  log("purchase:", JSON.stringify(buy));
  const orderId = buy.url && buy.url.match(/order=([^&]+)/)?.[1];
  if (!orderId) throw new Error("purchase did not complete");

  // ── office, signed in as Carol ──
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const token = createHash("sha256").update("carol-studio-office|carol|jordan123").digest("hex");
  const p = await b.newPage();
  await p.setCookie({ name: "cc_studio", value: token, domain: HOST, path: "/", secure: HOST !== "localhost" });
  await p.setViewport({ width: 1440, height: 1000 });

  // ── 3. shipped notice: carrier + tracking on the new order ──
  await p.goto(`${BASE}/office/orders/${orderId}`, { waitUntil: "networkidle2" });
  await sleep(500);
  const paidOnPage = await p.evaluate(() => /Paid/.test(document.body.innerText));
  log("order page shows Paid:", paidOnPage);
  const sel = await p.$("select.o-in");
  if (!sel) throw new Error("no carrier select on the order page");
  await setVal(p, sel, "UPS");
  await sleep(200);
  const track = await p.$('input.o-in[placeholder^="1Z"]');
  await setVal(p, track, "1Z999AA10123456784");
  await sleep(200);
  log("save shipping clicked:", await clickText(p, /Save shipping details/));
  await sleep(6000);
  log("shipping saved, buyer told:", await p.evaluate(() => /buyer was sent this tracking number|sent the buyer|tracking number/i.test(document.body.innerText)));

  // ── 4. invoice: sent → reminder (past due) → paid receipt ──
  await p.goto(`${BASE}/office/invoices/new`, { waitUntil: "networkidle2" });
  await sleep(500);
  const ins = await p.$$("input.o-in");
  // name, email, phone, description, amount, (due date is type=date)
  await setVal(p, ins[0], "Jordan Gundy");
  await setVal(p, ins[1], ME.email);
  await setVal(p, ins[2], ME.phone);
  await setVal(p, ins[3], "Alluring Light, 60 × 48 in. + white-glove delivery to Manalapan");
  await setVal(p, ins[4], "15250");
  const due = await p.$('input[type="date"]');
  const past = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  await setVal(p, due, past);
  const ta = await p.$("textarea.o-in");
  if (ta) await setVal(p, ta, "Thank you, Jordan. Delivery is included in this invoice.");
  await sleep(300);
  log("save and send clicked:", await clickText(p, /Save and send/));
  await p.waitForFunction(() => /\/office\/invoices\/inv_/.test(location.pathname), { timeout: 60000 });
  await sleep(1500);
  const invUrl = p.url();
  log("invoice:", invUrl, "|", await p.evaluate(() => (document.body.innerText.match(/Sent[^\n]*/) || [""])[0]));

  // reminder: the cron route sends to overdue, unpaid invoices
  const cron = await fetch(`${BASE}/api/cron/invoice-reminders`).then((r) => r.json());
  log("reminder cron:", JSON.stringify(cron));
  await sleep(1500);

  // paid receipt
  await p.goto(invUrl, { waitUntil: "networkidle2" });
  await sleep(500);
  log("mark as paid clicked:", await clickText(p, /Mark as paid/));
  await sleep(6000);
  log("invoice shows paid:", await p.evaluate(() => /Paid/.test(document.body.innerText)));

  // ── 5. put the test-bought piece back on sale ──
  await p.goto(`${BASE}/office/orders/${orderId}`, { waitUntil: "networkidle2" });
  await sleep(500);
  log("put back for sale clicked:", await clickText(p, /Put it back for sale/));
  await sleep(4000);
  log("piece back on sale:", await p.evaluate(() => /For sale online/.test(document.body.innerText)));
  await b.close();
  log("done. order:", `${BASE}/office/orders/${orderId}`, "invoice:", invUrl);
})().catch((e) => { console.error(e); process.exit(1); });
