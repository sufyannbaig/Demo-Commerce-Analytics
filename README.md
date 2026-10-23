# Demo Commerce Group: multi-store analytics (demo)

A clickable proof of concept for a multi-store Shopify + Meta Ads + Google Ads analytics dashboard.
**All data is mock data** for a fictional company ("Demo Commerce Group") with three fictional stores: Glow Lab, Vita Core and Pure Skin.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui-style components (Radix) · Recharts.

## Screens

| Route | What it shows |
| --- | --- |
| `/` | Overview: revenue, ad spend, blended vs Meta-reported ROAS, profit, orders, AOV with period-over-period change; revenue vs spend chart; per-store table |
| `/creatives` | Creative & Team: **editable winner rule** (ROAS / min spend / window) that recalculates win rates live; strategist leaderboard with rank movement; creative table with history drill-down; campaign and ad set roll-ups |
| `/insights` | Angles & Insights: win rate and ROAS by ad angle, angle × store matrix, 3 insight cards computed from the data |
| `/about` | Data plan one-pager (prints to a single A4 page) |

Store and date filters (7d / 30d / 90d) and the winner rule carry across screens.

## Data

`src/data/seed.ts` generates 180 days of daily store data and 124 creatives from a fixed seed, so the numbers are identical on every load.
All metrics are derived from those daily rows in `src/lib/metrics.ts`:

- Blended ROAS = Shopify revenue ÷ (Meta + Google spend)
- Profit = revenue − COGS − ad spend − fees
- Winner = within the first *N* days, spend ≥ €X and Meta ROAS ≥ Y. Creatives still inside the window are "Testing"; the rest are "Loser". Win rate = winners ÷ decided creatives.
- Strategist, angle, product and version are parsed from the ad name: `strategist_angle_product_version` (e.g. `AH_ugc-pain_serum_v3`).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

**Vercel (recommended):** push this repo to GitHub → vercel.com/new → import the repo → Deploy. No settings or environment variables needed.
Or from a terminal: `npx vercel --prod`.

**Any static host:** `npm run export` writes a static site to `./out` (upload that folder to Netlify Drop, Cloudflare Pages, GitHub Pages at a root domain, etc.).

## Screenshots and PDF

With the app running on port 3000: `npm run shots` writes screenshots and `data-plan-one-pager.pdf` to `./deliverables`.
(The script points Playwright at a preinstalled Chromium; change `executablePath` in `scripts/shots.mjs` or remove it to use Playwright's own browser.)

**Single-file version:** `npm run bundle` writes `artifact/dist/demo-commerce-analytics.html`, the whole dashboard in one self-contained HTML file (hash routes `#overview`, `#creatives`, `#insights`, `#plan`). It's useful for hosts that only take a single page.
