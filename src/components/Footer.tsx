import Link from 'next/link'
import styles from './Footer.module.css'

const navLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Instagram', href: 'https://www.instagram.com/brak.brussels/', external: true },
  { label: 'Refund policy', href: '/refund-policy' },
  { label: 'Legal Notice', href: '/legal' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        {navLinks.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          )
        )}
      </nav>
      <p className={styles.copyright}>© Brak Brussels</p>
    </footer>
  )
}
