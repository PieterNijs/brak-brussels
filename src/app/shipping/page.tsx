import styles from './page.module.css'

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Shipping policy</h1>

        <div className={styles.body}>
          <p>
            We offer various shipping options to cater to your needs. For deliveries within
            France, orders over 250 € are eligible for free shipping, while orders below
            250 € incur a 25 € shipping fee.
          </p>
          <p>
            For international deliveries worldwide, the shipping fee is 60 €, except for
            deliveries to South Korea and China, which have a shipping fee of 140 €.
          </p>
          <p>
            For bulky furniture items that cannot be shipped via UPS, please{' '}
            <a href="/contact" className={styles.link}>contact us</a> before making your
            purchase so we can provide you with a customized quote. We have alternative
            solutions available for handling large and bulky items.
          </p>
        </div>
      </div>
    </div>
  )
}
