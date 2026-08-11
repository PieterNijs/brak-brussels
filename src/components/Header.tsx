'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from './Header.module.css'

export function Header() {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 0) {
        // At the very top — always show
        setVisible(true)
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up — reveal
        setVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down — hide
        setVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`${styles.header} ${visible ? '' : styles.hidden}`}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/logo.svg"
          alt="Brak Brussels"
          width={160}
          height={45}
          priority
          className={styles.logo}
        />
      </Link>
      <button className={styles.navButton} aria-label="Open menu">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>
    </header>
  )
}
