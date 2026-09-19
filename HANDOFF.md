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

## Studio Office (added 2026-09-19, LIVE)

Carol's private back room: **carol.epicdevsolutions.com/login** (the app lives under /office/*; a small "Studio office" link sits in the site footer). Sign-in is a name + password with defaults in code (`lib/studio/auth.ts`: carol / jordan123), overridable with `STUDIO_USER` / `STUDIO_PASSWORD` env vars. Phone-first: five bottom tabs (Today, Inquiries, +, Orders, Artwork) with camera/gear icons up top; a sidebar on a desk.

Screens: **Today** (what is waiting, gold dots, count in the browser tab), **Inquiries** (every form message, typed; call/text/email; mark handled; notes; never removable), **Orders** (pieces with per-piece Mark as sold / Remove from the website / Put it back; buyer + Maps link; status New → In conversation → Paid → Shipped → Delivered, Cancelled; Shipping box with carrier + tracking number and tracking links; Refund box that records a refund and marks the order Refunded; never removable), **Artwork** (cards hung like the site's; tap to edit photo, title, price, status For sale / Sold / On hold / Hidden, size, medium, collections, "Show on the home page", description, story, Move to the top of the shop, Remove), **Collections** (add, rename, blurb, hero piece, reorder, remove), **Photo guide** (five rules + sizes that work + step-by-steps), **Settings** (alert emails, sign out).

### How it works
- `lib/studio/docstore.ts` — one document store, three backends: Postgres (`DATABASE_URL`, tables `studio_*` as `id + jsonb`; Neon `carol-studio` connected in Vercel), a local JSON file (`.data/studio.json`, dev), read-only seed if deployed without a database. `lib/studio/store.ts` seeds the 66 pieces, 6 collections and the sample inquiries/orders (`lib/studio/demo.ts`, ids `demo_*`) once.
- The website reads the catalog through `lib/store.ts`, so every page, the header menu, cart and shop are database-driven; `featured` pieces drive the home-page easel and wall (`featuredFor` in `lib/catalog.ts`). Saves call `revalidatePath("/", "layout")`.
- `/api/lead` saves every form post into the office (orders → Orders, the rest → Inquiries; newsletter signups auto-handled) and emails via Brevo with an office deep link.
- Photos: browser downsizes + crops (`components/office/PhotoUploader.tsx`), `/api/office/upload` runs sharp (1600 + 700 px JPEG, dominant colour) into Vercel Blob (`carol-art`, public, `BLOB_READ_WRITE_TOKEN`) or `public/uploads` locally.

### Wiping the sample data later
Delete rows whose id starts with `demo_` from `studio_inquiry` and `studio_order` (Neon console → carol-studio → SQL: `DELETE FROM studio_inquiry WHERE id LIKE 'demo_%'; DELETE FROM studio_order WHERE id LIKE 'demo_%';`).

### Still to come
Card payments at checkout (order rows already carry `stripeSessionId` / `paidAt`); text alerts (Settings stores a number). `BREVO_API_KEY` must be set in Vercel for emails.

### Verify locally
`pnpm dev` (port 3540), sign in at /login, then `MSYS_NO_PATHCONV=1 node scripts/office-test.js` runs the full add-a-piece flow headlessly and screenshots every office screen at phone and desktop sizes into `shots/office/`.
