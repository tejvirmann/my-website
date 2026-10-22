import site from '../data/site.json'
import shop from '../data/shop.json'

export const settings = site
export type Listing = (typeof shop.listings)[number]
export const shopCurrency = shop.currency
export const listings = (): Listing[] => shop.listings.filter(l => l.active)
export const listingFor = (slug: string): Listing | undefined => listings().find(l => l.slug === slug)
