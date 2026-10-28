# Wild animations plan (branch `wild-animations`)

Goal: three new loud sections, plus **Floats**, a way to put content anywhere on the page instead of only in the four slots between sections. Everything stays switchable and editable from the control plane (`/admin`).

## 0. Where the code is today

- Wild sections already built: `collage`, `marquee`, `vine`, `ink`, `math`, `desktop`, `terminal`. (You said one; there are seven, so the three below are new on top of those.)
- Registry: [src/lib/wild.ts](src/lib/wild.ts) (`WILD` kinds with settings fields, `SLOTS`, `Placement`). The admin form is generated from it.
- Renderer: [src/components/Wild.astro](src/components/Wild.astro) picks a component by `kind`. Bigger ones live in `src/components/wild/`.
- Placement: `placements` in [src/data/site.json](src/data/site.json), **one section per slot, four slots** (after hero / activity / latest / projects). Used in [src/pages/index.astro](src/pages/index.astro).
- Admin: [src/scripts/admin.ts](src/scripts/admin.ts) tab "Wild sections" (a select per slot plus fields).

Two limits to fix, and they drive the plan: **one section per slot** and **home page only**.

## 1. The three new sections

Picked to be different from each other in kind: one scroll-driven, one physical, one generative. Each uses your own art, so they feel like yours.

### A. Wall falls away (Titan reveal)  `kind: titan`

**What the visitor sees.** A section that looks like a plain stone or brick wall (or a copy of the page above it). As they scroll into it, the section pins in place, cracks spread from a point, the wall breaks into chunks that fall down and away with a little shake, and behind it a huge face fills the screen. Scroll on and the face slowly turns toward the cursor, then the section unpins.

**How it works.**
- Pinned scroll section (`position: sticky` inside a tall wrapper, about 300vh). Scroll progress 0 to 1 drives everything, no timers, so it scrubs backward too.
- Phase 1 (0 to 0.35): cracks. SVG crack paths draw themselves (same `stroke-dashoffset` trick the vine uses).
- Phase 2 (0.35 to 0.7): the wall is a grid of about 8×12 tiles (CSS `div`s with `clip-path` or a background slice). Each tile gets a seeded random fall: translate Y, rotate, scale, fade. Screen shake on a transform.
- Phase 3 (0.7 to 1): the face. **Step 1 (this branch):** fake 3D with 3 to 4 stacked cut-out layers (face, eyes, mouth, background) that move at different speeds with the cursor/tilt (parallax), plus a slow scale-in. **Step 2 (later, only if step 1 feels good):** real depth with a WebGL displacement shader (OGL, about 10 KB, lazy loaded) using a depth map.
- Art: uses a face piece from `src/assets/art` (`humanface`, `demonfaces`). Setting to pick which.
- Phones: no pinning; a shorter version that plays once when it enters the screen.
- Reduced motion: shows the face with the wall already fallen.

**Settings in the control plane:** face picture (single pick), wall style (brick, stone, black glass, "copy of the page"), scroll length (short / normal / long), shake on/off.

**Risk:** the layered cut-outs need clean separated layers. I will start with one image plus CSS masks (eyes and mouth as ellipses) and judge it before asking you for layered art.

### B. Art pile (gravity)  `kind: pile`

**What the visitor sees.** The section is empty. When it scrolls in, your pieces drop from above and pile up on the floor, bouncing and settling. The visitor can grab a piece, throw it, shove the pile with the cursor, and tilt the "room" on a phone (device motion). Double-click a piece to open its log.

**How it works.**
- Tiny 2D rigid-body physics, written by hand or Matter.js lazy loaded (about 80 KB; hand-written for rectangles only is about 3 KB, and I will try that first since pieces are boxes).
- DOM elements for the pieces (so they stay crisp, accessible and clickable), positions updated each frame with `transform`. Canvas is not needed.
- Pauses when off screen (`IntersectionObserver`) and when the tab is hidden.
- Reduced motion: the pieces are shown already piled, not draggable.
- Phones: touch drag works; tilt only after a tap on "Tilt" (iOS needs a permission prompt).

**Settings:** pieces (checklist of logs, none picked = random 10 from the site), gravity (normal / moon / zero-g, where zero-g makes them float and bump), piece size, floor on/off (off = they fall out the bottom and respawn).

### C. Particle portrait  `kind: particles`

**What the visitor sees.** One of your pieces made of thousands of small dots. The cursor repels them like water, and every few seconds the dots flow into the next piece (or into a line of text such as "Brain architectures"). Click to scatter it.

