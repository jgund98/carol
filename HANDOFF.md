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
