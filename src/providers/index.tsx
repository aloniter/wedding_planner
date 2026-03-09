'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from './auth-provider'
import { WeddingProvider } from './wedding-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WeddingProvider>
        {children}
      </WeddingProvider>
    </AuthProvider>
  )
}