**How it works.**
- At build time, each chosen image is reduced to a small point cloud (about 6 to 9k points: position, color) and saved as a small JSON file next to the page, so the visitor never decodes the full image. The build script goes next to `scripts/art-meta.mjs`.
- One canvas, points as `fillRect`; per-point spring toward its target plus repulsion from the cursor. Morph = change the targets and let the springs do the work.
- Text targets are generated in the browser from an offscreen canvas.
- Point count drops on phones and on slow frame rate (it measures itself).
- Reduced motion: a still picture.

**Settings:** pieces to cycle (pick several), text to morph into (optional), dot size, color mode (original colors, single color, accent), cycle speed.

### Why these three

| | Input | Tech | Feels like |
|---|---|---|---|
| Wall falls away | scroll | CSS, SVG, later WebGL | A moment, cinematic |
| Art pile | grab, throw, tilt | small physics on DOM | A toy |
| Particle portrait | cursor | canvas | Alive, hypnotic |

Not chosen now but kept on the list: 3D hero face with real depth only, animated art player, drifting art strip, media hero (see `plan.md` section 7).

## 1b. New direction: complex geometric and graphic designs

You want the wild sections to branch toward **mathematical, geometric, light-based pictures**, not only collage-style ones. References you gave:

| Reference | What it is | Design here |
|---|---|---|
| `Desktop/screen.png` (a point set on a plane with a line between every two points exactly 1 apart, the Erdős unit distance picture) | Dense rosettes of blue lines and orange points, 8-fold symmetry | **Unit-distance lattice** |
| `untitled - style/fractals/` (Mandelbrot and Julia spirals, neon palettes) | Zooming, colored fractals | **Fractal zoom** |
| Stained glass | Colored panes separated by dark lead lines, light shining through | **Stained glass** |
| James Turrell light works | Pure fields of colored light, glowing apertures, no objects | **Light field** |

### The quick way to iterate: one lab page, one function per design

[mockups/r4/geometry-lab.html](mockups/r4/geometry-lab.html) is a single file with no build step (open it in a browser). It has all four designs as tabs, a slider for every setting, **Randomize**, **Pause**, and **Copy settings** (the settings as JSON). Built and checked in headless Chrome; all four render.

Why this is the fastest loop:
1. A design is one object: `{ params, setup, frame }`. `frame(canvas, time, settings, cursor)` draws one picture. To try a new idea you add one object to the `DESIGNS` list; nothing else changes.
2. Sliders come from the `params` list, so adding a setting is one line. You tune by feel, then press Copy settings to keep the look you like.
3. Heavy work happens in `setup` only (building the points, rendering the glass once); `frame` stays cheap. Lattice and glass pre-render to an offscreen image, the fractal is a GPU shader.
4. **It is the same shape as the site's registry.** The settings JSON is exactly what a placement in `site.json` stores, and `params` is what `WILD` in `src/lib/wild.ts` calls `fields`. Promoting a design to the site = move the object into a component under `src/components/wild/`, add one `WILD` entry, done. No rewrite.

Loop: you open the lab, tell me what to change ("more symmetry", "less lead", "slower"), I change the numbers or the function, you reload. When one looks right, it graduates to the site and the lab stays as the sandbox.

### The four designs (what is in the lab now)

- **Unit-distance lattice:** points are sums of unit vectors at n equal angles; every pair exactly 1 apart is joined by a line (found with a spatial hash, so it is fast). Settings: symmetry n (4 to 16), radius, spin, pulse, hue, dot size. The lines are drawn once, then rotated and tinted per frame. The current default is denser than your screenshot; lower the radius to 4 to thin it. *Next:* make the reference's exact look (thin blue lines, orange dots, sharp edge), a hover that lights the unit-distance neighbors of the point under the cursor, and a mode that adds points one at a time.
- **Fractal zoom:** a Mandelbrot / Julia fragment shader with smooth coloring that zooms toward a spiral and back. Julia mode follows the cursor. Settings: mode, zoom speed, detail, palette shift, color cycling, palette (fire, ocean, neon). *Next:* match the neon palettes in your fractal sheet, more fractal families (Burning Ship, Newton), and a "pin the zoom point" setting.
- **Stained glass:** Voronoi panes with dark lead lines, glass texture and a beam of light sliding across. Settings: pane count, seed, lead width, palette (cathedral, jewel, sunset, mono), light speed, glow. *Next:* cathedral windows with real structure (a rose-window radial layout, lancet arches), light that changes with the time of day, and an option to use one of your pictures as the color source so each pane is the average color of that region.
- **Light field:** Turrell-style apertures: rectangle, skyspace (ellipse), corner, and full-field Ganzfeld, with a slowly drifting hue and a "breathing" size. Settings: aperture, hue, drift, edge softness, size, breathing. *Next:* a stack of several nested apertures, a doorway you walk "through" on scroll, and a slow tour through a color sequence.

