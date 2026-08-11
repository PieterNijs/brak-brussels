import Image from 'next/image'
import Link from 'next/link'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
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
