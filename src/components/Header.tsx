'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavDrawer } from './NavDrawer'
import styles from './Header.module.css'

export function Header() {
  const [visible, setVisible] = useState(true)
  const [navOpen, setNavOpen] = useState(false)
  const lastScrollY = useRef(0)

  const closeNav = useCallback(() => setNavOpen(false), [])

  // Keep --header-offset in sync so sticky elements can sit just below the header
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--header-offset',
      visible ? '141px' : '0px'
    )
  }, [visible])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY <= 0) {
        setVisible(true)
      } else if (currentScrollY < lastScrollY.current) {
        setVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
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
        <button
          className={styles.navButton}
          aria-label="Open menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(true)}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      </header>

      <NavDrawer isOpen={navOpen} onClose={closeNav} />
    </>
  )
}
