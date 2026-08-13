import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import { client } from '@/lib/sanity'
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
  const result = await client.fetch(
    `*[_type == "siteSettings"][0] {
      siteName,
      siteDescription,
      "ogImageUrl": ogImage.asset->url
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return result ?? {}
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.siteName || 'Brak Brussels'
  const description = settings.siteDescription || 'Design furniture from Brussels.'

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
      ...(settings.ogImageUrl && {
        images: [
          {
            url: settings.ogImageUrl,
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
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
    </html>
  )
}
