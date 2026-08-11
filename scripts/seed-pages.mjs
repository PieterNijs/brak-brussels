/**
 * Seed script — creates the four text pages in Sanity
 *
 * Requirements: SANITY_API_TOKEN with "Editor" permissions in .env.local
 *
 * Run:
 *   node scripts/seed-pages.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
)

const client = createClient({
  projectId: env['NEXT_PUBLIC_SANITY_PROJECT_ID'],
  dataset:   env['NEXT_PUBLIC_SANITY_DATASET'],
  apiVersion: '2024-01-01',
  useCdn: false,
  token: env['SANITY_API_TOKEN'],
})

const key = () => Math.random().toString(36).slice(2, 10)

const p = (text) => ({
  _type: 'block', _key: key(), style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const h2 = (text) => ({
  _type: 'block', _key: key(), style: 'h2', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

const pWithLink = (before, linkText, href, after = '') => {
  const linkKey = key()
  return {
    _type: 'block', _key: key(), style: 'normal',
    markDefs: [{ _type: 'link', _key: linkKey, href }],
    children: [
      ...(before ? [{ _type: 'span', _key: key(), text: before, marks: [] }] : []),
      { _type: 'span', _key: key(), text: linkText, marks: [linkKey] },
      ...(after ? [{ _type: 'span', _key: key(), text: after, marks: [] }] : []),
    ],
  }
}

const bullet = (text) => ({
  _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

// ── Page definitions ──────────────────────────────────────────────────────────

const pages = [
  {
    slug: 'contact',
    title: 'Contact',
    content: [
      p('Brak Brussels\nRue de la Brasserie 42\n1050 Brussels\nBelgium'),
      p('Phone: +32 2 500 12 34'),
      pWithLink('Email: ', 'info@brakbrussels.com', 'mailto:info@brakbrussels.com'),
    ],
  },
  {
    slug: 'shipping',
    title: 'Shipping policy',
    content: [
      p('We offer various shipping options to cater to your needs. For deliveries within France, orders over 250 € are eligible for free shipping, while orders below 250 € incur a 25 € shipping fee.'),
      p('For international deliveries worldwide, the shipping fee is 60 €, except for deliveries to South Korea and China, which have a shipping fee of 140 €.'),
      pWithLink('For bulky furniture items that cannot be shipped via UPS, please ', 'contact us', '/contact', ' before making your purchase so we can provide you with a customized quote. We have alternative solutions available for handling large and bulky items.'),
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund policy',
    content: [
      p('We have a 15-day return policy, which means you have 15 days after receiving your item to request a return.'),
      p('To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You\'ll also need the receipt or proof of purchase.'),
      pWithLink('To start a return, you can contact us at ', 'contact@saint-antoine.paris', 'mailto:contact@saint-antoine.paris', '. Please note that returns will need to be sent to the following address: Saint Antoine, 33 rue du faubourg Saint Antoine, 75011 Paris.'),
      pWithLink('You can always contact us for any return question at ', 'contact@saint-antoine.paris', 'mailto:contact@saint-antoine.paris', '.'),
      h2('Damages and issues'),
      p('Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.'),
      h2('Exchanges'),
      p('The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.'),
      h2('European Union 14 day cooling off period'),
      p('Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You\'ll also need the receipt or proof of purchase.'),
      h2('Refunds'),
      p('We will notify you once we\'ve received and inspected your return, and let you know if the refund was approved or not. If approved, you\'ll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.'),
      pWithLink('If more than 15 business days have passed since we\'ve approved your return, please contact us at ', 'hello@brakbrussels.com', 'mailto:hello@brakbrussels.com', '.'),
    ],
  },
  {
    slug: 'legal',
    title: 'Legal notice',
    content: [
      h2('Ordering terms'),
      p('It is not mandatory to create an account to make purchases on saint-antoine.paris. However, registered users have access to services reserved for our customers.'),
      h2('Payment methods'),
      p('saint-antoine.paris accepts the following payment methods:'),
      bullet('Credit card: All major credit cards, such as Visa, MasterCard, American Express, or JCB. Your card will be charged at the time of the order.'),
      bullet('PayPal: Simplify your payment process with PayPal\'s digital wallet.'),
      bullet('Apple Pay: Use Apple Pay to easily and securely pay for your purchases in iOS apps and online.'),
      bullet('ShopPay: Shopify\'s accelerated payment service allows you to pay for your purchases in full or in installments.'),
      h2('Tax information'),
      p('Your order is subject to all applicable sales taxes in accordance with regional or national regulations. We collect sales tax in all applicable states.'),
      p('Therefore, an estimate of the tax amount may be added to your order total during the payment process. The exact fees will be automatically calculated after your order has been shipped, based on the postal code of your shipping address. The final amount will be equal to or less than the estimate provided at the time of payment. The final sales tax applied to your order will be indicated in the shipping confirmation email.'),
      h2('Payment security'),
      p('We take your online security very seriously. Your data is confidential and we make sure it stays that way. In accordance with national legislation, we have implemented information security guarantees and reasonable technical measures to protect your data against unauthorized access or use. We only use secure connection certificates, recognizable by the "https" prefix in the URL and the lock displayed in the browser\'s address bar.'),
      p('Your order may be subject to routine anti-fraud checks before the transaction is validated. To enhance protection measures, our Customer Service may also request additional information before confirming your order.'),
    ],
  },
]

// ── Run ───────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n📄  Seeding text pages into Sanity...\n')

  for (const pg of pages) {
    process.stdout.write(`  → ${pg.title} (/${pg.slug}) ... `)

    // Delete existing document with this slug first (idempotent)
    const existing = await client.fetch(
      `*[_type == "page" && slug.current == $slug][0]._id`,
      { slug: pg.slug }
    )
    if (existing) await client.delete(existing)

    await client.create({
      _type: 'page',
      title: pg.title,
      slug: { _type: 'slug', current: pg.slug },
      content: pg.content,
    })

    console.log('✓')
  }

  console.log('\n✅  Done! Pages are live in Sanity Studio.\n')
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message)
  process.exit(1)
})
