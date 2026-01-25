'use client'

import { SessionProvider } from 'next-auth/react'
import { UserActivityTracker } from './UserActivityTracker'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserActivityTracker />
      {children}
    </SessionProvider>
  )
}
