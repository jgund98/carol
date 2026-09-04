const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); const wait = (ms) => new Promise(r => setTimeout(r, ms));
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" }); await wait(500);
  await p.click('[role="button"][aria-label*="Turn"]'); await wait(2600);
  await p.screenshot({ path: "shots/final-easel-back.png", clip: { x: 760, y: 84, width: 680, height: 816 } });
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })); await wait(1200);
  await p.screenshot({ path: "shots/final-footer.png" });
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto("http://localhost:3541/shop", { waitUntil: "networkidle2" }); await wait(400);
  await p.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" })); await wait(2500);
  await p.screenshot({ path: "shots/final-shop-m.png" });
  await b.close();
})();
