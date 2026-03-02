'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Guest, GuestInsert, GuestUpdate, GuestStats, RsvpStatus, GuestSide, GuestSortField, SortDirection } from '@/lib/types'
import { getStoredGuests, setStoredGuests } from '@/lib/storage'
import { generateId } from '@/lib/utils'

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

  useEffect(() => {
    if (!weddingId) return
    const stored = getStoredGuests().filter(g => g.wedding_id === weddingId)
    setGuests(stored)
    setLoading(false)
  }, [weddingId])

  const persist = useCallback((updated: Guest[]) => {
    const allGuests = getStoredGuests()
    const otherWeddings = allGuests.filter(g => g.wedding_id !== weddingId)
    setStoredGuests([...otherWeddings, ...updated])
  }, [weddingId])

  const addGuest = useCallback((data: GuestInsert) => {
    const newGuest: Guest = {
      ...data,
      gift_amount: data.gift_amount ?? null,
      table_id: data.table_id ?? null,
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
      gift_amount: d.gift_amount ?? null,
      table_id: d.table_id ?? null,
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

      // Try phone-based grouping first
      const key = phoneKey || nameKey
      const existing = groups.get(key)
      if (existing) {
        existing.push(guest)
      } else {
        groups.set(key, [guest])
      }
    }

    // Also check for name-based duplicates separately
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

    // Merge both duplicate sources
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
