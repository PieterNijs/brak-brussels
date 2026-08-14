'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import styles from './ProductImages.module.css'
import { sanityLoader } from '@/lib/sanity.image'

type ProductImagesProps = {
  images: string[]
  title: string
}

const ZOOM_SCALE = 2.5

// Returns the rendered image bounds within the wrapper (accounts for object-fit: contain letterboxing)
function getRenderedBounds(
  rect: DOMRect,
  naturalSize: { w: number; h: number }
) {
  const ca = rect.width / rect.height
  const ia = naturalSize.w / naturalSize.h
  let rW: number, rH: number, oX: number, oY: number
  if (ca > ia) {
    rH = rect.height; rW = rect.height * ia; oX = (rect.width - rW) / 2; oY = 0
  } else {
    rW = rect.width; rH = rect.width / ia; oX = 0; oY = (rect.height - rH) / 2
  }
  return { rW, rH, oX, oY }
}

// Clamps the pan origin (px) so the zoomed image always covers the viewport — no black bars
function clampOrigin(
  xPx: number,
  yPx: number,
  rect: DOMRect,
  { rW, rH, oX, oY }: { rW: number; rH: number; oX: number; oY: number }
): { x: number; y: number } {
  const S = ZOOM_SCALE
  const oxMin = (oX * S) / (S - 1)
  const oxMax = ((oX + rW) * S - rect.width) / (S - 1)
  const oyMin = (oY * S) / (S - 1)
  const oyMax = ((oY + rH) * S - rect.height) / (S - 1)

  // If the valid range inverts (image is smaller than viewport even when zoomed), centre it
  const cx = oxMin <= oxMax ? Math.min(Math.max(xPx, oxMin), oxMax) : rect.width / 2
  const cy = oyMin <= oyMax ? Math.min(Math.max(yPx, oyMin), oyMax) : rect.height / 2

  return { x: (cx / rect.width) * 100, y: (cy / rect.height) * 100 }
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
  const [isOverImage, setIsOverImage] = useState(false)

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

  // Reset state whenever the active image changes or lightbox closes
  useEffect(() => {
    setZoomed(false)
    setOrigin({ x: 50, y: 50 })
    setImgNaturalSize(null)
    setIsOverImage(false)
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

  // Mouse tracking: update isOverImage, set pan origin (clamped when zoomed)
  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageWrapperRef.current) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    const xPx = e.clientX - rect.left
    const yPx = e.clientY - rect.top

    if (imgNaturalSize) {
      const bounds = getRenderedBounds(rect, imgNaturalSize)
      const over =
        xPx >= bounds.oX && xPx <= bounds.oX + bounds.rW &&
        yPx >= bounds.oY && yPx <= bounds.oY + bounds.rH
      setIsOverImage(over)

      if (zoomed) {
        setOrigin(clampOrigin(xPx, yPx, rect, bounds))
      } else {
        setOrigin({ x: (xPx / rect.width) * 100, y: (yPx / rect.height) * 100 })
      }
    } else {
      setIsOverImage(false)
      setOrigin({ x: (xPx / rect.width) * 100, y: (yPx / rect.height) * 100 })
    }
  }

  const handleMouseLeave = () => setIsOverImage(false)

  // Click on image → zoom; click on letterbox → close (bubbles to overlay)
  const handleImageClick = (e: React.MouseEvent) => {
    if (!imageWrapperRef.current || !imgNaturalSize) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const bounds = getRenderedBounds(rect, imgNaturalSize)

    if (
      clickX >= bounds.oX && clickX <= bounds.oX + bounds.rW &&
      clickY >= bounds.oY && clickY <= bounds.oY + bounds.rH
    ) {
      e.stopPropagation()
      // When zooming in, clamp origin immediately so no black bars flash on first render
      if (!zoomed) {
        setOrigin(clampOrigin(clickX, clickY, rect, bounds))
      }
      setZoomed((z) => !z)
    }
  }

  // Touch pan while zoomed — clamp to image bounds
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!zoomed || !imageWrapperRef.current) return
    const rect = imageWrapperRef.current.getBoundingClientRect()
    const xPx = e.touches[0].clientX - rect.left
    const yPx = e.touches[0].clientY - rect.top

    if (imgNaturalSize) {
      setOrigin(clampOrigin(xPx, yPx, rect, getRenderedBounds(rect, imgNaturalSize)))
    } else {
      setOrigin({ x: (xPx / rect.width) * 100, y: (yPx / rect.height) * 100 })
    }
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
                loader={sanityLoader}
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
                    loader={sanityLoader}
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
                    loader={sanityLoader}
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
                  loader={sanityLoader}
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
          {/* Image wrapper — handles zoom and pan */}
          <div
            ref={imageWrapperRef}
            className={styles.lightboxImageWrapper}
            onClick={handleImageClick}
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: zoomed ? `scale(${ZOOM_SCALE})` : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
              // Show zoom cursor only when hovering the actual image, not the letterbox
              cursor: isOverImage ? (zoomed ? 'zoom-out' : 'zoom-in') : 'default',
              touchAction: zoomed ? 'none' : 'auto',
            }}
          >
            <Image
              src={images[activeIndex]}
              alt={`${title} ${activeIndex + 1}`}
              fill
              loader={sanityLoader}
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
