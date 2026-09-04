const { createRequire } = require("module");
const puppeteer = createRequire("C:/Users/Lucky/gus-renny/package.json")("puppeteer");
(async () => {
  const b = await puppeteer.launch({ headless: true, executablePath: "C:/Users/Lucky/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe", args: ["--no-sandbox"] });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto("http://localhost:3541/", { waitUntil: "networkidle2" });
  const top = await p.evaluate(() => document.querySelector(".wall").getBoundingClientRect().top + window.scrollY);
  for (const off of [0, 600, 1400, 2200]) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top + off);
    await new Promise((r) => setTimeout(r, 900));
    const s = await p.evaluate(() => {
      const w = document.querySelector(".wall"); const st = w.firstElementChild; const tr = st.querySelector("[style*='translate3d']") || st.querySelector(".rail > div");
      return { stickyTop: Math.round(st.getBoundingClientRect().top), transform: getComputedStyle(tr).transform.slice(0, 60), pos: getComputedStyle(st).position };
    });
    console.log("off", off, s);
  }
  console.log("errors:", errs);
  await b.close();
})();
