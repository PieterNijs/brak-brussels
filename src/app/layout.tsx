import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: 'Brak Brussels',
  description: 'Design furniture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
