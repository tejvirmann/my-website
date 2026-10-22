# tejvirmann.com

Personal site. Astro + TypeScript, static pages, plain CSS, one font (Inter, self-hosted). Only `src/pages/api/*` runs as a serverless function on Vercel.

## Develop

```
npm install
npm run dev       # http://localhost:4321 (also runs the checkout endpoint)
npm run build     # type-check + build for Vercel (.vercel/output)
npm run check     # type-check only
```

## How it is organized

- **Everything is a log.** `src/content/logs/*.md`: one markdown file per project. Frontmatter: `title`, `date`, `description`, `tags`, `image` (cover, optional), `kinds` (writing, drawing, painting, uimodeling, research, software, favorite), `onSite` (true = shown as a project on the home page and `/projects`), optional `repo` and `lang` for software. Pictures embedded in the body become the log's gallery; links stay in the text.
- `src/assets/art/`: cover pictures, resized to webp at build time. `scripts/art-meta.mjs` records a placeholder color for each (runs before dev and build).
- `src/data/site.json`: settings the control plane will edit: section order and visibility, projects cap on the home page, name placement, favorites row, tile style, wild-section placements.
- `src/data/shop.json`: shop listings. A listing is a log with a price, sizes and stock.
- `src/pages/`: routes. `src/components/`: home sections (`Hero`, `Activity`, `Latest`, `Projects`) and `Wild` (collage, marquee, vine). `src/scripts/`: the justified-rows layout and the fuzzy search.
- `src/pages/api/checkout.ts`: creates a Stripe Checkout session. Needs `STRIPE_SECRET_KEY` in the Vercel environment; without it the Buy button shows "Checkout is not set up yet".
- `mockups/` and `plan.md`: design rounds and the roadmap.

Deployed on Vercel from `main`.

## Control plane (`/admin`)

Edit the site from the browser: section order and settings, which logs are projects or favorites, logs (text, kinds, pictures, make a log from a GitHub repo), shop listings, and wild sections.

- **On your computer:** `npm run dev`, open http://localhost:4321/admin. With no `ADMIN_PASSWORD` set it is open on localhost, and *Save to files* writes the files in this repo.
- **On the live site:** set `ADMIN_PASSWORD`, `ADMIN_SECRET`, `GITHUB_TOKEN` (fine-grained, Contents read and write) and `GITHUB_REPO` in Vercel (see `.env.example`). *Publish* commits to the branch and Vercel rebuilds. Without a password the page stays locked.
- Login is checked on the server (signed cookie, 7 days, 8 wrong tries per 10 minutes). The page itself holds nothing private.
- The API only writes `site.json`, `shop.json`, log files and pictures; it refuses any other path.
