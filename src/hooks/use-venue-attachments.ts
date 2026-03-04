'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { VenueAttachment } from '@/lib/types'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { uploadVenueAttachment, deleteVenueAttachment } from '@/lib/supabase/storage'

export function useVenueAttachments(venueId: string | undefined, weddingId: string | undefined) {
  const [attachments, setAttachments] = useState<VenueAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const attachmentsRef = useRef(attachments)
  attachmentsRef.current = attachments

  useEffect(() => {
    if (!venueId || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('venue_attachments')
        .select('*')
        .eq('venue_id', venueId!)
        .order('created_at', { ascending: true })

      if (!cancelled && !error && data) {
        setAttachments(data as VenueAttachment[])
      }
      if (!cancelled) setLoading(false)
    }

    load()

    // Realtime subscription filtered by venue_id
    const channel = supabase
      .channel(`venue_attachments:${venueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'venue_attachments',
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          const a = payload.new as VenueAttachment
          setAttachments(prev => prev.find(x => x.id === a.id) ? prev : [...prev, a])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'venue_attachments',
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          const old = payload.old as { id: string }
          setAttachments(prev => prev.filter(x => x.id !== old.id))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [venueId])

  const upload = useCallback(async (file: File) => {
    if (!venueId || !weddingId) return null
    setUploading(true)
    try {
      const attachment = await uploadVenueAttachment(venueId, weddingId, file)
      setAttachments(prev =>
        prev.find(x => x.id === attachment.id) ? prev : [...prev, attachment]
      )
      return attachment
    } finally {
      setUploading(false)
    }
  }, [venueId, weddingId])

  const remove = useCallback(async (attachmentId: string) => {
    const attachment = attachmentsRef.current.find(a => a.id === attachmentId)
    if (!attachment) return
    const previous = attachmentsRef.current
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
    try {
      await deleteVenueAttachment(attachment)
    } catch {
      setAttachments(previous)
    }
  }, [])

  return { attachments, loading, uploading, upload, remove }
}
