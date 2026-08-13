'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  title: string
  price?: number | string
  images: string[]
  slug: string
  sold?: boolean
}

export function ProductCard({
  title,
  price,
  images,
  slug,
  sold = false,
}: ProductCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleMouseEnter = () => {
    if (images.length <= 1) return
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 2000)
  }

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentIndex(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!images.length) return null

  return (
    <Link
      href={`/products/${slug}`}
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.thumbnail}>
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? title : ''}
            fill
            className={styles.image}
            style={{
              opacity: i === currentIndex ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={i === 0}
          />
        ))}
        {sold && (
          <div className={styles.soldLabel}>
            <span className={styles.soldText}>SOLD</span>
          </div>
        )}
      </div>
      <div className={styles.details}>
        <p className={styles.title}>{title}</p>
        {price !== undefined && <p className={`${styles.price}${sold ? ' ' + styles.priceSold : ''}`}>€ {price}</p>}
      </div>
    </Link>
  )
}
