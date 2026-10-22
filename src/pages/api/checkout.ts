import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEntry } from 'astro:content'
import { listingFor, shopCurrency } from '../../lib/site'

// Runs on Vercel as a serverless function (everything else is static). It needs STRIPE_SECRET_KEY in the Vercel
// environment. Price, size and stock are read from src/data/shop.json on the server, never from the browser.
export const prerender = false

const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export const POST: APIRoute = async ({ request, url }) => {
  const key = import.meta.env.STRIPE_SECRET_KEY
  if (!key) return json({ error: 'Checkout is not set up yet.' }, 503)
  const { slug, size } = (await request.json().catch(() => ({}))) as { slug?: string; size?: string }
  const listing = slug ? listingFor(slug) : undefined
  const log = slug ? await getEntry('logs', slug) : undefined
  if (!listing || !log) return json({ error: 'That item is not for sale.' }, 404)
  if (listing.stock <= 0) return json({ error: 'Sold out.' }, 409)
  if (!size || !listing.sizes.includes(size)) return json({ error: 'Choose a size.' }, 400)

  const stripe = new Stripe(key)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ quantity: 1, price_data: { currency: shopCurrency, unit_amount: Math.round(listing.price * 100), product_data: { name: `${log.data.title} (${size})` } } }],
    shipping_address_collection: { allowed_countries: ['US', 'CA'] },
    success_url: `${url.origin}/shop?thanks=1`,
    cancel_url: `${url.origin}/logs/projects/${slug}#buy`,
    metadata: { slug: slug!, size },
  })
  return json({ url: session.url })
}
