// Round 3 shared script: settings (shared across pages via localStorage), data helpers, capped justified rows, tiles,
// centered responsive GitHub activity, lightbox, site chrome (tabs + footer), mockup panel and the wild-slot demos.
(function () {
  const W = window
  // Everything on the site is a log. A GitHub repo only becomes a project after you create a log from it (control plane).
  W.newLogs = () => { try { return JSON.parse(localStorage.getItem('mock3.newLogs')) || [] } catch (e) { return [] } }
  newLogs().forEach(l => { if (!LOGS.some(x => x.slug === l.slug)) LOGS.unshift({ slug: l.slug, title: l.title, date: l.date, tags: ['Projects', 'Software'], desc: l.desc, imgs: [], text: [l.desc], md: (l.desc ? l.desc + '\n\n' : '') + '[View the repository on GitHub](' + l.repo + ')', fromRepo: l.repo, lang: l.lang }) })
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const root = document.documentElement

  // ---- settings: the control-plane page writes these, the other pages read them ----
  const DEF = { showFeatured: false, cap: 12, nameMode: 'footer', tiles: 'gen', swFeatured: 8, ghUser: 'tejvirmann', heroImages: 2, placements: {}, sections: null, shop: null, pageSize: 24 }
  W.S = {
    get(k) { try { const v = JSON.parse(localStorage.getItem('mock3.' + k)); return v === null ? DEF[k] : v } catch (e) { return DEF[k] } },
    set(k, v) { try { localStorage.setItem('mock3.' + k, JSON.stringify(v)) } catch (e) {} },
    reset() { try { Object.keys(localStorage).filter(k => k.startsWith('mock3.')).forEach(k => localStorage.removeItem(k)) } catch (e) {} },
  }
  W.toast = msg => { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t) } t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200) }

  // ---- data helpers ----
  KINDS.research = ['Research', '#0f9d9d'] // no projects yet; shows up as a filter so it is ready
  W.fmtDate = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  W.yr = d => (d.date || d).slice(0, 4)
  W.kindLabel = k => KINDS[k][0]
  W.sortKinds = ks => Object.keys(KINDS).filter(k => ks.includes(k))
  W.ago = d => { const m = Math.round((Date.now() - new Date(d)) / 2629800000); return m < 1 ? 'this month' : m < 12 ? m + ' mo ago' : Math.round(m / 12) + ' yr ago' }
  W.pic = (c, { sizes = '24vw', big = false, eager = false } = {}) =>
    `<img src="${IMG}${big ? c.l : c.t}" ${big ? '' : `srcset="${IMG}${c.t} 480w, ${IMG}${c.l} 1400w" sizes="${sizes}"`} width="${c.w}" height="${c.h}" alt="${c.title}" ${eager ? '' : 'loading="lazy"'} decoding="async">`
  const hue = hex => {
    const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
    if (s < 0.14 || l < 0.16 || l > 0.9) return l > 0.75 ? 'light' : l < 0.3 ? 'dark' : 'gray'
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360
    return h < 18 || h >= 340 ? 'red' : h < 45 ? 'orange' : h < 70 ? 'yellow' : h < 170 ? 'green' : h < 250 ? 'blue' : h < 290 ? 'purple' : 'pink'
  }
  W.SWATCH = { red: '#e0442f', orange: '#f0902c', yellow: '#efd83a', green: '#4cae5a', blue: '#3d78d6', purple: '#8250d6', pink: '#e86fb4', light: '#f1efe8', gray: '#9a9890', dark: '#1d1c1a' }
  // one list for art and software; every item has ar (width/height), date, year, kinds
  W.FEATURED_SW = ['my-music-app', 'otel-autopilot', 'midwestmisl', 'protest-signs', 'medical-ai-benchmarker', 'wherewelanding', 'rug-generator', 'manager-v2', 'eywal', 'madison-codes-poc']
  // which projects are on the site: all art and writing by default, and only the software you pick (default: the featured list)
  // featured = chosen in the control plane; default is the art marked favorite
  W.featured = () => new Set(S.get('featured') || CARDS.filter(c => c.kinds.includes('favorite')).map(c => c.slug))
  W.published = () => { const p = S.get('published'); return new Set(p || CARDS.map(c => c.slug)) }
  W.allItems = (onlyPublished = true) => {
    const art = CARDS.map(c => ({ type: 'art', id: c.slug, title: c.title, date: c.date, year: yr(c), kinds: c.kinds, ar: c.ar, col: c.col, hue: hue(c.col), shape: c.ar > 1.25 ? 'landscape' : c.ar < 0.8 ? 'portrait' : 'square', desc: c.desc, c }))
    const sw = newLogs().map(l => ({ type: 'sw', id: l.slug, title: l.title, date: l.date, year: l.date.slice(0, 4), kinds: ['software'], lang: l.lang || 'Other', get ar() { return innerWidth < 600 ? 2.1 : 1.45 }, desc: l.desc || '', r: { name: l.title, url: 'log.html?slug=' + l.slug, lang: l.lang, pushed: l.date, desc: l.desc || '' } }))
    if (!onlyPublished) return { art, sw }
    const pub = published()
    return { art: art.filter(a => pub.has(a.id)), sw: sw.filter(a => pub.has(a.id)) }
  }

  // ---- capped justified rows ----
  W.justifyRows = (host, items, { gap = 6, target, max } = {}) => {
    const width = host.clientWidth; if (!width) return
    target = target || Math.max(96, Math.min(190, width / 6)); max = max || target * 1.3
    const rows = []; let i = 0
    while (i < items.length) {
      let sum = 0, best = 1, bd = Infinity
      for (let n = 1; i + n <= items.length; n++) { sum += items[i + n - 1].ar; const h = (width - gap * (n - 1)) / sum; const d = Math.abs(h - target); if (d < bd) { bd = d; best = n } if (h < target * 0.8) break }
      const row = items.slice(i, i + best); const rs = row.reduce((a, b) => a + b.ar, 0); let h = (width - gap * (row.length - 1)) / rs
      if (h > max || (i + best >= items.length && h > target * 1.05)) h = Math.min(h, target)
      rows.push({ row, h }); i += best
    }
    host.innerHTML = rows.map(({ row, h }) => `<div class="jr" style="height:${h.toFixed(1)}px;gap:${gap}px">${row.map(it => tileHTML(it, Math.round(it.ar * h), h)).join('')}</div>`).join('')
  }
  W.watchRows = (host, build) => { let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(build, 80) }).observe(host); build() }
  W.tileHTML = (it, w, h) => it.type === 'art'
    ? `<a class="t" href="log.html?slug=${it.id}" style="width:${w}px;height:${h}px;--col:${it.col}">${pic(it.c, { sizes: w + 'px' })}<span class="ov"><b>${it.title}</b>${it.year}</span></a>`
    : swTile(it.r, S.get('tiles'), w, h)

  // ---- software tiles (generated pattern in the language color) ----
  const hash = str => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
  W.truchet = (seed, color, cols = 8, rows = 6) => {
    let s = hash(seed); const r = () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    const t = 40; let d = ''
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const X = x * t, Y = y * t, h = t / 2; d += r() < 0.5 ? `M${X},${Y + h}A${h},${h} 0 0 1 ${X + h},${Y}M${X + h},${Y + t}A${h},${h} 0 0 1 ${X + t},${Y + h}` : `M${X + h},${Y}A${h},${h} 0 0 1 ${X + t},${Y + h}M${X},${Y + h}A${h},${h} 0 0 0 ${X + h},${Y + t}` }
    return `<svg viewBox="0 0 ${cols * t} ${rows * t}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>`
  }
  W.swTile = (r, style = 'gen', w, h) => {
    const col = LANGS[r.lang] || '#8a8a8a'
    return `<a class="tile ${style}" href="${r.url}" ${/^http/.test(r.url) ? 'target="_blank" rel="noopener"' : ''} style="--k:${col};${w ? `width:${w}px;height:${h}px` : ''}">${style === 'gen' ? truchet(r.name, col) : ''}<span class="tb"><b>${r.name}</b><span class="td">${r.desc || ''}</span><span class="tm"><i class="dot" style="--c:${col}"></i>${r.lang || 'Code'} · ${ago(r.pushed)}</span></span></a>`
  }

  // ---- GitHub activity: centered, fits its container, fewer weeks on narrow screens ----
  const GH = '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482 3.97-1.32 6.833-5.08 6.833-9.503C22 6.484 17.522 2 12 2z"/></svg>'
  const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th')
  W.ghCenter = (el, { user = S.get('ghUser'), total = '1,135', streak = 23 } = {}) => {
    el.classList.add('gh')
    const draw = () => {
      const w = el.clientWidth || 600; const weeks = w < 460 ? 22 : w < 640 ? 34 : w < 780 ? 45 : 53
      const end = new Date(); end.setHours(0, 0, 0, 0); const start = new Date(end); start.setDate(end.getDate() - (weeks - 1) * 7 - end.getDay())
      let cells = ''
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0, 10), x = (hash(iso) % 1000) / 1000
        const n = x < 0.55 ? 0 : x < 0.75 ? 1 + (hash(iso + 'a') % 3) : x < 0.88 ? 4 + (hash(iso + 'b') % 3) : x < 0.96 ? 7 + (hash(iso + 'c') % 3) : 10 + (hash(iso + 'd') % 8)
        const lvl = n === 0 ? 0 : n < 4 ? 1 : n < 7 ? 2 : n < 10 ? 3 : 4
        cells += `<i data-l="${lvl}" data-t="${n ? n + ' contribution' + (n > 1 ? 's' : '') : 'No contributions'} on ${d.toLocaleDateString('en-US', { month: 'long' })} ${ord(d.getDate())}"></i>`
      }
      el.innerHTML = `<div class="gh-head"><a href="https://github.com/${user}" target="_blank" rel="noopener">${GH}github.com/${user}</a><span><b>${total}</b> contributions in the last year · ${streak}-day longest streak</span></div><div class="gh-grid" style="grid-template-columns:none">${cells}</div>`
      const grid = $('.gh-grid', el); let tip = $('.gh-tip'); if (!tip) { tip = document.createElement('div'); tip.className = 'gh-tip'; document.body.append(tip) }
      grid.onmouseover = grid.onclick = e => { const t = e.target.closest('i'); if (!t) return; const b = t.getBoundingClientRect(); tip.textContent = t.dataset.t; tip.style.left = b.left + b.width / 2 + 'px'; tip.style.top = b.top + 'px'; tip.classList.add('on') }
      grid.onmouseleave = () => tip.classList.remove('on')
    }
    let last = 0, t; draw(); last = el.clientWidth
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (Math.abs(el.clientWidth - last) > 2) { last = el.clientWidth; draw() } }, 120) }).observe(el)
  }

  // ---- lightbox ----
  let lbList = [], lbI = 0
  const lbEl = () => { let el = $('#lb'); if (el) return el; el = document.createElement('div'); el.id = 'lb'; el.innerHTML = '<div class="top"><span id="lbn"></span><button id="lbx">Close ✕</button></div><div class="stage"><img id="lbi" alt=""></div><div class="cp"><div id="lbc"></div><span><button id="lbp">← Prev</button> &nbsp; <button id="lbnx">Next →</button></span></div>'; document.body.append(el)
    $('#lbx').onclick = () => el.classList.remove('on'); $('#lbp').onclick = () => lbShow(lbI - 1); $('#lbnx').onclick = () => lbShow(lbI + 1); el.onclick = e => { if (e.target === el || e.target.classList.contains('stage')) el.classList.remove('on') }
    addEventListener('keydown', e => { if (!el.classList.contains('on')) return; if (e.key === 'Escape') el.classList.remove('on'); if (e.key === 'ArrowRight') lbShow(lbI + 1); if (e.key === 'ArrowLeft') lbShow(lbI - 1) }); return el }
  const lbShow = i => { lbI = (i + lbList.length) % lbList.length; const c = lbList[lbI]; $('#lbi').src = IMG + c.l; $('#lbn').textContent = `${lbI + 1} / ${lbList.length}`; $('#lbc').innerHTML = `<b>${c.title}</b> · ${yr(c)} · ${sortKinds(c.kinds).filter(k => k !== 'favorite').map(kindLabel).join(', ')}<br><span class="mute">${c.desc}</span>` }
  W.bindLightbox = (list = CARDS) => document.addEventListener('click', e => { const a = e.target.closest('[data-lb]'); if (!a) return; e.preventDefault(); lbList = list; lbEl().classList.add('on'); lbShow(list.findIndex(c => c.slug === a.dataset.lb)) })

  // ---- chrome: tab bar (logo only unless the control plane says otherwise) + footer + mockup panel ----
  W.chrome = (active, { wild = false, panelExtra = '' } = {}) => {
    const nm = S.get('nameMode')
    const tabs = [['projects', 'Projects', 'projects.html'], ['logs', 'Logs', 'logs.html'], ['about', 'About', 'about.html'], ['shop', 'Shop', 'shop.html']]
    const links = tabs.map(([k, l, h]) => `<a href="${h}" ${k === active ? 'class="on"' : ''}>${l}</a>`).join('')
    document.body.insertAdjacentHTML('afterbegin', `<header class="bar" data-section="navbar"><div class="wrap"><a class="logo" href="home.html" aria-label="Home"><img src="${IMG}logo.png" alt="Tejvir S. Mann" width="42" height="30">${nm === 'beside' ? '<b>Tejvir S. Mann</b>' : ''}</a><nav class="tabs">${links}</nav><button id="menuBtn" aria-label="Menu" aria-expanded="false"><span></span></button></div><nav id="menu">${links}</nav></header>`)
    $('#menuBtn').onclick = () => { const on = $('#menu').classList.toggle('on'); $('#menuBtn').setAttribute('aria-expanded', on) }
    document.body.insertAdjacentHTML('beforeend', `<div class="wrap"><footer class="site" data-section="footer"><span>© 2026${nm === 'footer' ? ' Tejvir S. Mann' : ''}</span><span><a href="archive.html">Archive</a> · <a href="https://github.com/tejvirmann">GitHub</a> · <a href="#">X</a> · <a href="#">LinkedIn</a> · <a href="control-plane.html">Admin</a></span></footer></div>`)
    const p = document.createElement('div'); p.id = 'panel'
    p.innerHTML = `<span class="lbl">mockup</span><button data-a="theme">◐ theme</button><button data-a="sections">▢ sections</button>${wild ? '<button data-a="wild">✺ wild: off</button>' : ''}${panelExtra}`
    document.body.append(p)
    p.addEventListener('click', e => {
      const a = e.target.dataset.a
      if (a === 'theme') { const d = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches; root.dataset.theme = d ? 'light' : 'dark' }
      if (a === 'sections') { document.body.classList.toggle('show-sections'); e.target.classList.toggle('on') }
    })
    return p
  }

  // ---- wild-slot demos: stand-ins for the real animation modules ----
  const rng = seed => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647) }
  W.WILD = {
    collage(el, opts = {}) {
      const r = rng(3), pool = opts.art && opts.art.length ? CARDS.filter(c => opts.art.includes(c.slug)) : CARDS, pics = [...pool].sort(() => r() - 0.5).slice(0, 14)
      el.innerHTML = `<div class="band t"><span>${'Tejvir S. Mann ✺ Drawing ✺ AI ✺ Brain architectures ✺ Stories ✺ '.repeat(6)}</span></div><h2>Wild<br>slot</h2>` +
        pics.map((p, i) => { const w = 110 + r() * 150; return `<div class="piece" style="left:${r() * 86}%;top:${14 + r() * 62}%;width:${w}px;height:${w * (0.75 + r() * 0.6)}px;rotate:${(r() - 0.5) * 34}deg;z-index:${1 + (i % 4)};--d:${5 + r() * 6}s"><img src="${IMG}${p.t}" alt="" loading="lazy"></div>` }).join('') +
        `<div class="band b"><span>${'Selected work ✺ Scroll ✺ Look closer ✺ '.repeat(8)}</span></div>`
    },
    marquee(el) { el.classList.add('marq'); el.innerHTML = ['Drawing ✺ AI ✺ Brain architectures ✺ Stories ✺ ', 'Selected work ✺ New pieces ✺ Look closer ✺ '].map((t, i) => `<div class="band ${i ? 'b' : 't'}"><span>${t.repeat(10)}</span></div>`).join('') },
    vine(el) {
      el.classList.add('vine')
      const stems = ['M120,540 C90,430 220,400 200,300 S120,200 240,120 S380,60 360,-10', 'M600,540 C640,450 520,400 560,320 S700,240 660,150 S560,80 620,-10', 'M1060,540 C1020,440 1140,390 1110,300 S1000,200 1090,110 S1190,40 1150,-10', 'M240,120 C310,100 360,150 340,210 S300,260 350,300', 'M660,150 C730,140 790,190 770,250 S720,300 780,340', 'M1110,300 C1050,290 1010,340 1030,390 S1060,440 1010,470']
      el.innerHTML = `<div class="cap2">Vine growth: SVG paths draw themselves as the section scrolls into view, branching out of the page edge. Roots grow downward the same way.</div><svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice">${stems.map((d, i) => `<path class="v" d="${d}" fill="none" stroke="#6fbf73" stroke-width="${i < 3 ? 5 : 3}" stroke-linecap="round"/>`).join('')}<g class="lv"></g></svg>`
      const paths = $$('path.v', el), lv = $('.lv', el), len = paths.map(p => p.getTotalLength()), leaves = []
      paths.forEach((p, i) => { p.style.strokeDasharray = len[i]; p.style.strokeDashoffset = len[i]; const n = 9 + i; for (let k = 1; k <= n; k++) { const at = k / (n + 1), pt = p.getPointAtLength(len[i] * at), pt2 = p.getPointAtLength(Math.min(len[i], len[i] * at + 2)); const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI + (k % 2 ? 70 : -70); const e = document.createElementNS('http://www.w3.org/2000/svg', 'path'); e.setAttribute('d', 'M0,0 C6,-12 20,-12 28,0 C20,12 6,12 0,0'); e.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${ang}) scale(0)`); e.setAttribute('fill', k % 3 ? '#8fd694' : '#b6e8a8'); lv.append(e); leaves.push({ e, i, at, x: pt.x, y: pt.y, ang }) } })
      let started = false
      const run = () => { const t0 = performance.now(), D = 5200; const tick = now => { const p = Math.min(1, (now - t0) / D), q = 1 - Math.pow(1 - p, 3); paths.forEach((pa, i) => { const lp = Math.max(0, Math.min(1, (q * 1.25 - i * 0.04))); pa.style.strokeDashoffset = len[i] * (1 - lp) }); leaves.forEach(l => { const lp = Math.max(0, Math.min(1, q * 1.25 - l.i * 0.04)); const s = Math.max(0, Math.min(1, (lp - l.at) * 6)); l.e.setAttribute('transform', `translate(${l.x},${l.y}) rotate(${l.ang}) scale(${s})`) }); if (p < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick) }
      new IntersectionObserver((es, o) => { if (es[0].isIntersecting && !started) { started = true; matchMedia('(prefers-reduced-motion:reduce)').matches ? paths.forEach(p => (p.style.strokeDashoffset = 0)) || leaves.forEach(l => l.e.setAttribute('transform', `translate(${l.x},${l.y}) rotate(${l.ang}) scale(1)`)) : run() } }, { threshold: 0.3 }).observe(el)
    },
  }
  W.mountWild = (after, kind, opts = {}) => {
    if (!opts.placed) $('.wild[data-wild]')?.remove()
    if (kind === 'off') return null
    const s = document.createElement('section'); s.className = 'wild'; s.dataset[opts.placed ? 'placed' : 'wild'] = kind; s.dataset.section = 'wild-slot · ' + kind
    after.after(s); WILD[kind](s, opts); return s
  }
  // the control plane stores where wild modules are placed; pages mount them at these slots
  W.SLOTS = { 'after-hero': 'After the hero', 'after-activity': 'After the activity strip', 'after-latest': 'After latest', 'after-projects': 'After projects' }
  W.MODULES = {
    collage: { name: 'Dense art collage', status: 'ok', note: 'Pieces scattered and layered with marquee bands. Choose the art.' },
    marquee: { name: 'Marquee bands', status: 'ok', note: 'Text or images sliding across the screen at any angle.' },
    vine: { name: 'Vine / root growth', status: 'ok', note: 'A vine grows out of the page edge as you scroll to it. Roots grow downward the same way.' },
    titan: { name: '3D face, wall falls away', status: 'idea', note: 'Attack-on-Titan moment: the section above falls away and a huge 3D face is revealed behind it.' },
    suminagashi: { name: 'Suminagashi', status: 'idea', note: 'Marbled-ink flow you can disturb with the cursor.' },
    fractal: { name: 'Fractal / math SVG', status: 'idea', note: 'Generated from math: L-systems, Julia sets, attractors. Parameters become settings.' },
    retro: { name: 'Retro desktop', status: 'idea', note: 'Windows 95 desktop in the style of nilsmatteson.com: windows with real content, a taskbar.' },
    terminal: { name: 'foo.bar terminal', status: 'idea', note: 'A terminal intro or easter egg inspired by Google foo.bar.' },
    artplayer: { name: 'Animated art player', status: 'idea', note: 'Video, GIF and webp now; Lottie and code later.' },
    drift: { name: 'Drifting art strip', status: 'ok', note: 'Two rows of art drifting in opposite directions (see r2 gallery v2).' },
  }
  W.applyPlacements = () => { const pl = S.get('placements') || {}; Object.entries(pl).forEach(([slot, v]) => { const sec = $(`[data-section="${{ 'after-hero': 'hero-wheel', 'after-activity': 'github-heatmap', 'after-latest': 'latest-logs', 'after-projects': 'projects' }[slot]}"]`); if (sec && WILD[v.kind]) mountWild(sec, v.kind, { placed: true, art: v.art }) }) }
  W.applyStack = () => { const st = S.get('sections'); if (!st) return; const main = $('main.wrap'); st.forEach(s => { const el = $(`main.wrap > [data-section="${s.id}"]`); if (!el) return; el.style.display = s.enabled ? '' : 'none'; main.append(el) }) }
  W.wildPanel = (after) => { const order = ['off', 'collage', 'vine', 'marquee']; let i = 0; const b = $('#panel [data-a=wild]'); b.onclick = () => { i = (i + 1) % order.length; b.textContent = '✺ wild: ' + order[i]; b.classList.toggle('on', i > 0); const el = mountWild(after, order[i]); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } }
})()
// Shop listings are derived from logs: a listing is just a log with a price. Stored: { slug, price, sizes, stock, active, badge }.
// Title, description and pictures always come from the log, so there is nothing to keep in sync.
const LISTING_DEFAULT = { price: 40, sizes: ['8×10 in', '11×14 in', '16×20 in'], stock: 5, active: true, badge: '' }
window.listingsRaw = () => S.get('shop') || [['dishwasher', 40, 8], ['pinkpen', 35, 12], ['forestlanguage', 45, 5], ['lastsupper', 50, 3, 'Original'], ['shinsakaino', 35, 10], ['purpledragon', 60, 4], ['pinkskyrocks', 35, 9], ['depspirit', 45, 6]].map(([slug, price, stock, badge]) => ({ slug, ...LISTING_DEFAULT, price, stock, badge: badge || '' }))
window.logOf = slug => LOGS.find(l => l.slug === slug)
window.coverOf = slug => { const c = CARDS.find(x => x.slug === slug); const l = logOf(slug); return c ? { local: true, c } : { local: false, src: l && l.imgs && l.imgs[0] } }
window.shopGet = () => listingsRaw().filter(r => logOf(r.slug)).map(r => ({ ...r, title: logOf(r.slug).title, id: r.slug }))
window.isListed = slug => listingsRaw().some(r => r.slug === slug)
window.setListing = (slug, rec) => { const L = listingsRaw().filter(r => r.slug !== slug); if (rec) L.push({ slug, ...LISTING_DEFAULT, ...rec }); S.set('shop', L) }
