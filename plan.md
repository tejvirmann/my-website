# Website rework plan

Last updated after Round 3 mockups (`mockups/r3/`). Rounds 1 and 2 are kept in `mockups/r1`, `mockups/r2`.

## 1. What you want (summary)

1. **A calm, tight, artist-style site** based on your current structure: top tab bar with only your logo (upper left), the hero wheel of two images, a centered GitHub activity strip, a "Latest" viewer, and a Projects grid. Simple professional sans (Inter). In the spirit of vivekg.dev and jagdeepraina.com: tight, with whole pieces of art on show.
2. **Loud, wild sections** you can drop between calm ones for contrast: dense art collage, marquee bands, vine/root growth, an Attack-on-Titan style 3D face where the wall falls away, Suminagashi, math/fractal SVG, a retro desktop (nilsmatteson.com), a foo.bar terminal, an animated art player, a drifting art strip. You build more over time, so they must be easy to add.
3. **A control plane (admin)** where you choose the section stack, set caps and options, place wild sections in slots, pick the art inside them, manage projects, shop listings and prices, logs, and site settings such as where your name appears.
4. **A cleaner, lighter, more efficient codebase** (done: the Astro rebuild on branch `rework`), fast loading, mobile and desktop.
5. **Your own shop** (replaces Etsy): listings and prices edited in the control plane; Buy goes to Stripe Checkout.
6. **Everything is a log.** Art, writing, research and software are all logs; a project on the site is a log. GitHub repos are only a source: to show one, you create a log from it. Software logs without a picture get a generated tile.

## 2. Current state

- **The site is built** (branch `rework`, uncommitted): home, projects (fuzzy search, filters, timeline and lanes views, 24 at a time), logs (paginated list, archive), log/listing pages (gallery, rendered markdown with links, Buy box), about, shop, 404, wild sections (collage, marquee, vine) placed from `src/data/site.json`, dark mode, mobile layouts checked at 390px. Built JS is about 11 KB and CSS about 15 KB.
- **Built:** the control plane at `/admin` (Home, Projects, Logs, Shop, Wild sections; login; Save/Publish; picture upload; make a log from a GitHub repo) and seven wild sections (collage, marquee, vine, Suminagashi ink, math curves, retro desktop, terminal).
- **Not built yet:** live Stripe connection (waiting on keys), the 3D face / wall falls away, animated art player, drifting art strip, media hero (YouTube facade), float/layer, hero image management in the control plane, and a look at the heatmap once deployed.
- **Mockups** (`mockups/r1` to `r3`) remain the spec for what is still to build.

## 3. Pages (Round 3 mockups)

| Page | What it has |
|---|---|
| **Home** | Tab bar (logo only; name placement is a setting) · hero wheel (two usual images, fade; **tap or click to go to the next one**, drag, dots) · GitHub activity, centered and responsive, hover tooltips, profile link (no YouTube link) · Latest viewer (click the picture or "View this log" to open it; arrows browse) · **Projects** (optional Favorites row, off by default) with filter chips (Writing, Drawing, Painting, UI, Software), capped by a setting, with "View all N projects" (keeps the chosen filter) |
| **Projects** | Search, sort, view switch (Grid / Timeline by year / Lanes), filters for **type, kind, year (clickable histogram), dominant color, shape, language** (language as a proportional bar), active-filter summary, capped justified rows. **Loads 24 at a time** so 100+ projects do not load 100 images |
| **Logs** | Latest / Archive switch, newest first, paginated (10 per page), tag chips, thumbnail per row |
| **Log / listing page** | One page type for both. Picture gallery (cover plus any number of pictures, thumbnails, keyboard arrows, click to enlarge), title, date, text, spec list, tags, newer/older links. If the log is also in the shop, the same page shows price, sizes and **Buy with Stripe**. Not every log is for sale. The Shop grid links to these pages, so a listing is just a log with a price |
| **Archive** | Every log by year with a year jump bar |
| **About** | Four layout/typeface/copy options in `r3/about/` (Charter like vivekg.dev, editorial serif, sans two-column, timeline); pick one. Portrait is a square crop from the top; CV section off by default |
| **Shop** | Product grid on matted tiles. Each item opens the log/listing page above (same data, with the Buy box) |
| **Control plane** | Tabs: Overview, Home layout, Projects, Wild slots, Shop, Logs, Site settings. In the mockup, changes are saved in the browser and really change home, projects and shop |

**Logs stay markdown.** Each log is still a `.md` file (that is what the control plane edits and what Vercel builds). The log/listing page renders the whole body: headings, lists, quotes and **all the links** (21 links across 13 logs today, such as the Forest Language PDF and OpenSea). Pictures embedded in the body become the page gallery instead of sitting inline. A shop listing is the same page, so it shows the same text and links plus the Buy box.

## 4. Design rules (apply everywhere)

