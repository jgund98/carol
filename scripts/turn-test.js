const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  const url = process.env.URL || "http://localhost:3541/";
  await p.goto(url, { waitUntil: "networkidle2" });
  const label = () => p.evaluate(() => document.querySelector('[role="button"][aria-label*="Turn"]')?.getAttribute("aria-label"));
  const t0 = Date.now(); const seen = [];
  let last = await label();
  while (Date.now() - t0 < 14000) {
    await new Promise((r) => setTimeout(r, 250));
    const l = await label();
    if (l !== last) { seen.push(((Date.now() - t0) / 1000).toFixed(1) + "s"); last = l; }
    if (Date.now() - t0 > 6000 && Date.now() - t0 < 6300) await p.hover('[role="button"][aria-label*="Turn"]'); // hover mid-way
  }
  console.log(url, "turns at:", seen.join(", "));
  await b.close();
})();
