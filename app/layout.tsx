import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Dream Properties - Nashik Premier Real Estate Hub',
  description: 'Nashik Premier Multi-Tenant Real Estate Hub connecting you with verified premium developments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body suppressHydrationWarning className={dmSans.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
