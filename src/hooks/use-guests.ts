'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Guest, GuestInsert, GuestUpdate, GuestStats, RsvpStatus, GuestSide, GuestSortField, SortDirection } from '@/lib/types'
import { createClient, getSupabaseConfig } from '@/lib/supabase/client'
import { useRealtime } from './use-realtime'

function normalizeForDuplicateCheck(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function useGuests(weddingId: string | undefined) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSide, setFilterSide] = useState<GuestSide | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<RsvpStatus | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all')
  const [sortField, setSortField] = useState<GuestSortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const guestsRef = useRef(guests)
  guestsRef.current = guests

  // Fetch guests from Supabase
  useEffect(() => {
    if (!weddingId || !getSupabaseConfig()) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', weddingId!)
        .order('created_at', { ascending: true })

      if (!cancelled && !error && data) {
        setGuests(data as Guest[])
      }
      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [weddingId])

  // Real-time subscriptions
  useRealtime<Guest>('guests', weddingId, {
    onInsert: (newGuest) => {
      setGuests(prev =>
        prev.find(g => g.id === newGuest.id) ? prev : [...prev, newGuest]
      )
    },
    onUpdate: (updatedGuest) => {
      setGuests(prev => prev.map(g => {
        if (g.id !== updatedGuest.id) return g
        const incomingTime = new Date(updatedGuest.updated_at).getTime()
        const localTime = new Date(g.updated_at).getTime()
        return incomingTime >= localTime ? updatedGuest : g
      }))
    },
    onDelete: ({ id }) => {
      setGuests(prev => prev.filter(g => g.id !== id))
    },
  })

  const addGuest = useCallback(async (data: GuestInsert) => {
    const supabase = createClient()
    const { data: newGuest, error } = await supabase
      .from('guests')
      .insert({
        wedding_id: data.wedding_id,
        full_name: data.full_name,
        phone: data.phone,
        side: data.side,
        group_name: data.group_name,
        adults_count: data.adults_count,
        kids_count: data.kids_count,
        rsvp_status: data.rsvp_status,
        gift_amount: data.gift_amount ?? null,
        table_id: data.table_id ?? null,
        notes: data.notes,
      })
      .select()
      .single()

    if (!error && newGuest) {
      setGuests(prev =>
        prev.find(g => g.id === newGuest.id) ? prev : [...prev, newGuest as Guest]
      )
      return newGuest as Guest
    }
    return null
  }, [])

  const addGuestsBulk = useCallback(async (data: GuestInsert[]) => {
    const supabase = createClient()
    const rows = data.map(d => ({
      wedding_id: d.wedding_id,
      full_name: d.full_name,
      phone: d.phone,
      side: d.side,
      group_name: d.group_name,
      adults_count: d.adults_count,
      kids_count: d.kids_count,
      rsvp_status: d.rsvp_status,
      gift_amount: d.gift_amount ?? null,
      table_id: d.table_id ?? null,
      notes: d.notes,
    }))

    // Insert in batches of 100
    const BATCH = 100
    const allNew: Guest[] = []
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH)
      const { data: inserted, error } = await supabase
        .from('guests')
        .insert(batch)
        .select()

      if (!error && inserted) {
        allNew.push(...(inserted as Guest[]))
      }
    }

    if (allNew.length > 0) {
      setGuests(prev => {
        const existingIds = new Set(prev.map(g => g.id))
        const toAdd = allNew.filter(g => !existingIds.has(g.id))
        return [...prev, ...toAdd]
      })
    }
    return allNew
  }, [])

  const updateGuest = useCallback(async (id: string, updates: GuestUpdate) => {
    const supabase = createClient()
    const previous = guestsRef.current

    // Optimistic update
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))

    const { error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)

    if (error) {
      setGuests(previous)
    }
  }, [])

  const deleteGuest = useCallback(async (id: string) => {
    const supabase = createClient()
    const previous = guestsRef.current

    // Optimistic delete
    setGuests(prev => prev.filter(g => g.id !== id))

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)

    if (error) {
      setGuests(previous)
    }
  }, [])

  const stats: GuestStats = useMemo(() => {
    return guests.reduce<GuestStats>(
      (acc, g) => {
        acc.total++
        acc.totalAdults += g.adults_count
        acc.totalKids += g.kids_count
        if (g.rsvp_status === 'אישר') acc.confirmed++
        else if (g.rsvp_status === 'ביטל') acc.declined++
        else if (g.rsvp_status === 'אולי') acc.maybe++
        else acc.pending++
        if (g.gift_amount != null && g.gift_amount > 0) {
          acc.totalGiftAmount += g.gift_amount
          acc.giftCount++
        }
        return acc
      },
      { total: 0, confirmed: 0, declined: 0, pending: 0, maybe: 0, totalAdults: 0, totalKids: 0, totalGiftAmount: 0, giftCount: 0 }
    )
  }, [guests])

  const filteredGuests = useMemo(() => {
    let result = guests.filter(g => {
      if (search && !g.full_name.includes(search) && !g.phone?.includes(search)) return false
      if (filterSide !== 'all' && g.side !== filterSide) return false
      if (filterStatus !== 'all' && g.rsvp_status !== filterStatus) return false
      if (filterCategory !== 'all' && (g.group_name || '') !== filterCategory) return false
      return true
    })

    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        switch (sortField) {
          case 'full_name':
            cmp = a.full_name.localeCompare(b.full_name, 'he')
            break
          case 'group_name':
            cmp = (a.group_name || '').localeCompare(b.group_name || '', 'he')
            break
          case 'gift_amount': {
            const aVal = a.gift_amount ?? -1
            const bVal = b.gift_amount ?? -1
            cmp = aVal - bVal
            break
          }
          case 'rsvp_status':
            cmp = a.rsvp_status.localeCompare(b.rsvp_status, 'he')
            break
          case 'created_at':
            cmp = a.created_at.localeCompare(b.created_at)
            break
        }
        return sortDirection === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [guests, search, filterSide, filterStatus, filterCategory, sortField, sortDirection])

  const findDuplicates = useCallback((): Guest[][] => {
    const groups = new Map<string, Guest[]>()

    for (const guest of guests) {
      const nameKey = normalizeForDuplicateCheck(guest.full_name)
      const phoneKey = guest.phone ? guest.phone.replace(/[\s\-\(\)\.]/g, '') : null

      const key = phoneKey || nameKey
      const existing = groups.get(key)
      if (existing) {
        existing.push(guest)
      } else {
        groups.set(key, [guest])
      }
    }

    const nameGroups = new Map<string, Guest[]>()
    for (const guest of guests) {
      const nameKey = normalizeForDuplicateCheck(guest.full_name)
      const existing = nameGroups.get(nameKey)
      if (existing) {
        existing.push(guest)
      } else {
        nameGroups.set(nameKey, [guest])
      }
    }

    const allDuplicates = new Map<string, Guest[]>()
    for (const [, group] of groups) {
      if (group.length > 1) {
        const ids = group.map(g => g.id).sort().join(',')
        allDuplicates.set(ids, group)
      }
    }
    for (const [, group] of nameGroups) {
      if (group.length > 1) {
        const ids = group.map(g => g.id).sort().join(',')
        if (!allDuplicates.has(ids)) {
          allDuplicates.set(ids, group)
        }
      }
    }

    return Array.from(allDuplicates.values())
  }, [guests])

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
    filterCategory,
    setFilterCategory,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    addGuest,
    addGuestsBulk,
    updateGuest,
    deleteGuest,
    findDuplicates,
  }
}
