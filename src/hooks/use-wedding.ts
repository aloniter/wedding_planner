'use client'

import { useWeddingContext } from '@/providers/wedding-provider'

// Re-export the provider's hook as useWedding for backwards compatibility
export function useWedding() {
  return useWeddingContext()
}
