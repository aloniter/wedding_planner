'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GuestCategory } from '@/lib/types'
import { getStoredCategories, setStoredCategories } from '@/lib/storage'
import { DEFAULT_GUEST_CATEGORIES } from '@/lib/constants'
import { generateId } from '@/lib/utils'

export function useCategories(weddingId: string | undefined) {
  const [categories, setCategories] = useState<GuestCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!weddingId) return
    const stored = getStoredCategories().filter(c => c.wedding_id === weddingId)

    if (stored.length === 0) {
      // Seed defaults on first load
      const defaults: GuestCategory[] = DEFAULT_GUEST_CATEGORIES.map(name => ({
        id: generateId(),
        wedding_id: weddingId,
        name,
        color: null,
        created_at: new Date().toISOString(),
      }))
      const allCategories = getStoredCategories()
      setStoredCategories([...allCategories, ...defaults])
      setCategories(defaults)
    } else {
      setCategories(stored)
    }
    setLoading(false)
  }, [weddingId])

  const persist = useCallback((updated: GuestCategory[]) => {
    const all = getStoredCategories()
    const others = all.filter(c => c.wedding_id !== weddingId)
    setStoredCategories([...others, ...updated])
  }, [weddingId])

  const addCategory = useCallback((name: string) => {
    const newCat: GuestCategory = {
      id: generateId(),
      wedding_id: weddingId!,
      name,
      color: null,
      created_at: new Date().toISOString(),
    }
    setCategories(prev => {
      const updated = [...prev, newCat]
      persist(updated)
      return updated
    })
    return newCat
  }, [weddingId, persist])

  const renameCategory = useCallback((id: string, newName: string) => {
    setCategories(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, name: newName } : c)
      persist(updated)
      return updated
    })
  }, [persist])

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id)
      persist(updated)
      return updated
    })
  }, [persist])

  return {
    categories,
    loading,
    addCategory,
    renameCategory,
    deleteCategory,
  }
}
