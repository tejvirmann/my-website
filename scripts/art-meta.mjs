// Writes src/data/art-meta.json: a dominant color per image in src/assets/art, used as the placeholder
// while an image loads. Runs before dev and build; only new or changed files are processed.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = 'src/assets/art'
const out = 'src/data/art-meta.json'
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {}
const next = {}
for (const f of fs.readdirSync(dir)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue
  const base = f.replace(/\.[^.]+$/, '')
  const mtime = fs.statSync(path.join(dir, f)).mtimeMs
  if (prev[base]?.mtime === mtime) { next[base] = prev[base]; continue }
  const { dominant } = await sharp(path.join(dir, f)).resize(32).stats()
  next[base] = { col: '#' + [dominant.r, dominant.g, dominant.b].map(v => v.toString(16).padStart(2, '0')).join(''), mtime }
}
fs.writeFileSync(out, JSON.stringify(next, null, 1) + '\n')
console.log(`art-meta: ${Object.keys(next).length} images`)
