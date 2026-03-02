'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'

interface PresenceState {
  partnerOnline: boolean
  partnerEmail: string | null
}

export function usePresence(weddingId: string | undefined): PresenceState {
  const { user } = useAuth()
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!weddingId || !user) return

    const supabase = createClient()

    const channel = supabase.channel(`presence:${weddingId}`, {
      config: { presence: { key: user.id } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      // Check if anyone other than current user is present
      let foundPartner = false
      let foundEmail: string | null = null
      for (const [key, presences] of Object.entries(state)) {
        if (key !== user.id && presences.length > 0) {
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
          user_id: user.id,
          email: user.email,
          online_at: new Date().toISOString(),
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [weddingId, user])

  return { partnerOnline, partnerEmail }
}
