import type { ImageLoader } from 'next/image'

/**
 * Custom Next.js image loader that uses Sanity's own CDN resize parameters.
 * This bypasses Vercel's image optimisation entirely, so images are served
 * directly from the Sanity CDN and don't count against Vercel's quota.
 *
 * Sanity CDN supports: ?w=<px>&auto=format&q=<0-100>
 */
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('q', String(quality ?? 75))
  return url.toString()
}
