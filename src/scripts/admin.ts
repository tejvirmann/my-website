import { create, parse, patch, withBody, type Val } from '../lib/frontmatter'

type Reg = { kinds: Record<string, string>; wild: Record<string, { label: string; fields: { key: string; label: string; type: string; options?: string[] }[] }>; slots: Record<string, string> }
type Rec = { id: string; raw: string; orig: string; isNew?: boolean; deleted?: boolean }
type Listing = { slug: string; price: number; stock: number; sizes: string[]; badge: string; active: boolean }
type Site = { ghUser: string; nameMode: string; cap: number; pageSize: number; showFavorites: boolean; tiles: string; sections: { id: string; enabled: boolean }[]; placements: Record<string, Record<string, unknown> & { kind: string }> }
type Shop = { currency: string; listings: Listing[] }

const root = document.getElementById('adm')!
const reg: Reg = JSON.parse(root.dataset.reg!)
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const today = () => new Date().toISOString().slice(0, 10)
const SECTION_NAMES: Record<string, string> = { hero: 'Hero (two images)', activity: 'GitHub activity', latest: 'Latest viewer', projects: 'Projects' }
const TABS = [['home', 'Home'], ['projects', 'Projects'], ['logs', 'Logs'], ['shop', 'Shop'], ['wild', 'Wild sections']] as const

let S = { site: {} as Site, shop: {} as Shop, siteOrig: '', shopOrig: '', logs: [] as Rec[], uploads: new Map<string, string>(), mode: 'local', tab: 'home', edit: '', filter: '', repos: null as null | { name: string; description: string; language: string; url: string; created: string; stars: number; fork: boolean; archived: boolean }[] }

const api = async <T = Record<string, unknown>>(name: string, body?: object): Promise<T & { error?: string }> => {
  const r = await fetch(`/api/admin/${name}`, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined)
  return r.json().catch(() => ({ error: `Server said ${r.status}.` }))
}
const say = (t: string, err = false) => { const m = $('msg'); m.textContent = t; m.classList.toggle('err', err) }
const jsonOf = (o: unknown) => JSON.stringify(o, null, 2) + '\n'
const fm = (l: Rec) => parse(l.raw).data
const title = (l: Rec) => String(fm(l).title ?? l.id)
const live = () => S.logs.filter(l => !l.deleted)
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'log'
const uniq = (s: string) => { let n = s, i = 2; while (S.logs.some(l => l.id === n)) n = `${s}-${i++}`; return n }
const setFm = (l: Rec, c: Record<string, Val | undefined>) => { l.raw = patch(l.raw, c) }

// ---- unsaved changes
const changes = () => {
  const out: { path: string; content?: string; base64?: string; delete?: boolean }[] = []
  if (jsonOf(S.site) !== S.siteOrig) out.push({ path: 'src/data/site.json', content: jsonOf(S.site) })
  if (jsonOf(S.shop) !== S.shopOrig) out.push({ path: 'src/data/shop.json', content: jsonOf(S.shop) })
  for (const l of S.logs) {
    const path = `src/content/logs/${l.id}.md`
    if (l.deleted) { if (!l.isNew) out.push({ path, delete: true }) } else if (l.raw !== l.orig || l.isNew) out.push({ path, content: l.raw })
  }
  S.uploads.forEach((base64, path) => out.push({ path, base64 }))
  return out
}
const refreshBar = () => {
  const n = changes().length
  $('savebar').hidden = !n
  $('dirty').textContent = `${n} unpublished change${n === 1 ? '' : 's'}`
  $('publish').textContent = S.mode === 'github' ? 'Publish' : 'Save to files'
}
addEventListener('beforeunload', e => { if (changes().length) e.preventDefault() })

// ---- screens
function login(note = '') {
  $('gate').innerHTML = `<form class="login" id="lf"><p class="mute">${esc(note) || 'Log in to change the site.'}</p><input type="password" id="pw" placeholder="Password" autocomplete="current-password" required /><button class="btn solid">Log in</button><p class="mute" id="le"></p></form>`
  $('lf').addEventListener('submit', async e => {
    e.preventDefault()
    const r = await api('login', { password: ($('pw') as HTMLInputElement).value })
    if (r.error) $('le').textContent = r.error
    else start()
  })
}