Each is a candidate section. Which three go on the site is your pick after you play with the lab (default: lattice, fractal, glass, since light field is the calmest and works well as a float or hero background).

### Round 2 of the geometry mockups: clean figures and 3D (replaces the lab's look)

The first lab looked busy. This round copies how the clean math-video look works: flat near-black ground, one cool line color, one warm point color, thin even strokes, few elements.

- **Images:** [mockups/r4/figures.html](mockups/r4/figures.html) shows 8 figures in `mockups/r4/img/`: Mandelbrot (seahorse valley), unit-distance lattices (8-fold and 12-fold), Penrose tiling, three times-table circles (cardioid, nephroid, a flower), and a layered rose curve. They are made by [mockups/r4/make-figures.mjs](mockups/r4/make-figures.mjs) (Node, no dependencies, runs in about 2 seconds); change the palette or numbers at the top and run it again.
- **More images (round 3):** the gallery now has 20 figures. New: Clifford and De Jong attractors, Newton fractal, Burning Ship, Lyapunov fractal, reaction-diffusion, Apollonian gasket, Ulam spiral, Hilbert curve, phyllotaxis, Truchet tiles, harmonograph. Click any picture to enlarge. `figures.html` now has every picture embedded, so it opens from any viewer.
- **Round 4 (nature, Penrose, unit-distance, 3D from images, animation tab):** the gallery has 47 figures in sections (nature and the golden ratio; Penrose and quasi-periodic tilings; unit-distance graphs; fractals and attractors; numbers and curves). Penrose-type tilings now use de Bruijn's grid method, so 4-, 5-, 6-, 7-, 9- and 11-fold versions come from one function. [mockups/r4/animate.html](mockups/r4/animate.html) is a new tab with five animations on unit-distance graphs and tilings: Signal (pulses along unit edges), Grow, Phason Penrose, Golden kaleidoscope, Stretch. 3D gained shaded solid surfaces, glowing particles, and eight new scenes (golden sunflower, nautilus shell, Romanesco, Mandelbulb ray march, relief maps of the flat images, strange attractors, quasicrystal, Ulam helix).
- **3D:** [mockups/r4/3d.html](mockups/r4/3d.html) has four scenes in three.js: a rotating tesseract, a Hopf fibration, an icosahedral unit-distance lattice, and a Klein bottle. Drag to rotate, scroll to zoom.
- **How they go on the site:** still images become SVG or PNG pieces in a Float or a section (cheap, no JavaScript). 3D scenes become a lazy-loaded section that loads three.js only when it nears the screen (about 600 KB, so only if the page is on).
- **Later option:** render the same figures with Manim as looping clips for an animated art player.

### Where this changes the earlier sections

The three sections in part 1 (Wall falls away, Art pile, Particle portrait) stay, but the geometric family goes first because it is cheaper (no new art, no new data step) and fits your taste. These designs also make good **Floats** (small, in a corner or between sections), and the lattice and glass can use your art as their colors.

## 2. Content in non-normal places: Floats

The idea already in `plan.md` ("Float / layer, build next"), now specified. A **float** is any one piece of content pinned somewhere unusual.

### What you can put in a float
A picture (from a log or uploaded), a whole log card, a short text, a sticker/emoji, a looping clip (mp4/webm/gif), or **a wild section in miniature** (for example the particle portrait as a small circle in a corner).

### Where it can go (anchors)
| Anchor | Meaning |
|---|---|
| **Viewport corner or edge** | Fixed to the screen (top-right, bottom-left, left edge middle...) and stays while scrolling |
| **Section edge** | Attached to the top or bottom edge of a named section (hero, activity, latest, projects, any wild slot), with an offset, so it straddles the border between two sections |
| **Page position** | Free percent x and y of the whole page, scrolls with it |
| **Margin gutter** | In the empty space left or right of the centered content on wide screens (hidden on narrow ones) |
| **Behind the tab bar / footer** | Sits on or hangs off the header or footer |
| **Peek** | Half hidden at a screen edge; slides out on hover or on scroll |
| **Cursor follower** | Trails the cursor with lag (desktop only) |

### Per-float options
size, rotation, opacity, **layer** (behind or in front of section text), **motion** (still, drift, bob, parallax on scroll, follow cursor, spin), **which pages** (home, logs, projects, about, shop, 404, or all), **devices** (show on desktop, tablet, phone; default hidden on phones so it never covers text), click action (none, open a log, open a link), enter animation (fade, pop, slide).

