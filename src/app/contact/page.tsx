import styles from './page.module.css'

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Contact</h1>

        <div className={styles.details}>
          <div className={styles.group}>
            <p className={styles.label}>Address</p>
            <address className={styles.address}>
              Brak Brussels<br />
              Rue de la Brasserie 42<br />
              1050 Brussels<br />
              Belgium
            </address>
          </div>

          <div className={styles.group}>
            <p className={styles.label}>Phone</p>
            <a href="tel:+3225001234" className={styles.link}>+32 2 500 12 34</a>
          </div>

          <div className={styles.group}>
            <p className={styles.label}>Email</p>
            <a href="mailto:info@brakbrussels.com" className={styles.link}>
              info@brakbrussels.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
