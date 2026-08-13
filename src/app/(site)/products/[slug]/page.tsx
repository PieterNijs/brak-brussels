import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import { client } from '@/lib/sanity'
import { ProductImages } from '@/components/ProductImages'
import styles from './page.module.css'

type Product = {
  _id: string
  title: string
  slug: { current: string }
  price?: number
  sold?: boolean
  images: string[]
  description?: any[]
}

async function getProduct(slug: string): Promise<Product | null> {
  return client.fetch(
    `*[_type == "product" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      price,
      sold,
      "images": images[].asset->url,
      description
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client.fetch(
    `*[_type == "product"]{ "slug": slug.current }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return (
    <div className={styles.layout}>
      {/* Image masonry with lightbox */}
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
              If you have any questions regarding our shipping fees?{' '}
              <a href="mailto:info@brakbrussels.com" className={styles.ctaLink}>
                Drop us an email
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
