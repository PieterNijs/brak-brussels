/**
 * Seed script — populates Sanity with dummy brutalist furniture products
 *
 * Requirements:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local
 *   - SANITY_API_TOKEN with "Editor" permissions (get one at sanity.io/manage → API → Tokens)
 *
 * Run:
 *   node scripts/seed.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env.local manually ─────────────────────────────────────────────────
const envPath = resolve(__dirname, '../.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
)

const projectId = env['NEXT_PUBLIC_SANITY_PROJECT_ID']
const dataset   = env['NEXT_PUBLIC_SANITY_DATASET']
const token     = env['SANITY_API_TOKEN']

if (!projectId || !dataset) {
  console.error('❌  Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('❌  Missing SANITY_API_TOKEN in .env.local')
  console.error('    Create one at https://sanity.io/manage → your project → API → Tokens')
  console.error('    Give it "Editor" permissions, then add: SANITY_API_TOKEN=your_token_here')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: false, token })

// ── Helpers ───────────────────────────────────────────────────────────────────
const key  = () => Math.random().toString(36).slice(2, 10)
const block = (text) => ({
  _type: 'block', _key: key(), style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})

async function uploadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return client.assets.upload('image', buffer, { contentType: 'image/jpeg' })
}

// ── Product definitions ───────────────────────────────────────────────────────
// Images: picsum with fixed seeds so they're deterministic (600×800 = 3:4 ratio)
const picsumUrl = (seed, w = 600, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

const products = [
  {
    title: 'Brutalist Coffee Table No. 01',
    price: 680,
    sold: false,
    imageSeeds: ['concrete1', 'concrete2', 'concrete3'],
    description: [
      block('Raw concrete top on a welded steel base. Each piece is cast individually, leaving the natural texture of the formwork visible on the underside.'),
      block('Dimensions: 120 × 60 × 38 cm. Weight approx. 85 kg.'),
    ],
  },
  {
    title: 'Monolith Side Table',
    price: 390,
    sold: false,
    imageSeeds: ['mono1', 'mono2'],
    description: [
      block('A single solid block of reconstituted limestone, hand-finished with a matte oil seal. No joints, no hardware — just material.'),
      block('Dimensions: 40 × 40 × 50 cm.'),
    ],
  },
  {
    title: 'Steel & Ash Bench',
    price: 520,
    sold: true,
    imageSeeds: ['bench1', 'bench2', 'bench3'],
    description: [
      block('Hot-rolled steel frame with a reclaimed ash seat. The steel is left unsealed and will develop a natural patina over time.'),
      block('Dimensions: 160 × 38 × 44 cm. Seat height 44 cm.'),
    ],
  },
  {
    title: 'Poured Concrete Shelf Unit',
    price: 1100,
    sold: false,
    imageSeeds: ['shelf1', 'shelf2'],
    description: [
      block('Three-tier shelving unit in reinforced concrete. The uprights are hollow-cast to reduce weight while maintaining structural rigidity.'),
      block('Dimensions: 90 × 30 × 180 cm. Wall-mounting hardware included.'),
    ],
  },
  {
    title: 'Raw Steel Lounge Chair',
    price: 890,
    sold: false,
    imageSeeds: ['chair1', 'chair2', 'chair3', 'chair4'],
    description: [
      block('Structural steel rod bent and welded into a single continuous form. Seat cushion in undyed wool felt, removable.'),
      block('Dimensions: 75 × 80 × 72 cm. Seat height 38 cm. Weight 22 kg.'),
    ],
  },
  {
    title: 'Cast Iron Pedestal',
    price: 295,
    sold: false,
    imageSeeds: ['pedestal1', 'pedestal2'],
    description: [
      block('Repurposed industrial casting, sandblasted and sealed. Originally used as a press base. Now a sculptural pedestal or side table.'),
      block('Dimensions vary per piece. Approx. 35 × 35 × 65 cm.'),
    ],
  },
  {
    title: 'Brutalist Wall Mirror',
    price: 450,
    sold: true,
    imageSeeds: ['mirror1', 'mirror2'],
    description: [
      block('Mirror in a rough-cast concrete frame. The glass is intentionally set slightly off-centre, disrupting the expected symmetry.'),
      block('Dimensions: 70 × 90 cm. Hanging system included.'),
    ],
  },
  {
    title: 'Stacking Concrete Stools — Set of 3',
    price: 740,
    sold: false,
    imageSeeds: ['stool1', 'stool2', 'stool3'],
    description: [
      block('Three identical stools that nest cleanly when stacked. Cast in white Portland cement with an exposed aggregate finish.'),
      block('Each stool: ⌀ 30 cm × H 45 cm. Weight per stool approx. 18 kg.'),
    ],
  },
]

// ── Run ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🪨  Seeding ${products.length} brutalist furniture products into Sanity...\n`)

  for (const p of products) {
    process.stdout.write(`  → ${p.title} ... `)

    // Upload images
    const imageAssets = []
    for (const seed of p.imageSeeds) {
      const asset = await uploadImage(picsumUrl(seed))
      imageAssets.push({
        _type: 'image',
        _key: key(),
        asset: { _type: 'reference', _ref: asset._id },
        alt: p.title,
      })
    }

    // Build slug from title
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Create document
    await client.create({
      _type: 'product',
      title: p.title,
      slug: { _type: 'slug', current: slug },
      price: p.price,
      sold: p.sold,
      images: imageAssets,
      description: p.description,
    })

    console.log('✓')
  }

  console.log('\n✅  Done! Check your Studio at http://localhost:3000/studio\n')
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message)
  process.exit(1)
})
