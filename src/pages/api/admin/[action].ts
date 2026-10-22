import type { APIRoute } from 'astro'
import { COOKIE, allowed, config, isAuthed, isConfigured, isOpen, listLogs, makeSession, mode, passwordOk, readText, throttled, writeFiles, type FileChange } from '../../../lib/admin'

// Control plane API (serverless on Vercel). Everything except `session` and `login` needs the signed login cookie.
export const prerender = false

const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

export const ALL: APIRoute = async ({ params, request, cookies, clientAddress }) => {
  const action = params.action
  const post = request.method === 'POST'
  const authed = isAuthed(cookies.get(COOKIE)?.value)

  if (action === 'session') return json({ authed, configured: isConfigured(), open: isOpen(), mode: mode() })

  if (action === 'login' && post) {
    if (!isConfigured()) return json({ error: 'No admin password is set (ADMIN_PASSWORD).' }, 503)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'x'
    if (throttled(ip)) return json({ error: 'Too many tries. Wait ten minutes.' }, 429)
    const { password = '' } = (await request.json().catch(() => ({}))) as { password?: string }
    if (!passwordOk(String(password))) { throttled(ip, true); await new Promise(r => setTimeout(r, 500)); return json({ error: 'Wrong password.' }, 401) }
    throttled(ip)
    cookies.set(COOKIE, makeSession(), { httpOnly: true, sameSite: 'strict', secure: !import.meta.env.DEV, path: '/', maxAge: 7 * 86400 })
    return json({ ok: true })
  }
  if (action === 'logout' && post) { cookies.delete(COOKIE, { path: '/' }); return json({ ok: true }) }

  if (!authed) return json({ error: 'Log in first.' }, 401)

  try {
    if (action === 'data') {
      const [site, shop, names] = await Promise.all([readText('src/data/site.json'), readText('src/data/shop.json'), listLogs()])
      const logs = (await Promise.all(names.map(async n => ({ id: n.replace(/\.md$/, ''), raw: (await readText(`src/content/logs/${n}`)) ?? '' })))).filter(l => l.raw)
      return json({ site: JSON.parse(site ?? '{}'), shop: JSON.parse(shop ?? '{}'), logs })
    }
    if (action === 'repos') {
      const site = JSON.parse((await readText('src/data/site.json')) ?? '{}') as { ghUser?: string }
      const r = await fetch(`https://api.github.com/users/${site.ghUser ?? 'tejvirmann'}/repos?per_page=100&sort=pushed&type=owner`, { headers: { 'user-agent': 'tejvirmann-control-plane', ...(config.token() ? { authorization: `Bearer ${config.token()}` } : {}) } })
      if (!r.ok) return json({ error: `GitHub said ${r.status}.` }, 502)
      const rows = (await r.json()) as { name: string; description: string | null; language: string | null; html_url: string; created_at: string; stargazers_count: number; fork: boolean; archived: boolean }[]
      return json({ repos: rows.map(x => ({ name: x.name, description: x.description ?? '', language: x.language ?? '', url: x.html_url, created: x.created_at.slice(0, 10), stars: x.stargazers_count, fork: x.fork, archived: x.archived })) })
    }
    if (action === 'save' && post) {
      const { files = [], message = 'Update site from the control plane' } = (await request.json()) as { files?: FileChange[]; message?: string }
      if (!files.length) return json({ error: 'Nothing to save.' }, 400)
      for (const f of files) {
        if (!allowed(f.path)) return json({ error: `Not allowed: ${f.path}` }, 400)
        if (/\.json$/.test(f.path)) JSON.parse(f.content ?? '')
        if (/\.md$/.test(f.path) && !f.delete && !(f.content ?? '').startsWith('---')) return json({ error: `${f.path} lost its header.` }, 400)
      }
      const res = await writeFiles(files, String(message).slice(0, 200))
      return json({ ok: true, mode: mode(), ...res })
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Something went wrong.' }, 500)
  }
  return json({ error: 'Not found.' }, 404)
}
