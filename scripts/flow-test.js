const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  await p.goto("http://localhost:3541/shop/midnight-bliss", { waitUntil: "networkidle2" });
  await p.click("button.btn-pink"); await wait(900);
  await p.screenshot({ path: "shots/flow-1-drawer.png" });
  const drawerText = await p.evaluate(() => document.querySelector('aside[aria-label="Your cart"]')?.innerText.replace(/\n+/g,' | '));
  console.log("drawer:", drawerText);
  await p.goto("http://localhost:3541/checkout", { waitUntil: "networkidle2" }); await wait(500);
  await p.screenshot({ path: "shots/flow-2-checkout.png" });
  await p.type('input[name="name"]', "Test Collector"); await p.type('input[name="email"]', "test@example.com"); await p.type('input[name="phone"]', "5615551234");
  await p.type('input[name="address"]', "1 Ocean Blvd"); await p.type('input[name="city"]', "Palm Beach"); await p.type('input[name="zip"]', "33480");
  await wait(2600);
  await p.click('button[type="submit"]'); await wait(2500);
  await p.screenshot({ path: "shots/flow-3-success.png" });
  console.log("after submit:", await p.evaluate(() => document.querySelector("h1")?.innerText));
  // mobile menu
  await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" }); await wait(300);
  await p.click('button[aria-controls="mobile-menu"]'); await wait(700);
  await p.screenshot({ path: "shots/flow-4-menu.png" });
  // 768 + 1920 hero
  for (const [w, h, t] of [[768, 1024, "t"], [1920, 1080, "xl"], [360, 740, "s"]]) {
    await p.setViewport({ width: w, height: h, isMobile: w < 800, hasTouch: w < 800 });
    await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" }); await wait(1200);
    await p.screenshot({ path: `shots/hero-${t}.png` });
  }
  await b.close();
})();
