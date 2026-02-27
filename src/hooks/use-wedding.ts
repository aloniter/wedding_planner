'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Wedding, WeddingUpdate } from '@/lib/types'
import { getStoredWedding, setStoredWedding } from '@/lib/storage'

export function useWedding() {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setWedding(getStoredWedding())
    setLoading(false)
  }, [])

  const createWedding = useCallback((data: Omit<Wedding, 'created_at'>) => {
    const newWedding: Wedding = {
      ...data,
      created_at: new Date().toISOString(),
    }
    setStoredWedding(newWedding)
    setWedding(newWedding)
    return newWedding
  }, [])

  const updateWedding = useCallback((updates: WeddingUpdate) => {
    setWedding(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      setStoredWedding(updated)
      return updated
    })
  }, [])

  return { wedding, loading, createWedding, updateWedding }
}
