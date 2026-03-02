'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useAuth } from './auth-provider'
import type { Wedding, WeddingUpdate } from '@/lib/types'
import { DEFAULT_GUEST_CATEGORIES } from '@/lib/constants'

interface WeddingContextValue {
  wedding: Wedding | null
  loading: boolean
  error: string | null
  createWedding: (data: Omit<Wedding, 'id' | 'created_at' | 'updated_at'>) => Promise<Wedding | null>
  updateWedding: (updates: WeddingUpdate) => Promise<void>
}

const WeddingContext = createContext<WeddingContextValue>({
  wedding: null,
  loading: true,
  error: null,
  createWedding: async () => null,
  updateWedding: async () => {},
})

export function useWeddingContext() {
  return useContext(WeddingContext)
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's wedding via project_members
  useEffect(() => {
    if (authLoading) return
    if (!user || !getSupabaseConfig()) {
      setWedding(null)
      setLoading(false)
      return
    }

    const supabase = createClient()
    let cancelled = false

    async function loadWedding() {
      const { data: membership, error: memberError } = await supabase
        .from('project_members')
        .select('wedding_id')
        .eq('user_id', user!.id)
        .limit(1)
        .single()

      if (memberError || !membership) {
        if (!cancelled) {
          setWedding(null)
          setLoading(false)
        }
        return
      }

      const { data: weddingData, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', membership.wedding_id)
        .single()

      if (!cancelled) {
        if (weddingError || !weddingData) {
          setWedding(null)
          setError('לא הצלחנו לטעון את נתוני החתונה')
        } else {
          setWedding(weddingData as Wedding)
        }
        setLoading(false)
      }
    }

    loadWedding()
    return () => { cancelled = true }
  }, [user, authLoading])

  // Subscribe to wedding updates
  useEffect(() => {
    if (!wedding?.id || !getSupabaseConfig()) return

    const supabase = createClient()
    const channel = supabase
      .channel(`wedding:${wedding.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weddings',
          filter: `id=eq.${wedding.id}`,
        },
        (payload) => {
          setWedding(payload.new as Wedding)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [wedding?.id])

  const createWedding = useCallback(async (
    data: Omit<Wedding, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Wedding | null> => {
    if (!user || !getSupabaseConfig()) return null
    const supabase = createClient()

    const { data: newWedding, error: insertError } = await supabase
      .from('weddings')
      .insert({
        bride_name: data.bride_name,
        groom_name: data.groom_name,
        wedding_date: data.wedding_date,
        venue_name: data.venue_name,
        total_budget: data.total_budget,
        estimated_guests: data.estimated_guests,
      })
      .select()
      .single()

    if (insertError || !newWedding) {
      setError('שגיאה ביצירת החתונה')
      return null
    }

    // Add creator as owner
    await supabase
      .from('project_members')
      .insert({
        wedding_id: newWedding.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString(),
      })

    // Seed default categories
    const defaultCats = DEFAULT_GUEST_CATEGORIES.map(name => ({
      wedding_id: newWedding.id,
      name,
    }))
    await supabase.from('guest_categories').insert(defaultCats)

    const result = newWedding as Wedding
    setWedding(result)
    return result
  }, [user])

  const updateWedding = useCallback(async (updates: WeddingUpdate) => {
    if (!wedding || !getSupabaseConfig()) return
    const supabase = createClient()

    // Optimistic update
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
