// Renders the buyer receipt email to shots/email-receipt.html so the layout can be checked. npx tsx scripts/email-preview.ts
import { writeFileSync } from "node:fs";
import { button, esc, shell, totalRows } from "../lib/studio/mail";
import { fmtMoney } from "../lib/studio/invoice-shared";
const items = [{ description: "Celestial Moonlight, 60 × 48 in., acrylic and gold leaf on linen, white oak float frame", cents: 1800000 }, { description: "White-glove delivery and installation, Greenwich", cents: 95000 }];
const total = items.reduce((n, i) => n + i.cents, 0);
const rows = items.map((it) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de">${esc(it.description)}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;white-space:nowrap;vertical-align:top;padding-left:16px">${fmtMoney(it.cents)}</td></tr>`).join("");
const html = shell(`
    <p>Dear Jordan,</p>
    <p>Payment received, thank you. This is your receipt for invoice <strong>INV-0007</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px">${rows}${totalRows("Total paid", fmtMoney(total), "Paid September 20, 2026 by card")}</table>
    ${button("https://carol.epicdevsolutions.com/i/x", "View the paid invoice")}
    <p style="margin-top:18px">Carol will be in touch about delivery. Every piece is original and signed by the artist.</p>`);
writeFileSync("shots/email-receipt.html", html);
console.log("wrote shots/email-receipt.html");
