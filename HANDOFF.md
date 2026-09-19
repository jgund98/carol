# Handoff notes — Carol Calicchio Art

## What was built
A new site for carolcalicchioart.com: home, six collection pages, shop with 66 pieces and product pages, cart and order-request checkout, studio, commissions, about, contact, exhibitions, press, surfboards, books, store policy. Sitemap, robots, Open Graph, LocalBusiness/Person/Product/FAQ schema.

## Signature pieces
- **The easel** (home, collection pages): hover tilts, click flips to the back of the canvas (label, size, medium, her signature), click again turns to the next painting. Turns on its own when idle.
- **Meet Carol**: her own intro reel, her signature, one paragraph, her quote.
- **Paint**: daubs cut from her actual canvases float with the scroll; a pink paint ribbon carries the press; canvases lean against the wall in the collections; a paint trail follows the cursor over artwork.
- **Light**: her statement on light beside Celestial Moonlight, which your hand lights up.
- **The wall**: twelve paintings hung to true relative scale, gliding sideways as you scroll.
- **True to scale** on every product page: the painting drawn in inches beside a 5'8" figure and a sofa.

## Before going live
1. Set `BREVO_API_KEY` in Vercel (forms). Recipient is already Carol@carolcalicchioart.com in code.
2. Confirm with Carol: store policy wording (shipping, final sale, damage window), the "featured in" list (House Beautiful, NYT, Palm Beach Post are from her Instagram bio), and phone 561-400-0678 vs the 561-213-0616 listed on Palm Beach Culture.
3. Ask Carol whether any pieces have sold since September 2026 and mark them (`sold: true`).
4. Point the domain; set `NEXT_PUBLIC` nothing else needed. `metadataBase` is already carolcalicchioart.com.

## Content sources
Her Wix site (copy, bio, exhibitions, 66 products), her Instagram reels (studio tour, process clips, Breakers surfboards), Palm Beach Illustrated, Dan's Papers, Elevated Magazine (Bruce Helander), Schneps podcast, Boca Raton Museum of Art. Every quote is verbatim and attributed in `lib/content.ts`.

## Studio Office (added 2026-09-19)

Carol's private back room lives at **/office** (a "Studio office" link sits in the site footer). Same brand as the site, built phone-first: bottom tabs, one column, 56px controls. Screens: **Today** (what is waiting, gold dots, counts in the browser tab), **Inquiries** (every form message, typed: artwork inquiry / commission / studio visit / message / newsletter; call, text, email buttons; mark handled; notes), **Orders** (checkout requests with pieces, ship-to, payment and delivery preference; status stepper New → In conversation → Paid → Delivered; "Mark it sold" flips the pieces on the website), **Artwork** (every piece; tap to edit photo, title, price, status For sale / Sold / On hold / Hidden, size, medium, collections, description, story; "Add a new piece" = take or choose a photo → drag the pink corners to the canvas edges → save; new pieces lead the shop), **Collections** (add, rename, blurb, hero piece, reorder, remove), **Photo guide** (five rules + step-by-steps), **Settings** (where alerts are emailed, connection status).

### How it works
- `lib/studio/docstore.ts` — one tiny document store with three backends: Postgres (`DATABASE_URL`, tables `studio_*` as `id + jsonb`), a local JSON file (`.data/studio.json`, dev only), and a read-only seed when deployed without a database. `lib/studio/store.ts` is the typed layer; the 66 pieces and 6 collections in `lib/works.ts` / `lib/content.ts` are the SEED, loaded once.
- The website reads the catalog through `lib/store.ts` (hidden pieces filtered), so every page, the header menu, the cart and the shop are database-driven. Saves in the office call `revalidatePath("/", "layout")`.
- `/api/lead` now saves every form post into the office (orders into Orders, the rest into Inquiries) AND emails Carol via Brevo; the email footer links straight to the item in the office.
- Photos: the browser downsizes and crops (`components/office/PhotoUploader.tsx`), `/api/office/upload` runs sharp (1600 + 700 px JPEG, dominant colour) and stores to Vercel Blob (`BLOB_READ_WRITE_TOKEN`) or `public/uploads` locally.
- Sign-in: one password, `STUDIO_PASSWORD` env; locally without it the password is `studio`. Session = httpOnly cookie for 60 days.

### Before Carol uses it (Jordan, one time)
1. Vercel project `carol` → Storage → create a **Neon Postgres** database and connect it (injects `DATABASE_URL`). Tables create themselves; the 66 pieces seed on first visit.
2. Storage → create a **Blob** store and connect it (injects `BLOB_READ_WRITE_TOKEN`).
3. Env vars: `STUDIO_PASSWORD` (her password), `BREVO_API_KEY` (already planned). Optional `OFFICE_URL` if the office ever moves off carol.epicdevsolutions.com.
4. Redeploy (`npx vercel --prod --yes` from this folder). Until 1–3 are done the office opens in a read-only preview and says so at the top.
5. Stripe: `StudioOrder.stripeSessionId` / `paidAt` are reserved; wire checkout later and paid orders will show as Paid automatically.

### Verify locally
`pnpm dev` (port 3540), sign in at /office with `studio`, then `MSYS_NO_PATHCONV=1 node scripts/office-test.js` runs the full add-a-piece flow headlessly (photo → crop → upload → save → live on /shop) and screenshots every office screen at phone and desktop sizes into `shots/office/`.
