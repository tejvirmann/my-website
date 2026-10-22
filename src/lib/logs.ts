import { getCollection, type CollectionEntry } from 'astro:content'
import { getImage } from 'astro:assets'
import meta from '../data/art-meta.json'
import { KINDS, type KindId } from './kinds'

export type Log = CollectionEntry<'logs'>

export const logUrl = (l: Log | string) => `/logs/projects/${typeof l === 'string' ? l : l.id}`
export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
export const iso = (d: Date) => d.toISOString().slice(0, 10)

/** every log, newest first */
export async function allLogs(): Promise<Log[]> {
  return (await getCollection('logs')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** what the grids need to draw one project (art tile or software tile), all resolved at build time */
export type Item = {
  id: string
  url: string
  title: string
  desc: string
  date: string
  year: string
  kinds: KindId[]
  type: 'art' | 'sw'
  fav: boolean
  /** art */
  ar?: number
  col?: string
  w?: number
  h?: number
  thumb?: string
  large?: string
  pos?: string
  /** software */
  lang?: string
}

const colorOf = (src: string) => (meta as Record<string, { col: string }>)[src.split('/').pop()!.split('.')[0]]?.col ?? '#8883'

export async function toItem(l: Log): Promise<Item> {
  const d = l.data
  const base = {
    id: l.id,
    url: logUrl(l),
    title: d.cardTitle ?? d.title,
    desc: d.description,
    date: iso(d.date),
    year: String(d.date.getUTCFullYear()),
    kinds: d.kinds,
    fav: d.kinds.includes('favorite'),
  }
  if (d.image) {
    const [thumb, large] = await Promise.all([
      getImage({ src: d.image, width: 480, format: 'webp', quality: 72 }),
      getImage({ src: d.image, width: 1400, format: 'webp', quality: 78 }),
    ])
    return { ...base, type: 'art', ar: +(d.image.width / d.image.height).toFixed(4), w: d.image.width, h: d.image.height, col: colorOf(d.image.src), thumb: thumb.src, large: large.src, pos: d.imagePosition }
  }
  return { ...base, type: 'sw', lang: d.lang ?? 'Other' }
}

/** projects = logs marked onSite, newest first */
export async function projectItems(): Promise<Item[]> {
  return Promise.all((await allLogs()).filter(l => l.data.onSite).map(toItem))
}

/** picture urls embedded in a log's markdown body (they stay hosted where they are) */
export function bodyImages(body: string | undefined): string[] {
  return [...(body ?? '').matchAll(/!\[[^\]]*\]\(((?:https?:\/\/|\/img\/logs\/)[^)\s]+)\)/g)].map(m => m[1])
}

export const kindLabel = (k: KindId) => KINDS[k].label
