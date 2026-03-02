'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RealtimeCallbacks<T> {
  onInsert: (record: T) => void
  onUpdate: (record: T) => void
  onDelete: (old: { id: string }) => void
}

export function useRealtime<T>(
  table: string,
  weddingId: string | undefined,
  callbacks: RealtimeCallbacks<T>
) {
  const callbacksRef = useRef(callbacks)

  // Update ref without re-subscribing
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  useEffect(() => {
    if (!weddingId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`${table}:${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => callbacksRef.current.onInsert(payload.new as T)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => callbacksRef.current.onUpdate(payload.new as T)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => callbacksRef.current.onDelete(payload.old as { id: string })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, weddingId])
}
