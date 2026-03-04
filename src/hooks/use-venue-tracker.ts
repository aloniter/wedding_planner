'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Venue, VenueInsert, VenueUpdate } from '@/lib/types'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useRealtime } from './use-realtime'

export function useVenueTracker(weddingId: string | undefined) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const venuesRef = useRef(venues)
  venuesRef.current = venues

  useEffect(() => {
    if (!weddingId || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('wedding_id', weddingId!)
        .order('created_at', { ascending: true })

      if (!cancelled && !error && data) {
        setVenues(data as Venue[])
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [weddingId])

  useRealtime<Venue>('venues', weddingId, {
    onInsert: (v) => setVenues(prev =>
      prev.find(x => x.id === v.id) ? prev : [...prev, v]
    ),
    onUpdate: (v) => setVenues(prev => prev.map(x => {
      if (x.id !== v.id) return x
      return new Date(v.updated_at) >= new Date(x.updated_at) ? v : x
    })),
    onDelete: ({ id }) => setVenues(prev => prev.filter(x => x.id !== id)),
  })

  const addVenue = useCallback(async (data: VenueInsert) => {
    const supabase = createClient()
    const { data: newVenue, error } = await supabase
      .from('venues')
      .insert(data)
      .select()
      .single()

    if (!error && newVenue) {
      setVenues(prev =>
        prev.find(v => v.id === newVenue.id) ? prev : [...prev, newVenue as Venue]
      )
      return newVenue as Venue
    }
    return null
  }, [])

  const updateVenue = useCallback(async (id: string, updates: VenueUpdate) => {
    const supabase = createClient()
    const previous = venuesRef.current
    setVenues(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))

    const { error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', id)

    if (error) {
      setVenues(previous)
    }
  }, [])

  const deleteVenue = useCallback(async (id: string) => {
    const supabase = createClient()
    const previous = venuesRef.current
    setVenues(prev => prev.filter(v => v.id !== id))

    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) {
      setVenues(previous)
    }
  }, [])

  const stats = useMemo(() => ({
    total: venues.length,
    liked: venues.filter(v => v.status === 'אהבנו').length,
    chosen: venues.filter(v => v.status === 'נבחר').length,
  }), [venues])

  return { venues, loading, stats, addVenue, updateVenue, deleteVenue }
}