async function start() {
  const s = await api<{ authed: boolean; configured: boolean; open: boolean; mode: string }>('session')
  if (!s.configured) return void ($('gate').innerHTML = '<p>No admin password is set. Add <code>ADMIN_PASSWORD</code> in Vercel (Settings, Environment Variables), then redeploy.</p>')
  if (!s.authed) return login()
  S.mode = s.mode
  const d = await api<{ site: Site; shop: Shop; logs: { id: string; raw: string }[] }>('data')
  if (d.error) return login(d.error)
  S.site = d.site; S.shop = d.shop
  S.siteOrig = jsonOf(d.site); S.shopOrig = jsonOf(d.shop)
  S.logs = d.logs.map(l => ({ ...l, orig: l.raw })).sort((a, b) => String(fm(b).date).localeCompare(String(fm(a).date)))
  $('gate').hidden = true; $('app').hidden = false
  $('gate').innerHTML = ''
  const note = s.open ? ' Running on this computer with no password.' : ''
  say(S.mode === 'github' ? 'Publish commits your changes to GitHub; Vercel rebuilds the site in about a minute.' : `Save to files writes the files here (run npm run dev).${note}`)
  tabs(); render()
}

function tabs() {
  $('tabs').innerHTML = TABS.map(([k, t]) => `<button data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${t}</button>`).join('') + '<span class="sp"></span><button data-out>Log out</button>'
}

function render() {
  const f = { home, projects, logs, shop, wild }[S.tab as 'home']
  $('panel').innerHTML = f()
  refreshBar()
}