- Logo upper left. Name in plain sans; **placement is a control-plane choice**: nowhere, footer, beside the logo, or small on the hero. Default now: footer.
- No headline text over the hero. No YouTube link in the footer.
- Art is shown whole, never cropped, except small thumbnails where the full piece is one click away (lightbox).
- Art grids use **capped justified rows**: target row height scales with screen width, no piece larger than 1.3x target, the last row is not stretched, small gaps, titles on hover. Phones get small tight rows.
- You choose what is published: only checked logs appear. GitHub repos never appear on their own.
- A software project is a log like any other. With no picture it gets a generated pattern tile in the language color (or a text-only tile, a setting). Its log page links back to the GitHub repo.
- Heatmap: monochrome to match the page, centered, scales to its container, fewer weeks on phones, hover shows date and count.
- One font: Inter. Mobile: the tab bar collapses to a hamburger.
- Motion respects `prefers-reduced-motion`. Every animated module has a static fallback.

## 5. Efficiency and loading (including "100 projects")

- **Images:** built to webp at 480px (grid) and 1400px (lightbox/viewer) with `srcset`, `width`/`height` set (no layout shift) and a dominant-color placeholder; `loading="lazy"`, `decoding="async"`.
- **Big lists:** do not render everything. Project metadata for all projects is one small JSON (about 150 bytes each, so 100 projects is about 15 KB). The page renders **24 at a time**; filtering and search run on the JSON in the browser, so results are instant and only revealed pieces load images. At several hundred projects add real paginated URLs (`/projects/page/2`) for search engines, or infinite scroll with an `IntersectionObserver`.
- **Home** shows only the capped number of projects, with a link to the rest.
- **JS budget:** calm pages need only the small slider, filter and heatmap scripts. Wild modules load only when their section is near the viewport.
- **Targets:** Lighthouse performance 95+ on mobile; under 150 KB of JS and CSS on the home page; hero image under 150 KB. One font family, `display=swap`.

## 6. Section system, modes and control plane

- The home page is an ordered **stack of sections**; each can be on or off and calm or loud. Wild modules go in **slots** between sections (after the hero, after the activity strip, after latest, after projects). All of it is data (`layout.json` plus per-module settings) edited in the control plane.
- Each module is a folder in `src/modules/<name>/` with a manifest (name, settings schema, image slots), the component, a static fallback and a thumbnail. Adding a module = adding a folder; it appears in the control plane library and gets a settings form automatically.
- Control plane tabs:
  - **Home layout:** reorder and toggle sections; projects cap; whether to show a Favorites row (off by default); software tile style; GitHub username; hero images.
  - **Projects:** a table of every log with **On site** and **Favorite** checkboxes (only checked logs appear anywhere on the site), search, and show/hide in bulk. Below it, **Start a log from a GitHub repo**: your repos that have no log yet, each with a Create log button that opens a prefilled draft (title, description, language, date, link back to the repo). A draft is not on the site until you check On site, add pictures and write the story in the Logs tab.
  - **Wild slots:** pick a slot, pick a module, choose the art it uses; library of all modules with status.
  - **Shop:** Stripe connection, orders, and the listings. **Every listing is derived from a log** (title, text and pictures come from the log; the listing only adds price, stock, sizes, badge, active). You cannot create a listing without a log.
  - **Logs:** write and publish logs (markdown, tags, date), add **any number of pictures** (first is the cover, reorder, make cover), and switch on **Sell this log** (any log, one click) to make it a listing and set the price; not every log is sold. Shop listings have the same picture manager.
  - **Site settings:** name placement, navigation tabs, CV on About, default theme, admin password.
  - **Sign-in:** the whole control plane sits behind a login.

## 7. Wild slot ideas (running list: tell me new ones and I add them here)

