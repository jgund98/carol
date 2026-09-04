const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" });
  const state = async () => p.evaluate(() => {
    const c = document.querySelector('[role="button"][aria-label*="Turn"]');
    const ctl = document.querySelector('[aria-label="Carol Calicchio"] .mt-2')?.innerText.replace(/\n/g,' ');
    return { aria: c?.getAttribute('aria-label'), transform: getComputedStyle(c).transform.slice(0,80), ctl };
  });
  const shot = (n) => p.screenshot({ path: `shots/easel-${n}.png`, clip: { x: 850, y: 150, width: 520, height: 700 } });
  console.log('t0', await state()); await shot(0);
  await new Promise(r => setTimeout(r, 5000)); console.log('t5 (autoplay 1 turn)', await state()); await shot(1);
  await new Promise(r => setTimeout(r, 3800)); console.log('t9 (2 turns)', await state()); await shot(2);
  await p.click('[role="button"][aria-label*="Turn"]'); await new Promise(r => setTimeout(r, 3000)); console.log('click (3 turns)', await state()); await shot(3);
  await p.click('[role="button"][aria-label*="Turn"]'); await new Promise(r => setTimeout(r, 3000)); console.log('click (4 turns)', await state()); await shot(4);
  await b.close();
})();
