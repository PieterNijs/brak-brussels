import type { Metadata } from 'next'
import { serverClient } from '@/lib/sanity.server'
import { ProductCard } from '@/components/ProductCard'
import styles from './page.module.css'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

type Product = {
  _id: string
  title: string
  slug: { current: string }
  price?: number
  sold?: boolean
  images: string[]
}

async function getProducts(): Promise<Product[]> {
  return serverClient.fetch(
    `*[_type == "product" && !(_id in path("drafts.**"))] | order(orderRank) {
      _id,
      title,
      slug,
      price,
      sold,
      "images": images[].asset->url
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export default async function HomePage() {
  const products = await getProducts()

  if (!products.length) {
    return (
      <div className={styles.empty}>
        <p>No products yet. Add some in the Studio.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          title={product.title}
          price={product.price}
          images={product.images ?? []}
          slug={product.slug.current}
          sold={product.sold}
        />
      ))}
    </div>
  )
}