// ---- Home
const opt = (v: string, cur: string, label = v) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`
function home() {
  const s = S.site
  return `<h2>Section order</h2><div class="card">${s.sections.map((x, i) => `<div class="row-i"><label class="row t"><input type="checkbox" data-sec="${i}" ${x.enabled ? 'checked' : ''}> ${esc(SECTION_NAMES[x.id] ?? x.id)}</label><button class="btn" data-act="up" data-i="${i}" ${i ? '' : 'disabled'}>↑</button><button class="btn" data-act="down" data-i="${i}" ${i < s.sections.length - 1 ? '' : 'disabled'}>↓</button></div>`).join('')}</div>
  <h2>Settings</h2><div class="card grid">
    <label>Where your name shows<select data-site="nameMode">${[['none', 'Nowhere'], ['footer', 'Footer'], ['beside', 'Beside the logo'], ['hero', 'On the hero']].map(([v, l]) => opt(v, s.nameMode, l)).join('')}</select></label>
    <label>Projects on the home page (cap)<input type="number" min="3" max="60" data-site="cap" value="${s.cap}"></label>
    <label>Projects loaded at a time<input type="number" min="6" max="100" data-site="pageSize" value="${s.pageSize}"></label>
    <label>Tiles for projects without a picture<select data-site="tiles">${[['gen', 'Generated pattern'], ['type', 'Type only']].map(([v, l]) => opt(v, s.tiles, l)).join('')}</select></label>
    <label>GitHub user (activity + repos)<input data-site="ghUser" value="${esc(s.ghUser)}"></label>
    <label class="row"><input type="checkbox" data-site="showFavorites" ${s.showFavorites ? 'checked' : ''}> Show a Favorites row on the home page</label>
  </div>`
}

// ---- Projects (what is on the site / favorite)
const kindChips = (l: Rec) => Object.entries(reg.kinds).filter(([k]) => k !== 'favorite').map(([k, t]) => `<button class="chip ${((fm(l).kinds as string[]) ?? []).includes(k) ? 'on' : ''}" data-act="kind" data-id="${l.id}" data-k="${k}">${esc(t)}</button>`).join('')
function projects() {
  const on = live().filter(l => fm(l).onSite).length
  return `<div class="line"><input id="flt" placeholder="Search logs" value="${esc(S.filter)}" style="max-width:280px"><span class="count">${on} of ${live().length} shown on the site</span></div><div class="card" id="plist" style="margin-top:12px">${plist()}</div>`
}
const matches = (l: Rec) => !S.filter || (title(l) + ' ' + l.id).toLowerCase().includes(S.filter.toLowerCase())
function plist() {
  return live().filter(matches).map(l => {
    const d = fm(l), kinds = (d.kinds as string[]) ?? []
    return `<div class="row-i"><div class="t"><b>${esc(title(l))}</b><small>${esc(d.date)} · <a href="#" data-act="edit" data-id="${l.id}">Edit</a></small></div><div class="chips">${kindChips(l)}</div><label class="row"><input type="checkbox" data-log="onSite" data-id="${l.id}" ${d.onSite ? 'checked' : ''}> On site</label><label class="row"><input type="checkbox" data-log="fav" data-id="${l.id}" ${kinds.includes('favorite') ? 'checked' : ''}> Favorite</label></div>`
  }).join('') || '<p class="mute">No logs match.</p>'
}

// ---- Logs
function logs(): string {
  if (S.edit) return editor(S.edit)
  return `<div class="line"><input id="flt" placeholder="Search logs" value="${esc(S.filter)}" style="max-width:280px"><span class="sp"></span><button class="btn" data-act="repos">From a GitHub repo</button><button class="btn solid" data-act="new">New log</button></div><div id="repos"></div><div class="card" id="llist" style="margin-top:12px">${llist()}</div>`
}
const llist = () => live().filter(matches).map(l => `<div class="row-i"><div class="t"><b>${esc(title(l))}</b><small>${esc(fm(l).date)}${l.isNew ? ' · new' : l.raw !== l.orig ? ' · changed' : ''}</small></div><button class="btn" data-act="edit" data-id="${l.id}">Edit</button></div>`).join('') || '<p class="mute">No logs match.</p>'

function editor(id: string): string {
  const l = S.logs.find(x => x.id === id)
  if (!l) return ((S.edit = ''), logs())
  const { data: d, body } = parse(l.raw), kinds = (d.kinds as string[]) ?? [], listed = S.shop.listings.some(x => x.slug === id)
  const inp = (k: string, label: string, type = 'text') => `<label>${label}<input type="${type}" data-ef="${k}" value="${esc(d[k])}"></label>`
  return `<div class="line"><button class="btn" data-act="back">← All logs</button><span class="sp"></span><a class="btn" href="/logs/projects/${id}" target="_blank" rel="noopener">View</a><button class="btn danger" data-act="del" data-id="${id}">Delete</button></div>
  <div class="card grid" style="margin-top:12px">${inp('title', 'Title')}${inp('cardTitle', 'Short title on cards (optional)')}${inp('date', 'Date', 'date')}${inp('tags', 'Tags, comma separated')}${inp('repo', 'GitHub repo URL (software)')}${inp('lang', 'Main language (software)')}${inp('defaultPic', 'Opens on picture number', 'number')}${inp('imagePosition', 'Crop focus, e.g. 50% 0')}</div>
  <div class="card"><label>Description<textarea data-ef="description">${esc(d.description)}</textarea></label>
    <p class="mute" style="margin:12px 0 6px;font-size:12px">Kinds</p><div class="chips">${kindChips(l)}<button class="chip ${kinds.includes('favorite') ? 'on' : ''}" data-act="kind" data-id="${id}" data-k="favorite">Favorite</button></div>
    <div class="line" style="margin-top:12px"><label class="row"><input type="checkbox" data-ef="onSite" ${d.onSite ? 'checked' : ''}> Show on the site as a project</label><label class="row"><input type="checkbox" data-sell="${id}" ${listed ? 'checked' : ''}> For sale in the shop</label></div></div>
  <div class="card"><div class="line"><span>Cover: <code>${esc(d.image ?? 'none')}</code></span><span class="sp"></span><label class="btn" style="cursor:pointer">Upload cover<input type="file" accept="image/*" data-up="cover" hidden></label><label class="btn" style="cursor:pointer">Add gallery picture<input type="file" accept="image/*" data-up="gallery" hidden></label></div></div>
  <label><span>Text (markdown). Pictures written as <code>![](url)</code> go to the gallery.</span><textarea class="body" data-ef="body">${esc(body)}</textarea></label>`
}

// ---- Shop
function shop() {
  const have = new Set(S.shop.listings.map(x => x.slug)), addable = live().filter(l => fm(l).image && !have.has(l.id))
  return `<div class="line"><span class="count">Every listing is a log. Not every log is sold.</span><span class="sp"></span><select id="addsel"><option value="">Add a log to the shop…</option>${addable.map(l => `<option value="${l.id}">${esc(title(l))}</option>`).join('')}</select><button class="btn" data-act="addlisting">Add</button></div>
  <div class="card" style="margin-top:12px">${S.shop.listings.map((x, i) => { const l = S.logs.find(r => r.id === x.slug); return `<div class="row-i"><div class="t"><b>${esc(l ? title(l) : x.slug)}</b><small>${esc(x.slug)}</small></div><label>Price (${esc(S.shop.currency)})<input type="number" min="0" data-ls="${i}:price" value="${x.price}"></label><label>Stock<input type="number" min="0" data-ls="${i}:stock" value="${x.stock}"></label><label>Sizes, comma separated<input data-ls="${i}:sizes" value="${esc(x.sizes.join(', '))}"></label><label>Badge<input data-ls="${i}:badge" value="${esc(x.badge)}" style="width:110px"></label><label class="row"><input type="checkbox" data-ls="${i}:active" ${x.active ? 'checked' : ''}> Active</label><button class="btn danger" data-act="rmlisting" data-i="${i}">Remove</button></div>` }).join('') || '<p class="mute">Nothing for sale yet.</p>'}</div>
  <p class="mute">Checkout needs a Stripe key (STRIPE_SECRET_KEY). Until then the Buy button says checkout is not set up.</p>`
}

// ---- Wild sections
function wild() {
  const pics = live().filter(l => fm(l).image && fm(l).onSite)
  return `<p class="count">Loud sections you can drop between the calm ones. Each slot holds one.</p>` + Object.entries(reg.slots).map(([slot, label]) => {
    const p = S.site.placements[slot], def = p ? reg.wild[p.kind] : null
    const fields = def ? def.fields.map(f => {
      if (f.type === 'select') return `<label>${esc(f.label)}<select data-wf="${slot}:${f.key}">${f.options!.map(o => opt(o, String(p![f.key] ?? f.options![0]))).join('')}</select></label>`
      if (f.type === 'logs') { const cur = (p![f.key] as string[]) ?? []; return `<div><p class="mute" style="margin:0 0 4px;font-size:12px">${esc(f.label)}</p><div class="checks">${pics.map(l => `<label><input type="checkbox" data-wa="${slot}:${f.key}:${l.id}" ${cur.includes(l.id) ? 'checked' : ''}> ${esc(title(l))}</label>`).join('')}</div></div>` }
      return `<label>${esc(f.label)}<input data-wf="${slot}:${f.key}" value="${esc(p![f.key])}"></label>`
    }).join('') : ''
    return `<h2>${esc(label)}</h2><div class="card"><label>Section<select data-wk="${slot}"><option value="">None (calm)</option>${Object.entries(reg.wild).map(([k, v]) => opt(k, p?.kind ?? '', v.label)).join('')}</select></label>${fields ? `<div class="grid" style="margin-top:12px">${fields}</div>` : ''}</div>`
  }).join('')
}

// ---- pictures: resized in the browser so uploads stay small
async function shrink(file: File, max = 2000): Promise<string> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.86).split(',')[1]
}

// ---- events
const panel = $('panel')
document.addEventListener('click', e => { void click(e) })
async function click(e: Event) {
  const el = e.target as HTMLElement
  const tab = el.closest<HTMLElement>('[data-tab]')
  if (tab) { S.tab = tab.dataset.tab!; S.edit = ''; tabs(); return render() }
  if (el.closest('[data-out]')) { await api('logout', {}); location.reload(); return }
  const a = el.closest<HTMLElement>('[data-act]')
  if (!a) return
  e.preventDefault()
  const id = a.dataset.id!, i = Number(a.dataset.i)
  const l = S.logs.find(x => x.id === id)
  switch (a.dataset.act) {
    case 'up': case 'down': { const j = i + (a.dataset.act === 'up' ? -1 : 1), s = S.site.sections; [s[i], s[j]] = [s[j], s[i]]; return render() }
    case 'kind': {
      if (!l) return
      const cur = (fm(l).kinds as string[]) ?? [], k = a.dataset.k!
      setFm(l, { kinds: cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k] })
      return S.tab === 'logs' ? render() : ((($('plist').innerHTML = plist()), refreshBar()), void 0)
    }
    case 'edit': S.tab = 'logs'; S.edit = id; tabs(); render(); return scrollTo(0, 0)
    case 'back': S.edit = ''; return render()
    case 'new': {
      const t = prompt('Title of the new log?')
      if (!t) return
      const n = uniq(slug(t)), raw = create({ title: t, date: today(), description: '', tags: ['Projects'], kinds: [], onSite: false }, '')
      S.logs.unshift({ id: n, raw, orig: '', isNew: true }); S.edit = n; return render()
    }
    case 'del': {
      if (!l || !confirm(`Delete "${title(l)}"? It is removed from the site when you publish.`)) return
      l.deleted = true; S.shop.listings = S.shop.listings.filter(x => x.slug !== id); S.edit = ''; return render()
    }
    case 'repos': {
      const box = $('repos')
      box.innerHTML = '<p class="mute">Loading your repos…</p>'
      if (!S.repos) { const r = await api<{ repos: NonNullable<typeof S.repos> }>('repos'); if (r.error) return void (box.innerHTML = `<p class="mute">${esc(r.error)}</p>`); S.repos = r.repos }
      const have = new Set(live().map(x => fm(x).repo))
      box.innerHTML = `<div class="card" style="margin-top:12px"><p class="count">Pick a repo to turn into a log. It becomes a project once you switch it on.</p>${S.repos.filter(r => !r.fork).map((r, k) => `<div class="row-i"><div class="t"><b>${esc(r.name)}</b><small>${esc(r.language || 'n/a')} · ${r.created} ${esc(r.description)}</small></div>${have.has(r.url) ? '<span class="count">already a log</span>' : `<button class="btn" data-act="mkrepo" data-i="${k}">Make log</button>`}</div>`).join('')}</div>`
      return
    }
    case 'mkrepo': {
      const r = S.repos!.filter(x => !x.fork)[i], n = uniq(slug(r.name))
      const t = r.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const raw = create({ title: t, date: r.created, description: r.description, tags: ['Projects', 'Software'], kinds: ['software'], onSite: false, repo: r.url, lang: r.language }, `${r.description}\n\n[View on GitHub](${r.url})\n`)
      S.logs.unshift({ id: n, raw, orig: '', isNew: true }); S.edit = n; return render()
    }
    case 'addlisting': {
      const v = ($('addsel') as HTMLSelectElement).value
      if (!v) return
      S.shop.listings.push({ slug: v, price: 40, stock: 5, sizes: ['8×10 in', '11×14 in', '16×20 in'], badge: '', active: true }); return render()
    }
    case 'rmlisting': S.shop.listings.splice(i, 1); return render()
  }
}

panel.addEventListener('input', e => {
  const el = e.target as HTMLInputElement
  if (el.id === 'flt') { S.filter = el.value; const t = $(S.tab === 'logs' ? 'llist' : 'plist'); t.innerHTML = S.tab === 'logs' ? llist() : plist(); return }
  const l = S.logs.find(x => x.id === S.edit)
  const k = el.dataset.ef
  if (k && l) {
    if (k === 'body') l.raw = withBody(l.raw, el.value)
    else if (k === 'onSite') setFm(l, { onSite: el.checked })
    else if (k === 'tags') setFm(l, { tags: el.value.split(',').map(s => s.trim()).filter(Boolean) })
    else if (k === 'defaultPic') setFm(l, { defaultPic: el.value ? Number(el.value) : undefined })
    else setFm(l, { [k]: el.value })
    refreshBar()
  }
})

panel.addEventListener('change', async e => {
  const el = e.target as HTMLInputElement
  const d = el.dataset, s = S.site
  if (d.site) { (s as unknown as Record<string, unknown>)[d.site] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value }
  else if (d.sec) s.sections[Number(d.sec)].enabled = el.checked
  else if (d.log) {
    const l = S.logs.find(x => x.id === d.id)!
    if (d.log === 'onSite') setFm(l, { onSite: el.checked })
    else { const cur = (fm(l).kinds as string[]) ?? []; setFm(l, { kinds: el.checked ? [...new Set([...cur, 'favorite'])] : cur.filter(x => x !== 'favorite') }) }
    $('plist').innerHTML = plist()
  } else if (d.sell) {
    const have = S.shop.listings.find(x => x.slug === d.sell)
    if (el.checked && !have) S.shop.listings.push({ slug: d.sell, price: 40, stock: 5, sizes: ['8×10 in', '11×14 in', '16×20 in'], badge: '', active: true })
    if (!el.checked) S.shop.listings = S.shop.listings.filter(x => x.slug !== d.sell)
  } else if (d.ls) {
    const [i, key] = d.ls.split(':'), row = S.shop.listings[Number(i)] as unknown as Record<string, unknown>
    row[key] = key === 'active' ? el.checked : key === 'price' || key === 'stock' ? Number(el.value) : key === 'sizes' ? el.value.split(',').map(x => x.trim()).filter(Boolean) : el.value
  } else if (d.wk !== undefined) {
    if (!el.value) delete s.placements[d.wk]
    else s.placements[d.wk] = { kind: el.value }
    return render()
  } else if (d.wf) { const [slot, key] = d.wf.split(':'); s.placements[slot][key] = el.value }
  else if (d.wa) { const [slot, key, id] = d.wa.split(':'), cur = new Set((s.placements[slot][key] as string[]) ?? []); el.checked ? cur.add(id) : cur.delete(id); s.placements[slot][key] = [...cur] }
  else if (d.up && el.files?.[0]) {
    const l = S.logs.find(x => x.id === S.edit)!
    say('Resizing picture…')
    try {
      const b64 = await shrink(el.files[0]), tag = Date.now().toString(36).slice(-4)
      if (d.up === 'cover') { const p = `src/assets/art/${l.id}-${tag}.jpg`; S.uploads.set(p, b64); setFm(l, { image: `../../assets/art/${l.id}-${tag}.jpg` }) }
      else { const p = `public/img/logs/${l.id}-${tag}.jpg`; S.uploads.set(p, b64); l.raw = l.raw.replace(/\s*$/, '') + `\n\n![](/img/logs/${l.id}-${tag}.jpg)\n` }
      say('Picture added. It goes live when you publish.')
    } catch { say('Could not read that picture.', true) }
    return render()
  }
  refreshBar()
})

$('discard').addEventListener('click', () => {
  if (!confirm('Throw away all unpublished changes?')) return
  S.site = JSON.parse(S.siteOrig); S.shop = JSON.parse(S.shopOrig)
  S.logs = S.logs.filter(l => !l.isNew).map(l => ({ ...l, raw: l.orig, deleted: false }))
  S.uploads.clear(); S.edit = ''; render(); say('Changes discarded.')
})

$('publish').addEventListener('click', async () => {
  const files = changes()
  if (files.reduce((n, f) => n + (f.base64?.length ?? 0) + (f.content?.length ?? 0), 0) > 4_000_000) return say('Too much at once (4 MB limit). Publish the pictures in smaller batches.', true)
  const btn = $('publish') as HTMLButtonElement
  btn.disabled = true; say('Saving…')
  const r = await api<{ mode: string; commit?: string }>('save', { files, message: `Control plane: ${files.length} file${files.length === 1 ? '' : 's'} changed` })
  btn.disabled = false
  if (r.error) return say(r.error, true)
  S.siteOrig = jsonOf(S.site); S.shopOrig = jsonOf(S.shop)
  S.logs = S.logs.filter(l => !l.deleted).map(l => ({ ...l, orig: l.raw, isNew: false }))
  S.uploads.clear(); render()
  say(r.mode === 'github' ? 'Published. Vercel is rebuilding; the site updates in about a minute.' : 'Saved to the files on this computer.')
})

void start()
