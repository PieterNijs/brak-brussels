import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="header-spacer" />
      <main>{children}</main>
      <Footer />
    </>
  )
}