### Safety rules
Floats never block clicks on text or buttons unless they are links themselves (`pointer-events: none` otherwise), never cause horizontal scroll (page `overflow-x: clip`), are `aria-hidden` when decorative, respect reduced motion, and a global **Floats on/off** switch in settings turns them all off at once.

### How it fits the code
- New `floats` array in [src/data/site.json](src/data/site.json), each item `{ id, enabled, content: {type, ref}, anchor: {type, ...}, size, rot, layer, motion, pages, devices }`.
- New `src/components/Floats.astro`, mounted once in [src/layouts/Base.astro](src/layouts/Base.astro) so it works on every page. Section anchors need each home section wrapped with `data-sec="<id>"`; a tiny script measures the section and places the float (CSS where possible, script only for section-edge and cursor follow).
- New `FLOAT_*` registry in `src/lib/wild.ts` next to `WILD`, so the admin form is generated, same as today.

### Also fix: more wild sections, more slots
- `placements` goes from **one object per slot** to **a list per slot**, so a slot can hold several sections stacked (old data keeps working: an object is read as a list of one).
- More slots: before the hero, between the hero images and the activity strip, before the footer, plus **per-page slots** (top and bottom of logs, projects, about).
- Each placed section gets an **on/off switch** without losing its settings (right now removing it deletes the settings).

## 3. Control plane changes

Existing tab **Wild sections** gets:
1. Slots show a **list** with add, reorder (up/down), on/off, remove.
2. The kind picker shows a thumbnail and a one-line description of each kind.
3. Three new kinds appear automatically from the registry (title, fields).

New tab **Floats**:
1. List of floats with on/off, add, duplicate, delete.
2. Per float: content picker, anchor picker (shows only the fields that anchor needs), size / rotation / opacity, layer, motion, pages, devices.
3. **Preview with drag handles:** an embedded view of the real home page where you drag a float and the anchor and offsets update. (Second step; the first version is plain number fields.)

Also on Home tab: global **Floats on/off** and **Reduce all motion** switches.

## 4. Build order

Each step is one commit and leaves the site working.

0. **Geometry lab (done):** [mockups/r4/geometry-lab.html](mockups/r4/geometry-lab.html), four designs. Iterate here first.
1. **Data and slots:** list-per-slot, on/off per placement, new slots, `data-sec` wrappers. Admin updated. (Prereq for everything else.)
2. **Floats v1:** viewport corner, section edge, page position; picture + text content; still / bob / parallax motion; pages and devices; admin tab with number fields.
3. **Geometric sections:** promote the lab designs you pick into `src/components/wild/` and `WILD` (one component and one registry entry each), lazy loaded, with static fallbacks (a still frame drawn once).
3b. **Particle portrait** (proves the build-time data step).
4. **Art pile.**
5. **Wall falls away**, step 1 (CSS and layers).
6. **Floats v2:** peek, margin gutter, cursor follower, clip and wild-section content, drag-handle preview in admin.
7. **Wall falls away**, step 2 (WebGL depth), only if wanted.
8. **Polish pass:** reduced motion check on every kind, phone check at 390px, performance check (nothing animating off screen; home page JS budget from `plan.md` section 5 still met since new code is lazy loaded).

## 5. Performance and accessibility rules for all of this

- Each wild kind loads its script only when its section is near the viewport (`IntersectionObserver` with a margin), and stops its loop when it leaves.
- No wild section adds weight to the page if it is turned off.
- Every kind has a static fallback for `prefers-reduced-motion` and for no-JS.
- Decorative = `aria-hidden`; interactive pieces (pile) are real buttons with keyboard access.
- Target frame rate 60 on a mid-range phone; the particle count and physics step adapt if frames drop.

## 6. Questions I need from you (I will pick a default if you do not answer)

1. **Wall falls away:** which face? Default: `humanface`. And do you have, or want to make, a layered version (separate eyes, mouth, background)? Default: no, fake it with masks.
2. **Art pile:** should clicking a piece open its log, or is it only a toy? Default: double-click opens the log.
3. **Particle portrait:** morph into text? Default: yes, "Brain architectures" and your name.
4. **Floats:** should floats be allowed to overlap the tab bar and cover content on phones? Default: no and no.
5. **Float on other pages:** all pages from the start, or home only first? Default: all pages (it is in the layout anyway).
6. Did you mean to reuse an older branch's section? There is a `fractals` branch on the remote; if it holds a section you already built, tell me and I will bring it in instead of writing a new one.
