'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PresenceState {
  partnerOnline: boolean
  partnerEmail: string | null
  viewerCount: number
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('visitor-id')
  if (!id) {
    id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('visitor-id', id)
  }
  return id
}

export function usePresence(weddingId: string | undefined): PresenceState {
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null)
  const [viewerCount, setViewerCount] = useState(0)
  const visitorIdRef = useRef<string>('')

  useEffect(() => {
    visitorIdRef.current = getVisitorId()
  }, [])

  useEffect(() => {
    if (!weddingId || !visitorIdRef.current) return

    const supabase = createClient()
    const visitorId = visitorIdRef.current

    const channel = supabase.channel(`presence:${weddingId}`, {
      config: { presence: { key: visitorId } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const keys = Object.keys(state)
      setViewerCount(keys.length)

      let foundPartner = false
      let foundEmail: string | null = null
      for (const [key, presences] of Object.entries(state)) {
        if (key !== visitorId && presences.length > 0) {
          foundPartner = true
          const presence = presences[0] as { email?: string }
          foundEmail = presence.email ?? null
          break
        }
      }
      setPartnerOnline(foundPartner)
      setPartnerEmail(foundEmail)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          visitor_id: visitorId,
          online_at: new Date().toISOString(),
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [weddingId])

  return { partnerOnline, partnerEmail, viewerCount }
}
