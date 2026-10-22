/** Reads and edits the flat frontmatter of a log. Lines it does not know are left exactly as they were. */
export type Val = string | number | boolean | string[]
export type Data = Record<string, Val>

const FM = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function split(raw: string): { head: string; body: string } {
  const m = FM.exec(raw)
  return m ? { head: m[1], body: raw.slice(m[0].length) } : { head: '', body: raw }
}

const unq = (s: string) => {
  s = s.trim()
  if (s.startsWith('"')) try { return JSON.parse(s) as string } catch { /* fall through */ }
  return s.replace(/^'(.*)'$/, '$1')
}

function parseVal(v: string): Val {
  v = v.trim()
  if (v.startsWith('[')) {
    const inner = v.slice(1, v.lastIndexOf(']'))
    return (inner.match(/"(?:[^"\\]|\\.)*"|[^,]+/g) ?? []).map(unq).filter(Boolean)
  }
  if (v === 'true' || v === 'false') return v === 'true'
  if (/^\d+$/.test(v)) return Number(v)
  return unq(v)
}

export function parse(raw: string): { data: Data; body: string } {
  const { head, body } = split(raw)
  const data: Data = {}
  for (const line of head.split('\n')) {
    const m = /^([A-Za-z][\w]*):\s*(.*)$/.exec(line)
    if (m) data[m[1]] = parseVal(m[2])
  }
  return { data, body }
}

const item = (s: string) => (/^[\w][\w .&-]*$/.test(s) ? s : JSON.stringify(s))
function ser(key: string, v: Val): string {
  if (Array.isArray(v)) return `[${v.map(item).join(', ')}]`
  if (typeof v === 'string') return key === 'date' ? v : JSON.stringify(v)
  return String(v)
}

/** set (or with undefined/''/[] remove) keys in the frontmatter, keeping everything else */
export function patch(raw: string, changes: Record<string, Val | undefined>): string {
  const { head, body } = split(raw)
  const lines = head ? head.split('\n') : []
  for (const [k, v] of Object.entries(changes)) {
    const empty = v === undefined || v === '' || (Array.isArray(v) && !v.length)
    const i = lines.findIndex(l => l.startsWith(k + ':'))
    if (empty) { if (i >= 0) lines.splice(i, 1) } else if (i >= 0) lines[i] = `${k}: ${ser(k, v)}`
    else lines.push(`${k}: ${ser(k, v)}`)
  }
  return `---\n${lines.join('\n')}\n---\n${body}`
}

export function create(data: Data, body: string): string {
  const order = ['title', 'date', 'description', 'tags', 'image', 'imagePosition', 'defaultPic', 'kinds', 'onSite', 'cardTitle', 'repo', 'lang']
  const lines = order.filter(k => data[k] !== undefined && data[k] !== '' && !(Array.isArray(data[k]) && !(data[k] as string[]).length)).map(k => `${k}: ${ser(k, data[k])}`)
  return `---\n${lines.join('\n')}\n---\n${body.replace(/^\n+/, '')}`
}

/** replace the text under the header */
export function withBody(raw: string, body: string): string {
  const m = FM.exec(raw)
  return (m ? m[0] : '') + body
}
