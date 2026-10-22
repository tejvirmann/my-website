// Server side of the control plane (used only by src/pages/api/admin/*). Login is checked here, never in the browser.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const env = (k: string): string => (process.env[k] ?? (import.meta.env as Record<string, string | undefined>)[k] ?? '').trim()

export const config = {
  password: () => env('ADMIN_PASSWORD'),
  secret: () => env('ADMIN_SECRET') || env('ADMIN_PASSWORD'),
  token: () => env('GITHUB_TOKEN'),
  repo: () => env('GITHUB_REPO'),
  branch: () => env('GITHUB_BRANCH') || 'main',
}
/** github = Publish commits to the repo (Vercel rebuilds); local = writes the files on this computer (npm run dev) */
export const mode = (): 'github' | 'local' => (config.token() && config.repo() ? 'github' : 'local')
/** on your own computer with no password set, the control plane is open (it only listens on localhost) */
export const isOpen = () => import.meta.env.DEV && !config.password()
export const isConfigured = () => isOpen() || !!config.password()

const sha = (s: string) => createHash('sha256').update(s).digest()
const sign = (v: string) => createHmac('sha256', config.secret()).update(v).digest('hex')

export const COOKIE = 'tm_admin'
export function makeSession(): string {
  const exp = String(Date.now() + 7 * 864e5)
  return `${exp}.${sign(exp)}`
}
export function isAuthed(cookie: string | undefined): boolean {
  if (isOpen()) return true
  if (!config.password() || !cookie) return false
  const [exp, mac] = cookie.split('.')
  if (!exp || !mac || Number(exp) < Date.now()) return false
  const want = Buffer.from(sign(exp)), got = Buffer.from(mac)
  return want.length === got.length && timingSafeEqual(want, got)
}
export const passwordOk = (given: string) => !!config.password() && timingSafeEqual(sha(given), sha(config.password()))

// slow down guessing: 8 wrong tries per 10 minutes per address (per server instance)
const tries = new Map<string, { n: number; t: number }>()
export function throttled(ip: string, failed?: boolean): boolean {
  const now = Date.now(), e = tries.get(ip)
  if (!e || now - e.t > 6e5) { if (failed) tries.set(ip, { n: 1, t: now }); else tries.delete(ip); return false }
  if (failed) e.n++
  return e.n >= 8
}

// what the control plane may touch
const OK = [/^src\/data\/(site|shop)\.json$/, /^src\/content\/logs\/[a-z0-9][a-z0-9-]*\.md$/, /^src\/assets\/art\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/, /^public\/img\/logs\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/]
export const allowed = (p: string) => OK.some(r => r.test(p))

export type FileChange = { path: string; content?: string; base64?: string; delete?: boolean }

const gh = (p: string, init: RequestInit = {}) =>
  fetch(`https://api.github.com/repos/${config.repo()}${p}`, {
    ...init,
    headers: { authorization: `Bearer ${config.token()}`, accept: 'application/vnd.github+json', 'user-agent': 'tejvirmann-control-plane', 'x-github-api-version': '2022-11-28', ...(init.headers ?? {}) },
  })
async function ghJson<T>(p: string, init?: RequestInit): Promise<T> {
  const r = await gh(p, init)
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json() as Promise<T>
}

export async function readText(p: string): Promise<string | null> {
  if (mode() === 'local') return fs.readFile(path.join(process.cwd(), p), 'utf8').catch(() => null)
  const r = await gh(`/contents/${p}?ref=${config.branch()}`, { headers: { accept: 'application/vnd.github.raw+json' } })
  return r.ok ? r.text() : null
}

export async function listLogs(): Promise<string[]> {
  if (mode() === 'local') return (await fs.readdir(path.join(process.cwd(), 'src/content/logs'))).filter(f => f.endsWith('.md'))
  const rows = await ghJson<{ name: string }[]>(`/contents/src/content/logs?ref=${config.branch()}`)
  return rows.map(r => r.name).filter(n => n.endsWith('.md'))
}

export async function writeFiles(files: FileChange[], message: string): Promise<{ commit?: string }> {
  if (mode() === 'local') {
    for (const f of files) {
      const abs = path.join(process.cwd(), f.path)
      if (f.delete) await fs.rm(abs, { force: true })
      else { await fs.mkdir(path.dirname(abs), { recursive: true }); await fs.writeFile(abs, f.base64 ? Buffer.from(f.base64, 'base64') : (f.content ?? '')) }
    }
    return {}
  }
  const b = config.branch()
  const ref = await ghJson<{ object: { sha: string } }>(`/git/ref/heads/${b}`)
  const head = await ghJson<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`)
  const tree = await Promise.all(
    files.map(async f => {
      if (f.delete) return { path: f.path, mode: '100644', type: 'blob', sha: null }
      const blob = await ghJson<{ sha: string }>('/git/blobs', { method: 'POST', body: JSON.stringify(f.base64 ? { content: f.base64, encoding: 'base64' } : { content: f.content ?? '', encoding: 'utf-8' }) })
      return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha }
    })
  )
  const t = await ghJson<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) })
  const c = await ghJson<{ sha: string }>('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: [ref.object.sha] }) })
  await ghJson(`/git/refs/heads/${b}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) })
  return { commit: c.sha }
}
