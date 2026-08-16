import type { MetadataRoute } from 'next'
import { serverClient } from '@/lib/sanity.server'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://brakbrussels.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products: { slug: string; updatedAt: string }[] = await serverClient.fetch(
    `*[_type == "product" && !(_id in path("drafts.**"))]{ "slug": slug.current, "updatedAt": _updatedAt }`,
    {},
    { next: { revalidate: 3600 } }
  )

  const productUrls: MetadataRoute.Sitemap = products.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: updatedAt,
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
