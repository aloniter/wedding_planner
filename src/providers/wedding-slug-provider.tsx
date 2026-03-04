'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { saveSlug } from '@/lib/wedding-storage'
import type { Wedding, WeddingUpdate } from '@/lib/types'

interface WeddingSlugContextValue {
  wedding: Wedding | null
  loading: boolean
  error: string | null
  updateWedding: (updates: WeddingUpdate) => Promise<void>
}

const WeddingSlugContext = createContext<WeddingSlugContextValue>({
  wedding: null,
  loading: true,
  error: null,
  updateWedding: async () => {},
})

export function useWeddingSlugContext() {
  return useContext(WeddingSlugContext)
}

export function WeddingSlugProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load wedding by slug
  useEffect(() => {
    if (!slug || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function loadWedding() {
      const { data, error: fetchError } = await supabase
        .from('weddings')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!cancelled) {
        if (fetchError || !data) {
          setError('לא נמצאה חתונה עם הקישור הזה')
          setLoading(false)
        } else {
          saveSlug(data.slug)
          setWedding(data as Wedding)
          setLoading(false)
        }
      }
    }

    loadWedding()
    return () => { cancelled = true }
  }, [slug])

  // Subscribe to wedding updates via realtime
  useEffect(() => {
    if (!wedding?.id || !getSupabaseConfig()) return
    const supabase = createClient()

    const channel = supabase
      .channel(`wedding:${wedding.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'weddings',
        filter: `id=eq.${wedding.id}`,
      }, (payload) => {
        setWedding(payload.new as Wedding)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [wedding?.id])

  const updateWedding = useCallback(async (updates: WeddingUpdate) => {
    if (!wedding || !getSupabaseConfig()) return
    const supabase = createClient()
    const previous = wedding
    setWedding({ ...wedding, ...updates })

    const { error: updateError } = await supabase
      .from('weddings')
      .update(updates)
      .eq('id', wedding.id)

    if (updateError) {
      setWedding(previous)
    }
  }, [wedding])

  return (
    <WeddingSlugContext.Provider value={{ wedding, loading, error, updateWedding }}>
      {children}
    </WeddingSlugContext.Provider>
  )
}
