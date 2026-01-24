import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { QuickBanner } from '@/components/QuickBanner'
import { MobileBottomNav } from '@/components/MobileBottomNav'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <QuickBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
