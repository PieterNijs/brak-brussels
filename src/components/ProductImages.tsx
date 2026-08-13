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
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const touchStartX = useRef(0)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  const [img0, img1, img2, ...restImages] = images

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
    setImgNaturalSize(null)
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
    if (!imageWrapperRef.current || !imgNaturalSize) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const containerAspect = rect.width / rect.height
    const imgAspect = imgNaturalSize.w / imgNaturalSize.h
    let renderedW: number, renderedH: number, offsetX: number, offsetY: number
    if (containerAspect > imgAspect) {
      renderedH = rect.height; renderedW = rect.height * imgAspect
      offsetX = (rect.width - renderedW) / 2; offsetY = 0
    } else {
      renderedW = rect.width; renderedH = rect.width / imgAspect
      offsetX = 0; offsetY = (rect.height - renderedH) / 2
    }
    if (
      clickX >= offsetX && clickX <= offsetX + renderedW &&
      clickY >= offsetY && clickY <= offsetY + renderedH
    ) {
      e.stopPropagation() // prevent overlay from closing the lightbox
      setZoomed((z) => !z)
    }
    // clicks in the letterbox area bubble up to the overlay → closeLightbox
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
      <div className={styles.imageContainer}>

        {/* Hero row: big image left + 2 stacked right */}
        <div className={styles.heroRow}>
          {img0 && (
            <button
              className={styles.heroMain}
              onClick={() => openLightbox(0)}
              aria-label="Open fullscreen"
            >
              <Image
                src={img0}
                alt={title}
                fill
                className={styles.img}
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
              <span className={styles.fullscreenIcon} aria-hidden="true">
                <FullscreenIcon />
              </span>
            </button>
          )}
          {(img1 || img2) && (
            <div className={styles.heroSide}>
              {img1 && (
                <button
                  className={styles.heroSmall}
                  onClick={() => openLightbox(1)}
                  aria-label="Open image 2 fullscreen"
                >
                  <Image
                    src={img1}
                    alt={`${title} 2`}
                    fill
                    className={styles.img}
                    sizes="(max-width: 768px) 50vw, 22vw"
                  />
                  <span className={styles.fullscreenIcon} aria-hidden="true">
                    <FullscreenIcon />
                  </span>
                </button>
              )}
              {img2 && (
                <button
                  className={styles.heroSmall}
                  onClick={() => openLightbox(2)}
                  aria-label="Open image 3 fullscreen"
                >
                  <Image
                    src={img2}
                    alt={`${title} 3`}
                    fill
                    className={styles.img}
                    sizes="(max-width: 768px) 50vw, 22vw"
                  />
                  <span className={styles.fullscreenIcon} aria-hidden="true">
                    <FullscreenIcon />
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Remaining images: 2 per row */}
        {restImages.length > 0 && (
          <div className={styles.restGrid}>
            {restImages.map((src, i) => (
              <button
                key={src}
                className={styles.restImage}
                onClick={() => openLightbox(i + 3)}
                aria-label={`Open image ${i + 4} fullscreen`}
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 4}`}
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
        )}

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
              onLoad={(e) => {
                const img = e.target as HTMLImageElement
                setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
              }}
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
