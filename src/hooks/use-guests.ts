'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Guest, GuestInsert, GuestUpdate, GuestStats, RsvpStatus, GuestSide } from '@/lib/types'
import { getStoredGuests, setStoredGuests } from '@/lib/storage'
import { generateId } from '@/lib/utils'

export function useGuests(weddingId: string | undefined) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSide, setFilterSide] = useState<GuestSide | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<RsvpStatus | 'all'>('all')

  useEffect(() => {
    if (!weddingId) return
    const stored = getStoredGuests().filter(g => g.wedding_id === weddingId)
    setGuests(stored)
    setLoading(false)
  }, [weddingId])

  const persist = useCallback((updated: Guest[]) => {
    // Persist all guests (including other weddings)
    const allGuests = getStoredGuests()
    const otherWeddings = allGuests.filter(g => g.wedding_id !== weddingId)
    setStoredGuests([...otherWeddings, ...updated])
  }, [weddingId])

  const addGuest = useCallback((data: GuestInsert) => {
    const newGuest: Guest = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    setGuests(prev => {
      const updated = [...prev, newGuest]
      persist(updated)
      return updated
    })
    return newGuest
  }, [persist])

  const addGuestsBulk = useCallback((data: GuestInsert[]) => {
    const newGuests: Guest[] = data.map(d => ({
      ...d,
      id: generateId(),
      created_at: new Date().toISOString(),
    }))
    setGuests(prev => {
      const updated = [...prev, ...newGuests]
      persist(updated)
      return updated
    })
    return newGuests
  }, [persist])

  const updateGuest = useCallback((id: string, updates: GuestUpdate) => {
    setGuests(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g)
      persist(updated)
      return updated
    })
  }, [persist])

  const deleteGuest = useCallback((id: string) => {
    setGuests(prev => {
      const updated = prev.filter(g => g.id !== id)
      persist(updated)
      return updated
    })
  }, [persist])

  const stats: GuestStats = useMemo(() => {
    return guests.reduce<GuestStats>(
      (acc, g) => {
        acc.total++
        acc.totalAdults += g.adults_count
        acc.totalKids += g.kids_count
        if (g.rsvp_status === 'אישר') acc.confirmed++
        else if (g.rsvp_status === 'ביטל') acc.declined++
        else acc.pending++
        return acc
      },
      { total: 0, confirmed: 0, declined: 0, pending: 0, totalAdults: 0, totalKids: 0 }
    )
  }, [guests])

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      if (search && !g.full_name.includes(search) && !g.phone?.includes(search)) return false
      if (filterSide !== 'all' && g.side !== filterSide) return false
      if (filterStatus !== 'all' && g.rsvp_status !== filterStatus) return false
      return true
    })
  }, [guests, search, filterSide, filterStatus])

  return {
    guests: filteredGuests,
    allGuests: guests,
    loading,
    stats,
    search,
    setSearch,
    filterSide,
    setFilterSide,
    filterStatus,
    setFilterStatus,
    addGuest,
    addGuestsBulk,
    updateGuest,
    deleteGuest,
  }
}
