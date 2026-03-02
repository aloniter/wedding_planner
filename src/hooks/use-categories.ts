'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GuestCategory } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from './use-realtime'

export function useCategories(weddingId: string | undefined) {
  const [categories, setCategories] = useState<GuestCategory[]>([])
  const [loading, setLoading] = useState(true)
  const categoriesRef = useRef(categories)
  categoriesRef.current = categories

  const supabase = createClient()

  useEffect(() => {
    if (!weddingId) return
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('guest_categories')
        .select('*')
        .eq('wedding_id', weddingId!)
        .order('created_at', { ascending: true })

      if (!cancelled && !error && data) {
        setCategories(data as GuestCategory[])
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [weddingId, supabase])

  useRealtime<GuestCategory>('guest_categories', weddingId, {
    onInsert: (c) => setCategories(prev =>
      prev.find(x => x.id === c.id) ? prev : [...prev, c]
    ),
    onUpdate: (c) => setCategories(prev => prev.map(x => {
      if (x.id !== c.id) return x
      return new Date(c.updated_at) >= new Date(x.updated_at) ? c : x
    })),
    onDelete: ({ id }) => setCategories(prev => prev.filter(x => x.id !== id)),
  })

  const addCategory = useCallback(async (name: string) => {
    const { data: newCat, error } = await supabase
      .from('guest_categories')
      .insert({
        wedding_id: weddingId!,
        name,
      })
      .select()
      .single()

    if (!error && newCat) {
      setCategories(prev =>
        prev.find(c => c.id === newCat.id) ? prev : [...prev, newCat as GuestCategory]
      )
      return newCat as GuestCategory
    }
    return null
  }, [weddingId, supabase])

  const renameCategory = useCallback(async (id: string, newName: string) => {
    const previous = categoriesRef.current
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c))

    const { error } = await supabase
      .from('guest_categories')
      .update({ name: newName })
      .eq('id', id)

    if (error) {
      setCategories(previous)
    }
  }, [supabase])

  const deleteCategory = useCallback(async (id: string) => {
    const previous = categoriesRef.current
    setCategories(prev => prev.filter(c => c.id !== id))

    const { error } = await supabase
      .from('guest_categories')
      .delete()
      .eq('id', id)

    if (error) {
      setCategories(previous)
    }
  }, [supabase])

  return {
    categories,
    loading,
    addCategory,
    renameCategory,
    deleteCategory,
  }
}
