import { createClient } from 'next-sanity'

/**
 * Server-only Sanity client.
 *
 * - useCdn: false  → bypasses the CDN; always fetches fresh published data
 *                    directly from the Sanity API, so content appears
 *                    immediately after publishing in Studio.
 * - token          → authenticates against the Sanity API.
 *
 * Import this ONLY in Server Components, Route Handlers, or server actions.
 * Never import it in Client Components — SANITY_API_TOKEN is a server-side
 * secret and must not be exposed to the browser.
 */
export const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
