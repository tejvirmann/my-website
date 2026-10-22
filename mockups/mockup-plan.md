# Mockup plan

**Round 3 is made** (`r3/index.html`): home, projects, logs, archive, about, shop and the control plane, on the gallery v3 design. Rounds 1 and 2 are unchanged.

**Round 2 is made** (`r2/index.html`, Round 1 is untouched): art layouts (9), software projects, and v2 of all four home pages with the feedback applied. Mockup images are optimized by `r2/optimize.mjs`.

**To view the mockups:** from the repo root run `python3 -m http.server 8123`, then open http://localhost:8123/mockups/r1/index.html. (Opening the `.html` files directly can fail on macOS: Chrome is not allowed to read files in Documents unless they were opened through Finder or `open`.)

**Decisions so far:** keep the prod structure and tighten it; calm base first; everything built so loud sections can drop in later. **Round 1 is made**: `r1/index.html` has four full home pages (prod tightened, column, gallery, hybrid) on real content. Each has a mockup panel with `theme`, `sections` (shows the section stack) and `wild slot` (drops a loud section in). Still open: nav left vs top, and the default theme (all four follow the system setting and toggle).


No new mockups are made until this plan is agreed on.

## 1. What exists now

All files are in `mockups/`, standalone HTML, real art, dark/light toggle. Open `index.html`.

| File | What it is | Answers | Status |
|---|---|---|---|
| `prod-replica.html` | tejvirmann.com as it is today (nav, wheel hero, GitHub card, latest logs, filters, grids) | "What are we starting from?" | Done. GitHub heatmap is random demo data |
| `a-index.html` | Big serif headline + text list, hover preview image | Index-style gallery | Early sketch. Not tied to a reference |
| `b-wall.html` | Image-first masonry with filter pills | Image-heavy gallery | Early sketch |
| `c-quiet.html` | Warm serif landing: feature, latest, favorites, everything | A calm home page | Early sketch. Closest to the live Astro site |
| `d-profile.html` | vivekg.dev-style single narrow column, photo + bio, list rows | Tight, text-first pages | Done. Bio text is sample copy |
| `e-gallery.html` | jagdeepraina.com-style left nav, one piece large with caption, viewer/grid/wall toggle | How the art is displayed | Done. Captions are generic by kind |
| `data.js` | Shared project list and image paths | - | Done |

Not made yet: anything loud, the hero options, the contrast page, mobile checks, retro desktop, vine, Suminagashi, fractal, 3D face.

## 2. What the mockups need to decide

The site has two personalities, so the mockups settle these questions, in this order. Later questions depend on earlier ones.

1. **Calm base.** Typography, color, spacing, nav, and the shape of a calm page. Without this, the loud sections have nothing to contrast against.
2. **Art display.** How a piece is shown, and how a set of pieces is shown. You said this is the most important part.
3. **Hero.** What a visitor sees first: wheel, video, or something else.
4. **Loud sections.** Each one separately, as its own piece of art.
5. **The contrast.** Calm into loud into calm in one scroll. This is the main design idea, so it gets its own round.
6. **Mobile.** Everything above at phone width.

## 3. Rounds

Each round has a fixed set of mockups, one question, and a pick-by-reaction step. Same loop as the music map: make several, react, narrow down, build.

### Round 1: Calm base (3 to 4 mockups, whole home page each)

Start from the three directions already seen, but make each a **complete home page** (nav, hero slot, art section, logs, about teaser, footer) so they can be compared fairly. Right now D and E are only parts of a page.

- **R1-A "Column"**: vivekg.dev. Narrow serif column, list rows, small thumbnails.
- **R1-B "Gallery"**: jagdeepraina.com. Left text nav, art large, caption.
- **R1-C "Prod, tightened"**: the current prod design, with spacing, type and the nav cleaned up. This is the safe option and keeps what you like about the existing UI.
- **R1-D "Hybrid"**: Column for text pages, Gallery viewer for art.

Decision: pick one base (or a hybrid). Output: a short token sheet (fonts, 5 colors, spacing scale, nav pattern).

### Round 2: Art display (one page, 5 displays of the same 16 pieces)

