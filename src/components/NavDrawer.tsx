'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import styles from './NavDrawer.module.css'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Products', href: '/' },
  { label: 'Contact', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Refund policy', href: '/refund-policy' },
  { label: 'Legal notice', href: '/legal' },
]

export function NavDrawer({ isOpen, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop — only in DOM when open so it never intercepts taps */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel — always in DOM so CSS transition plays */}
      <nav
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        aria-label="Main navigation"
      >
        {/* Close button — matches header layout */}
        <div className={styles.drawerHeader}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className={`${styles.bar} ${styles.bar1}`} />
            <span className={`${styles.bar} ${styles.bar2}`} />
          </button>
        </div>

        {/* Nav links */}
        <ul className={styles.navItems}>
          {navItems.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={styles.navLink}
                onClick={onClose}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
