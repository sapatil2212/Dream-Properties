'use client'

import { SessionProvider } from 'next-auth/react'
import { UserActivityTracker } from './UserActivityTracker'
import { VisitorTracker } from './VisitorTracker'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserActivityTracker />
      <VisitorTracker />
      {children}
    </SessionProvider>
  )
}
