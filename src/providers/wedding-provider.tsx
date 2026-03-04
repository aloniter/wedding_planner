'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import type { Wedding, WeddingUpdate } from '@/lib/types'
import { DEFAULT_GUEST_CATEGORIES } from '@/lib/constants'

interface WeddingContextValue {
  wedding: Wedding | null
  loading: boolean
  error: string | null
  createWedding: (data: Omit<Wedding, 'id' | 'slug' | 'created_at' | 'updated_at'>) => Promise<Wedding | null>
  updateWedding: (updates: WeddingUpdate) => Promise<void>
}

const WeddingContext = createContext<WeddingContextValue>({
  wedding: null,
  loading: false,
  error: null,
  createWedding: async () => null,
  updateWedding: async () => {},
})

export function useWeddingContext() {
  return useContext(WeddingContext)
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createWedding = useCallback(async (
    data: Omit<Wedding, 'id' | 'slug' | 'created_at' | 'updated_at'>
  ): Promise<Wedding | null> => {
    if (!getSupabaseConfig()) return null
    const supabase = createClient()

    const weddingId = crypto.randomUUID()

    const { error: insertError } = await supabase
      .from('weddings')
      .insert({
        id: weddingId,
        bride_name: data.bride_name,
        groom_name: data.groom_name,
        wedding_date: data.wedding_date,
        venue_name: data.venue_name,
        total_budget: data.total_budget,
        estimated_guests: data.estimated_guests,
      })

    if (insertError) {
      setError('שגיאה ביצירת החתונה')
      return null
    }

    // Fetch the created wedding to get the auto-generated slug
    const { data: newWedding, error: selectError } = await supabase
      .from('weddings')
      .select('*')
      .eq('id', weddingId)
      .single()

    if (selectError || !newWedding) {
      setError('שגיאה ביצירת החתונה')
      return null
    }

    // Seed default categories
    const defaultCats = DEFAULT_GUEST_CATEGORIES.map(name => ({
      wedding_id: weddingId,
      name,
    }))
    await supabase.from('guest_categories').insert(defaultCats)

    const result = newWedding as Wedding
    setWedding(result)
    return result
  }, [])

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
      setError('שגיאה בעדכון פרטי החתונה')
    }
  }, [wedding])

  return (
    <WeddingContext.Provider value={{ wedding, loading, error, createWedding, updateWedding }}>
      {children}
    </WeddingContext.Provider>
  )
}
