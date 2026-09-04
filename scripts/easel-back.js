const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" }); await new Promise(r => setTimeout(r, 500));
  await p.click('[role="button"][aria-label*="Turn"]'); await new Promise(r => setTimeout(r, 2600));
  await p.screenshot({ path: "shots/easel-back.png", captureBeyondViewport: false, clip: { x: 860, y: 120, width: 500, height: 640 } });
  await b.close();
})();