| Idea | Notes | Mockup status |
|---|---|---|
| **Dense art collage** | Pieces scattered and layered, rotated, bobbing, with marquee bands. You choose the art | Demo in `r3`, placeable from the control plane |
| **Marquee bands** | Text or images sliding across the screen at any angle | Demo in `r3` |
| **Vine / root growth** | An SVG vine grows out of the page edge as you scroll to it, with leaves; roots grow downward the same way | Demo in `r3` (draws itself on scroll) |
| **3D face, wall falls away** | The Attack-on-Titan moment: the section above falls away and a huge 3D face is revealed. Reveal transition + 3D scene (OGL/Three.js, lazy). Fake it with CSS first to judge the feel | Idea |
| **Suminagashi** | Marbled-ink flow disturbed by the cursor (canvas or SVG filter) | Idea |
| **Fractal / math SVG** | L-systems, Julia/Mandelbrot, attractors, spirographs; parameters become settings | Idea |
| **Retro desktop** | Windows 95 desktop like nilsmatteson.com: teal background, windows with real content, taskbar | Idea |
| **foo.bar terminal** | Terminal intro or easter egg, inspired by Google foo.bar | Idea |
| **Animated art player** | Video, GIF, animated webp now; Lottie and code later | Idea |
| **Drifting art strip** | Two rows of art moving in opposite directions, pause on hover | In `r2/gallery-v2` |
| **Media hero** | YouTube/video/image on load, with an on/off switch (YouTube facade so the player loads only on click) | Idea |
| **Float / layer** | **Keep this idea.** Pin any content (a picture, a log, text, a clip) anywhere: a corner or edge of a section, or free percent positions. Each piece has a size, rotation, motion (still, drift, follows the scroll) and layer (behind or in front of a section's text). Hidden or shrunk on phones so it never covers text. Control plane: a list of floats, each with a picture picker, attach point and motion | Idea, build next |

## 8. Architecture: does it need to be serverless?

**No. The public site stays static.** Astro builds plain HTML, CSS, JS and images that a CDN serves: fastest and cheapest, and visitors never touch a server.

Only two things need server code, and both fit in a few small serverless functions (e.g. Vercel functions):

1. **The admin / control plane:** login, saving changes, image uploads, and a Publish button that triggers a rebuild of the static site.
2. **The shop:** a function that creates a Stripe Checkout session when someone clicks Buy, and a webhook that records paid orders and lowers stock.

Where content lives (two stages, same data format, so moving between them is a storage swap):

- **Stage 1: git as the database.** Content and layout are files in the repo (`layout.json`, logs, project metadata). A local admin edits them and you commit. No server, no login, free, every change is versioned. Enough until the shop is live.
- **Stage 2: live admin.** Content in a hosted store (Firestore fits; you already use Firebase Storage), admin behind a login, Publish triggers a rebuild. Shop orders and stock live here too.

Other bits: GitHub repo data is fetched at build time (rebuild on a schedule); images stay on Firebase Storage behind one `asset()` helper. I will not touch your Firebase or Stripe until you create the keys and tell me to.

### Publishing, step by step (Vercel)

Your Vercel project is connected to the GitHub repo, so a push to `main` already deploys. The control plane uses that:

1. You edit in the admin (it only changes drafts until you publish).
2. **Publish** calls a serverless function on Vercel. The function commits the changed content files (project list, layout, logs, shop listings) to the GitHub repo through the GitHub API, using a token stored in Vercel environment variables.
3. GitHub notifies Vercel, Vercel builds the static site (pictures are resized to webp during the build), and the new version goes live in about a minute. If a build fails, the old site stays up.
4. Every publish is a git commit, so any change can be undone. For changes that need no code (a price), the function can also write to a small database and trigger a Vercel Deploy Hook instead.

Pictures: uploaded from the admin to storage (Firebase Storage now, or Vercel Blob) and referenced from the content files.

### Admin password

The admin is private and **the password is checked on the server**, not in the page. Hiding a page in the browser protects nothing. Real options on Vercel:

- **Middleware (recommended):** a Vercel Edge Middleware guards `/admin` and every `/api/admin/*` route. A visitor without a valid signed session cookie gets the login page. The password is stored only as a hash in an environment variable, with rate limiting and lock-after-5-failures.
- **Auth service:** a hosted login (for example Auth0 or Clerk) or GitHub sign-in restricted to your account. More setup, but gives two-factor and password reset.
- Vercel's built-in Password Protection can lock a whole deployment, but that is a paid feature and locks the public site too, so it does not fit here.

The mockup has a fake sign-in screen so you can see the experience; any password works there.

## 9. Build phases

0. **Done:** cleanup, de-fork, Astro replica of the old site (`rework` branch, uncommitted).
1. **Design tokens and chrome:** Inter, tab bar with logo, hamburger, footer, dark mode. Replace `replica.css` piece by piece.
2. **Home:** hero wheel, centered heatmap (real GitHub data), Latest viewer, capped Projects, section stack read from `layout.json`.
3. **Projects page:** metadata JSON, filters (type, kind, year, color, shape, language), search, views, 24-at-a-time loading. Compute dominant color and aspect ratio per project at build time.
4. **Other pages:** About, Logs (paginated), Archive, Shop (static listings first).
5. **Control plane stage 1:** local admin that edits the JSON/markdown files.
6. **Wild modules:** collage, marquee, vine first; then the reveal transition and the 3D face; then Suminagashi, fractal, retro desktop, terminal, art player.
7. **Shop live:** Stripe Checkout function + webhook, listings in the admin.
8. **Control plane stage 2:** hosted content store, login, Publish.
9. **Polish:** Lighthouse, mobile pass, reduced motion, OG images, RSS, sitemap.

## 10. Reference sites

From memory, so check them yourself: calm side **vivekg.dev**, **jagdeepraina.com**; experimental **bruno-simon.com**, **lusion.co**, **activetheory.net**, Google **foo.bar**; retro desktop **nilsmatteson.com**; collage and gallery ideas on **awwwards.com**, **godly.website**, **siteinspire.com**, **readymag.com**, **cargo.site** portfolios.

## 11. Open questions

1. Where should your name appear by default? The control plane lets you switch.
2. Projects cap on the home page: what number feels right (mockup default 12)?
3. Real paginated URLs for projects later, or is "show more" enough?
4. Shop: prints only, or originals too (one-off stock)? Shipping and tax handled by Stripe, or flat rates?
5. Which wild modules should I mock up next: 3D face (Titan), Suminagashi, fractal, retro desktop, terminal?
6. Control plane: start with the local git-based version (stage 1), or go straight to a live login version?
