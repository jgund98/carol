// Wipe every inquiry, order and invoice from the studio database, keeping a
// JSON backup first. Artwork, collections and settings are untouched.
//   node scripts/wipe-leads.mjs            (dry run: counts only)
//   node scripts/wipe-leads.mjs --really   (backs up, then deletes)
import postgres from "postgres";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
const url = env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing from .env.local");
const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 15 });
const tables = ["studio_inquiry", "studio_order", "studio_invoice"];

const counts = {};
for (const t of tables) counts[t] = Number((await sql.unsafe(`select count(*)::int as n from ${t}`))[0].n);
console.log("before:", counts);

if (process.argv.includes("--really")) {
  mkdirSync("backups", { recursive: true });
  const dump = {};
  for (const t of tables) dump[t] = await sql.unsafe(`select * from ${t}`);
  const file = `backups/leads-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(dump, null, 2));
  console.log("backup:", file);
  for (const t of tables) await sql.unsafe(`delete from ${t}`);
  const after = {};
  for (const t of tables) after[t] = Number((await sql.unsafe(`select count(*)::int as n from ${t}`))[0].n);
  console.log("after:", after);
}
const keep = {};
for (const t of ["studio_work", "studio_collection", "studio_setting"]) keep[t] = Number((await sql.unsafe(`select count(*)::int as n from ${t}`))[0].n);
console.log("untouched:", keep);
await sql.end();