Take the winning base and show the art 5 ways side by side as tabs on one page:
1. Single viewer with caption (arrows, keyboard, swipe)
2. Uniform grid
3. Wall (same-height rows, natural widths)
4. Index list with hover preview
5. Full-bleed horizontal scroller

Also decide: the caption fields (title, year, medium, size, note), what happens on click (lightbox vs own page), and how animated art (video, GIF, webp) plays: hover, autoplay muted, or click.

Decision: which display is default and which are switchable per section. Output: the `art-display` module spec.

### Round 3: Hero (4 mockups)
1. Wheel (current): crossfading figures with the name in front.
2. Media: YouTube/video, full-screen, with a skip control.
3. Type-only: just the name, nothing else (the calm option).
4. Statement + one featured piece.

Show each with the on/off switch idea in a small settings panel.

### Round 4: Loud sections (one mockup per float)

One file per float so each is judged as an art piece, in this order of priority:

1. **Dense art collage**: the core loud section. Show at 2 densities.
2. **Suminagashi**: interactive marbled ink.
3. **Fractal / math SVG**: parameters shown as sliders to see what a "setting" looks like.
4. **Vine growth**: SVG vine growing out of the page edge on scroll.
5. **3D face, section falls away**: the Attack-on-Titan reveal. Hardest one, so start with a flat fake (CSS transform + clip-path) to judge the feel before any real 3D.
6. **Retro desktop**: nilsmatteson.com Windows 95 style, with real content in the windows.

Each is a fixed-height block (about 100vh) so it can be dropped into a page. Each mockup has 2 or 3 settings visible to prove the idea of per-section controls.

Decision: which floats are worth building and in what order. Output: for each, a settings list (that list becomes the control-plane form).

### Round 5: The contrast (2 or 3 full-page mockups)

Assemble the winners from rounds 1 to 4 into full pages:
- **Slow**: calm, one loud block, calm.
- **Hard cut**: calm, loud, calm, with an abrupt change.
- **Transitional**: the loud section reveals from the calm one (the fall-away).

Decision: how abrupt the change should be and where it sits on the page.

### Round 6: Mobile

Each winner at 375px wide, checked in the same files with a phone-frame preview. Focus on loud sections because they break first. Output: the mobile rule for each module (collapse, replace, or hide).

## 4. Rules for making the mockups

- **Real content only.** Real art from `src/assets/art`, real log titles. Any placeholder text is marked as such and not claimed as yours.
- **One shared token block** at the top of each file (colors, fonts, spacing). The winning tokens move into the real site's CSS unchanged. This is what made the music map easy to build.
- **No frameworks in mockups.** Plain HTML/CSS/JS, one file each, so they open by double-click.
- **Dark and light** in every mockup.
- **Every mockup works at desktop and phone width** from the start (I won't leave mobile to a late round, only the final check).
- **Motion respects `prefers-reduced-motion`.**
- **Naming:** `r1-column.html`, `r2-art-display.html`, `r4-collage.html`. The round is in the name. Old files stay but get listed as "early sketches" in the index.
- **Index page** lists rounds in order with one line on the question each answers and a "winner" marker once you pick.

## 5. How we decide

For each round I show the files and you react: keep, kill, or change one thing. I won't ask for ratings. After each round I update the index with the winner and write down what you said in `plan.md`, so the reasons aren't lost. Anything you mention that isn't a mockup yet goes into the backlog in `plan.md`.

## 6. Mapping to the build

| Mockup output | Becomes |
|---|---|
| Round 1 tokens | `src/styles/global.css` variables and `Base.astro` layout |
| Round 2 spec | `art-display` module and the log frontmatter fields (`medium`, `size`) |
| Round 3 | `hero-*` modules and the hero on/off setting |
| Round 4 settings lists | each module's manifest and its control-plane form |
| Round 5 | the home page stack in `src/layout.ts` and the calm/loud theme switch |
| Round 6 | each module's mobile fallback |

## 7. Open questions before round 1

1. Should round 1 include the prod-tightened option, or do you want to move away from the current look entirely?
2. Do you want the nav on the left (like E) or on top, or both options shown?
3. Light or dark as the default theme for the calm base?
4. Is the order of rounds right, or do you want to see the loud sections first because they're the exciting part?
