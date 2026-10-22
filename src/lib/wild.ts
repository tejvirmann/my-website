/** Loud sections. The home page places them in slots (see "placements" in src/data/site.json); the control plane builds its forms from this list. */
export type Field = { key: string; label: string; type: 'text' | 'logs' | 'select'; options?: string[] }

export const WILD = {
  collage: { label: 'Dense collage', fields: [{ key: 'art', label: 'Pictures (none picked = all on the site)', type: 'logs' }] },
  marquee: { label: 'Marquee bands', fields: [{ key: 'text', label: 'Top line', type: 'text' }, { key: 'text2', label: 'Bottom line', type: 'text' }] },
  vine: { label: 'Growing vine', fields: [] },
  ink: { label: 'Suminagashi ink', fields: [{ key: 'palette', label: 'Palette', type: 'select', options: ['sumi', 'indigo', 'rose', 'moss'] }] },
  math: { label: 'Math curves', fields: [{ key: 'curve', label: 'Curve', type: 'select', options: ['lissajous', 'rose', 'spiro'] }] },
  desktop: { label: 'Retro desktop', fields: [{ key: 'title', label: 'Window title', type: 'text' }] },
  terminal: { label: 'Terminal', fields: [] },
} satisfies Record<string, { label: string; fields: Field[] }>

export type WildKind = keyof typeof WILD
export const WILD_KINDS = Object.keys(WILD) as WildKind[]
export const SLOTS = { 'after-hero': 'After the hero', 'after-activity': 'After the GitHub activity', 'after-latest': 'After Latest', 'after-projects': 'After Projects' } as const
export type Placement = { kind: WildKind; art?: string[]; text?: string; text2?: string; palette?: string; curve?: string; title?: string }
