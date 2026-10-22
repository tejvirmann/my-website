// Fuzzy search: every word must match something. Typos, partial words, short forms and word order are fine.
// Fields are weighted: title > kind/year/language > description > tags and log text.
const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ')

function subseq(t: string, w: string) {
  let i = 0
  for (const c of w) { if (c === t[i]) i++; if (i === t.length) return w[0] === t[0] }
  return false
}
function lev(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let p = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const c = [i]
    let m = i
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      c[j] = v
      if (v < m) m = v
    }
    if (m > max) return max + 1
    p = c
  }
  return p[b.length]
}

export type Doc = { title: string; meta: string; desc: string; extra: string }
type Prepared = [string, number][]
const cache = new WeakMap<Doc, Prepared>()
const fields = (d: Doc): Prepared => {
  let f = cache.get(d)
  if (!f) cache.set(d, (f = [[norm(d.title), 6], [norm(d.meta), 4], [norm(d.desc), 2], [norm(d.extra), 1]]))
  return f
}

function tokenScore(tok: string, d: Doc) {
  let best = 0
  for (const [txt, w] of fields(d)) {
    if (!txt) continue
    if (txt.includes(tok)) { best = Math.max(best, w * (txt.split(' ').includes(tok) ? 3 : 2)); continue }
    for (const wd of txt.split(' ')) {
      if (!wd) continue
      if (wd.startsWith(tok)) { best = Math.max(best, w * 2); continue }
      if (tok.length >= 3 && tok.length <= 5 && wd.length <= tok.length + 3 && subseq(tok, wd)) { best = Math.max(best, w * 1.1); continue }
      const tol = tok.length >= 7 ? 2 : 1
      if (tok.length >= 4 && lev(tok, wd.slice(0, tok.length + 1), tol) <= tol) best = Math.max(best, w * 1.4)
    }
  }
  return best
}

/** 0 = no match; higher is better */
export function score(d: Doc, q: string) {
  const toks = norm(q).split(' ').filter(Boolean)
  if (!toks.length) return 1
  let total = 0
  for (const t of toks) {
    const s = tokenScore(t, d)
    if (!s) return 0
    total += s
  }
  return total
}
