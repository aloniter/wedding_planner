'use client'

import type { ReactNode } from 'react'
import { WeddingProvider } from './wedding-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WeddingProvider>
      {children}
    </WeddingProvider>
  )
}
