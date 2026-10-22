export const KINDS = {
  favorite: { label: 'Favorite', color: '#ff8000' },
  film: { label: 'Film', color: '#ff0bcf' },
  writing: { label: 'Writing', color: '#e72961' },
  drawing: { label: 'Drawing', color: '#5ad66b' },
  uimodeling: { label: 'UI', color: '#1d9bf0' },
  painting: { label: 'Painting', color: '#446a8e' },
  research: { label: 'Research', color: '#0f9d9d' },
  software: { label: 'Software', color: '#7321ee' },
  other: { label: 'Other', color: '#987050' },
} as const

export type KindId = keyof typeof KINDS
export const KIND_IDS = Object.keys(KINDS) as [KindId, ...KindId[]]
/** kinds shown as filter chips (favorite is optional and handled separately) */
export const FILTER_KINDS: KindId[] = ['writing', 'drawing', 'painting', 'uimodeling', 'research', 'software']
