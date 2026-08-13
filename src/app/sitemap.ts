import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://brakbrussels.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs: { slug: string }[] = await client.fetch(
    `*[_type == "product"]{ "slug": slug.current }`,
    {},
    { next: { revalidate: 3600 } }
  )

  const productUrls: MetadataRoute.Sitemap = slugs.map(({ slug }) => ({
    url: `${BASE_URL}/products/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/contact`, priority: 0.5 },
    { url: `${BASE_URL}/shipping`, priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, priority: 0.3 },
    { url: `${BASE_URL}/legal`, priority: 0.2 },
    ...productUrls,
  ]
}
