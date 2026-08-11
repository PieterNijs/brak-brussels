import styles from './page.module.css'

export default function RefundPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Refund policy</h1>

        <div className={styles.body}>
          <p>
            We have a 15-day return policy, which means you have 15 days after receiving
            your item to request a return.
          </p>
          <p>
            To be eligible for a return, your item must be in the same condition that you
            received it, unworn or unused, with tags, and in its original packaging.
            You'll also need the receipt or proof of purchase.
          </p>
          <p>
            To start a return, you can contact us at{' '}
            <a href="mailto:contact@saint-antoine.paris" className={styles.link}>
              contact@saint-antoine.paris
            </a>
            . Please note that returns will need to be sent to the following address:
            Saint Antoine, 33 rue du faubourg Saint Antoine, 75011 Paris.
          </p>
          <p>
            You can always contact us for any return question at{' '}
            <a href="mailto:contact@saint-antoine.paris" className={styles.link}>
              contact@saint-antoine.paris
            </a>
            .
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Damages and issues</h2>
            <p>
              Please inspect your order upon reception and contact us immediately if the
              item is defective, damaged or if you receive the wrong item, so that we can
              evaluate the issue and make it right.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Exchanges</h2>
            <p>
              The fastest way to ensure you get what you want is to return the item you
              have, and once the return is accepted, make a separate purchase for the new
              item.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>European Union 14 day cooling off period</h2>
            <p>
              Notwithstanding the above, if the merchandise is being shipped into the
              European Union, you have the right to cancel or return your order within 14
              days, for any reason and without a justification. As above, your item must
              be in the same condition that you received it, unworn or unused, with tags,
              and in its original packaging. You'll also need the receipt or proof of
              purchase.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Refunds</h2>
            <p>
              We will notify you once we've received and inspected your return, and let
              you know if the refund was approved or not. If approved, you'll be
              automatically refunded on your original payment method within 10 business
              days. Please remember it can take some time for your bank or credit card
              company to process and post the refund too.
            </p>
            <p>
              If more than 15 business days have passed since we've approved your return,
              please contact us at{' '}
              <a href="mailto:hello@brakbrussels.com" className={styles.link}>
                hello@brakbrussels.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
