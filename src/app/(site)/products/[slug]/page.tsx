import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import { serverClient } from '@/lib/sanity.server'
import { ProductImages } from '@/components/ProductImages'
import styles from './page.module.css'

type PortableTextBlock = {
  _type: string
  children?: Array<{ text?: string }>
}

type Product = {
  _id: string
  title: string
  slug: { current: string }
  price?: number
  sold?: boolean
  images: string[]
  description?: PortableTextBlock[]
  seoTitle?: string
  seoDescription?: string
}

// Extracts plain text from PortableText blocks for use in meta descriptions
function toPlainText(blocks?: PortableTextBlock[] | null): string {
  return (blocks ?? [])
    .filter((b) => b._type === 'block')
    .map((b) => b.children?.map((c) => c.text || '').join('') || '')
    .join(' ')
    .trim()
}

async function getProduct(slug: string): Promise<Product | null> {
  return serverClient.fetch(
    `*[_type == "product" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
      _id,
      title,
      slug,
      price,
      sold,
      "images": images[].asset->url,
      description,
      seoTitle,
      seoDescription
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await serverClient.fetch(
    `*[_type == "product" && !(_id in path("drafts.**"))]{ "slug": slug.current }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  const title = product.seoTitle || product.title
  const description =
    product.seoDescription ||
    toPlainText(product.description).slice(0, 160) ||
    undefined

  const ogImage = product.images?.[0]

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 1600,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.images?.[0] && { image: product.images[0] }),
    ...(product.description && {
      description: toPlainText(product.description),
    }),
    ...(product.price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: product.sold
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.layout}>
        {/* Image grid with lightbox */}
        <ProductImages images={product.images ?? []} title={product.title} />

        {/* Product info */}
        <div className={styles.info}>
          {/* Sold label + title + price */}
          <div className={styles.infoSection}>
            {product.sold && (
              <div className={styles.soldLabel}>
                <span className={styles.soldText}>SOLD</span>
              </div>
            )}
            <div className={styles.titleGroup}>
              <h1 className={styles.title}>{product.title}</h1>
              {product.price !== undefined && (
                <p className={`${styles.price}${product.sold ? ' ' + styles.priceSold : ''}`}>€ {product.price}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && product.description.length > 0 && (
            <div className={styles.infoSection}>
              <div className={styles.description}>
                <PortableText value={product.description} />
              </div>
            </div>
          )}

          {/* Shipping CTA */}
          <div className={styles.ctaWrapper}>
            <div className={styles.ctaBox}>
              <p className={styles.ctaText}>
                Are you interested in buying this product or do you have any inquiries?{' '}
                <a href="mailto:info@brakbrussels.com" className={styles.ctaLink}>
                  Drop us an email
                </a>
                !
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
