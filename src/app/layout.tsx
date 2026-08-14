import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { serverClient } from '@/lib/sanity.server'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
})

type SiteSettings = {
  siteName?: string
  siteDescription?: string
  ogImageUrl?: string
}

async function getSiteSettings(): Promise<SiteSettings> {
  const result = await serverClient.fetch(
    `*[_type == "siteSettings"][0] {
      siteName,
      siteDescription,
      "ogImageUrl": ogImage.asset->url
    }`,
    {},
    { next: { revalidate: 300 } } // 5 minutes — fresh enough without hammering the API
  )
  return result ?? {}
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.siteName || 'Brak Brussels'
  const description = settings.siteDescription || 'Design furniture from Brussels.'
  const ogImage = settings.ogImageUrl

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://brakbrussels.com'
    ),
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description,
    openGraph: {
      siteName,
      type: 'website',
      locale: 'en_US',
      title: siteName,
      description,
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body>{children}</body>
      <Analytics />
    </html>
  )
}
