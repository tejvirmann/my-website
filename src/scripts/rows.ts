// Capped justified rows: each row aims for a target height and fills the width exactly, no piece grows past
// `max`, and the last row is not stretched. Used by the home projects section and the projects page.
import type { Item } from '../lib/logs'

export type Tile = Item & { ar: number }

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
export const LANG_COLORS: Record<string, string> = { TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f1e05a', Shell: '#89e051', HTML: '#e34c26', Java: '#b07219', C: '#555555' }

/** software logs have no picture: width/height ratio depends on the screen */
export const withRatio = (items: Item[]): Tile[] => items.map(i => ({ ...i, ar: i.ar ?? (innerWidth < 600 ? 2.1 : 1.45) }))

export function justifyRows(host: HTMLElement, items: Tile[], opts: { gap?: number; target?: number; max?: number } = {}) {
  const width = host.clientWidth
  if (!width) return
  const gap = opts.gap ?? (innerWidth < 600 ? 4 : 6)
  const target = opts.target ?? Math.max(96, Math.min(190, width / 6))
  const max = opts.max ?? target * 1.3
  const rows: { row: Tile[]; h: number }[] = []
  let i = 0
  while (i < items.length) {
    let sum = 0, best = 1, bestDiff = Infinity
    for (let n = 1; i + n <= items.length; n++) {
      sum += items[i + n - 1].ar
      const h = (width - gap * (n - 1)) / sum
      const d = Math.abs(h - target)
      if (d < bestDiff) { bestDiff = d; best = n }
      if (h < target * 0.8) break
    }
    const row = items.slice(i, i + best)
    let h = (width - gap * (row.length - 1)) / row.reduce((a, b) => a + b.ar, 0)
    if (h > max || (i + best >= items.length && h > target * 1.05)) h = Math.min(h, target)
    rows.push({ row, h })
    i += best
  }
  host.innerHTML = rows
    .map(({ row, h }) => `<div class="jr" style="height:${h.toFixed(1)}px;gap:${gap}px">${row.map(it => tileHTML(it, Math.round(it.ar * h), h)).join('')}</div>`)
    .join('')
}

/** re-run `draw` when the container's width changes */
export function watch(host: HTMLElement, draw: () => void) {
  let t: number
  let last = host.clientWidth
  new ResizeObserver(() => {
    clearTimeout(t)
    t = window.setTimeout(() => { if (Math.abs(host.clientWidth - last) > 1) { last = host.clientWidth; draw() } }, 80)
  }).observe(host)
  draw()
}

function hash(str: string) {
  let h = 2166136261
  for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}
/** deterministic "truchet" pattern, so each software tile gets its own picture in its language color */
function truchet(seed: string, color: string, cols = 8, rows = 6) {
  let s = hash(seed)
  const r = () => { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const t = 40
  let d = ''
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const X = x * t, Y = y * t, h = t / 2
    d += r() < 0.5
      ? `M${X},${Y + h}A${h},${h} 0 0 1 ${X + h},${Y}M${X + h},${Y + t}A${h},${h} 0 0 1 ${X + t},${Y + h}`
      : `M${X + h},${Y}A${h},${h} 0 0 1 ${X + t},${Y + h}M${X},${Y + h}A${h},${h} 0 0 0 ${X + h},${Y + t}`
  }
  return `<svg viewBox="0 0 ${cols * t} ${rows * t}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>`
}

export function tileHTML(it: Tile, w: number, h: number, tiles: 'gen' | 'type' = (document.documentElement.dataset.tiles as 'gen' | 'type') || 'gen') {
  if (it.type === 'art') {
    return `<a class="t" href="${it.url}" style="width:${w}px;height:${h}px;--col:${it.col}"><img src="${it.thumb}" srcset="${it.thumb} 480w, ${it.large} 1400w" sizes="${w}px" width="${it.w}" height="${it.h}" alt="${esc(it.title)}" loading="lazy" decoding="async"${it.pos ? ` style="object-position:${it.pos}"` : ''}><span class="ov"><b>${esc(it.title)}</b>${it.year}</span></a>`
  }
  const col = LANG_COLORS[it.lang ?? ''] ?? '#8a8a8a'
  return `<a class="tile ${tiles}" href="${it.url}" style="--k:${col};width:${w}px;height:${h}px">${tiles === 'gen' ? truchet(it.id, col) : ''}<span class="tb"><b>${esc(it.title)}</b><span class="td">${esc(it.desc)}</span><span class="tm"><i class="dot" style="--c:${col}"></i>${esc(it.lang ?? 'Code')} · ${it.year}</span></span></a>`
}
