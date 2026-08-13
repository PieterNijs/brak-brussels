'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import styles from './ProductImages.module.css'

type ProductImagesProps = {
  images: string[]
  title: string
}

function FullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 1h5M1 1v5M17 1h-5M17 1v5M1 17h5M1 17v-5M17 17h-5M17 17v-5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M17 21l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M11 7l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProductImages({ images, title }: ProductImagesProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const touchStartX = useRef(0)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  const [primaryImage, ...secondaryImages] = images

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setZoomed(false)
  }

  // Reset zoom whenever the active image changes or lightbox closes
  useEffect(() => {
    setZoomed(false)
    setOrigin({ x: 50, y: 50 })
  }, [activeIndex, lightboxOpen])

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false)
        else setLightboxOpen(false)
      }
      if (!zoomed) {
        if (e.key === 'ArrowLeft')
          setActiveIndex((i) => (i - 1 + images.length) % images.length)
        if (e.key === 'ArrowRight')
          setActiveIndex((i) => (i + 1) % images.length)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, zoomed, images.length])

  // Mouse tracking for zoom origin / pan
  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageWrapperRef.current) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomed((z) => !z)
  }

  // Touch pan while zoomed
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!zoomed || !imageWrapperRef.current) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    setOrigin({
      x: ((e.touches[0].clientX - rect.left) / rect.width) * 100,
      y: ((e.touches[0].clientY - rect.top) / rect.height) * 100,
    })
  }

  // Swipe to navigate — only when not zoomed
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomed) return
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomed) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0) setActiveIndex((i) => (i + 1) % images.length)
      else setActiveIndex((i) => (i - 1 + images.length) % images.length)
    }
  }

  return (
    <>
      {/* ── Image grid ── */}
      <div className={styles.imageGrid}>
        {primaryImage && (
          <button
            className={styles.imagePrimary}
            onClick={() => openLightbox(0)}
            aria-label="Open fullscreen"
          >
            <Image
              src={primaryImage}
              alt={title}
              fill
              className={styles.img}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <span className={styles.fullscreenIcon} aria-hidden="true">
              <FullscreenIcon />
            </span>
          </button>
        )}
        {secondaryImages.map((src, i) => (
          <button
            key={src}
            className={styles.imageSecondary}
            onClick={() => openLightbox(i + 1)}
            aria-label={`Open image ${i + 2} fullscreen`}
          >
            <Image
              src={src}
              alt={`${title} ${i + 2}`}
              fill
              className={styles.img}
              sizes="(max-width: 768px) 50vw, 30vw"
            />
            <span className={styles.fullscreenIcon} aria-hidden="true">
              <FullscreenIcon />
            </span>
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div className={styles.overlay} onClick={closeLightbox}>
          {/* Image */}
          <div
            ref={imageWrapperRef}
            className={styles.lightboxImageWrapper}
            onClick={handleImageClick}
            onMouseMove={handleImageMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: zoomed ? 'scale(2.5)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              cursor: zoomed ? 'zoom-out' : 'zoom-in',
              touchAction: zoomed ? 'none' : 'auto',
            }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${title} ${activeIndex + 1}`}
              fill
              className={styles.lightboxImg}
              sizes="100vw"
            />
          </div>

          {/* Close */}
          <button
            className={styles.closeBtn}
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <CloseIcon />
          </button>

          {/* Arrows — desktop only, hidden when zoomed */}
          {images.length > 1 && !zoomed && (
            <>
              <button
                className={`${styles.navBtn} ${styles.prevBtn}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((i) => (i - 1 + images.length) % images.length)
                }}
                aria-label="Previous image"
              >
                <ChevronLeft />
              </button>
              <button
                className={`${styles.navBtn} ${styles.nextBtn}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((i) => (i + 1) % images.length)
                }}
                aria-label="Next image"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
